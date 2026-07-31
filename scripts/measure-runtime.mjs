#!/usr/bin/env node

import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { chromium } from "@playwright/test";

const repoRoot = process.cwd();
const port = 4176;
const baseURL = `http://127.0.0.1:${port}`;
const outputPath = path.join(repoRoot, "docs", "performance-results.json");
const cases = [
  { id: "home-desktop", route: "/", viewport: { width: 1440, height: 900 } },
  {
    id: "fracture-desktop",
    route: "/prototypes/fracture",
    viewport: { width: 1440, height: 900 },
  },
  {
    id: "hybrid-desktop",
    route: "/prototypes/hybrid",
    viewport: { width: 1440, height: 900 },
  },
  {
    id: "cinematic-desktop",
    route: "/prototypes/cinematic",
    viewport: { width: 1440, height: 900 },
  },
  {
    id: "fracture-mobile",
    route: "/prototypes/fracture",
    viewport: { width: 390, height: 844 },
    mobile: true,
  },
  {
    id: "hybrid-mobile",
    route: "/prototypes/hybrid",
    viewport: { width: 390, height: 844 },
    mobile: true,
  },
  {
    id: "cinematic-mobile",
    route: "/prototypes/cinematic",
    viewport: { width: 390, height: 844 },
    mobile: true,
  },
];

function startPreview() {
  return spawn(
    process.execPath,
    [
      path.join(repoRoot, "node_modules", "vite", "bin", "vite.js"),
      "preview",
      "--host",
      "127.0.0.1",
      "--port",
      String(port),
      "--strictPort",
    ],
    {
      cwd: repoRoot,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
}

async function waitForPreview(processHandle) {
  let lastError;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (processHandle.exitCode !== null) {
      throw new Error(`Vite preview exited with code ${processHandle.exitCode}.`);
    }
    try {
      const response = await fetch(baseURL);
      if (response.ok) return;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Vite preview did not become ready: ${lastError?.message ?? "timeout"}`);
}

function percentile(values, fraction) {
  if (!values.length) return null;
  const ordered = [...values].sort((a, b) => a - b);
  return ordered[Math.min(ordered.length - 1, Math.floor(ordered.length * fraction))];
}

function kindForPath(pathname) {
  if (/\.js$/i.test(pathname)) return "javascript";
  if (/\.css$/i.test(pathname)) return "css";
  if (/\.(?:avif|webp|png|jpe?g|gif|svg)$/i.test(pathname)) return "image";
  if (/\.(?:woff2?|ttf|otf)$/i.test(pathname)) return "font";
  if (/\.(?:mp4|webm|mov)$/i.test(pathname)) return "video";
  if (/\.(?:glb|gltf|ktx2?)$/i.test(pathname)) return "model";
  return "other";
}

async function gzipBytesForResource(url) {
  const parsed = new URL(url);
  if (!parsed.pathname.startsWith("/assets/")) return 0;
  if (!/\.(?:js|css)$/i.test(parsed.pathname)) return 0;
  const localPath = path.join(repoRoot, "dist", ...parsed.pathname.split("/").filter(Boolean));
  try {
    return gzipSync(await readFile(localPath)).byteLength;
  } catch {
    return 0;
  }
}

async function measureCase(browser, testCase) {
  const context = await browser.newContext({
    viewport: testCase.viewport,
    deviceScaleFactor: testCase.mobile ? 2 : 1,
    isMobile: Boolean(testCase.mobile),
    hasTouch: Boolean(testCase.mobile),
    reducedMotion: "no-preference",
  });
  await context.addInitScript(() => {
    window.__houseAdelMetrics = { cls: 0, lcp: 0, longTasks: [] };
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__houseAdelMetrics.lcp = entry.startTime;
        }
      }).observe({ type: "largest-contentful-paint", buffered: true });
    } catch {
      // Unsupported performance entry types remain null in the report.
    }
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) window.__houseAdelMetrics.cls += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    } catch {
      // Unsupported performance entry types remain null in the report.
    }
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__houseAdelMetrics.longTasks.push(entry.duration);
        }
      }).observe({ type: "longtask", buffered: true });
    } catch {
      // Unsupported performance entry types remain null in the report.
    }
  });

  const page = await context.newPage();
  const consoleWarnings = [];
  page.on("console", (message) => {
    if (message.type() === "warning" || message.type() === "error") {
      consoleWarnings.push(message.text());
    }
  });
  await page.goto(`${baseURL}${testCase.route}`, { waitUntil: "load" });
  await page.locator("[data-route-heading]").waitFor({ state: "visible" });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(750);

  const browserMetrics = await page.evaluate(async () => {
    const navigation = performance.getEntriesByType("navigation")[0];
    const resources = performance.getEntriesByType("resource").map((entry) => ({
      name: entry.name,
      initiatorType: entry.initiatorType,
      transferSize: entry.transferSize,
      encodedBodySize: entry.encodedBodySize,
      decodedBodySize: entry.decodedBodySize,
      duration: entry.duration,
    }));
    const paintEntries = Object.fromEntries(
      performance.getEntriesByType("paint").map((entry) => [entry.name, entry.startTime]),
    );
    const imageDecodeBytes = [...document.images].reduce(
      (total, image) => total + image.naturalWidth * image.naturalHeight * 4,
      0,
    );
    const canvases = [...document.querySelectorAll("canvas")].map((canvas) => ({
      cssWidth: canvas.getBoundingClientRect().width,
      cssHeight: canvas.getBoundingClientRect().height,
      bufferWidth: canvas.width,
      bufferHeight: canvas.height,
    }));
    const frameIntervals = await new Promise((resolve) => {
      const values = [];
      let previous = 0;
      const sample = (now) => {
        if (previous) values.push(now - previous);
        previous = now;
        if (values.length >= 90) resolve(values);
        else requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    return {
      navigation: {
        responseStart: navigation?.responseStart ?? null,
        domContentLoaded: navigation?.domContentLoadedEventEnd ?? null,
        load: navigation?.loadEventEnd ?? null,
      },
      paints: {
        firstPaint: paintEntries["first-paint"] ?? null,
        firstContentfulPaint: paintEntries["first-contentful-paint"] ?? null,
        largestContentfulPaint: window.__houseAdelMetrics?.lcp || null,
      },
      cumulativeLayoutShift: window.__houseAdelMetrics?.cls ?? null,
      longTasks: window.__houseAdelMetrics?.longTasks ?? [],
      resources,
      imageDecodeBytes,
      canvases,
      frameIntervals,
      devicePixelRatio: window.devicePixelRatio,
      fallbackActive: Boolean(
        document.querySelector(".hybrid-fallback, .cinematic-static"),
      ),
    };
  });

  const resourceTotals = {
    javascript: 0,
    css: 0,
    image: 0,
    font: 0,
    video: 0,
    model: 0,
    other: 0,
  };
  let gzipCodeBytes = 0;
  const uniqueResources = new Map();
  for (const resource of browserMetrics.resources) {
    const pathname = new URL(resource.name).pathname;
    if (!uniqueResources.has(resource.name)) {
      uniqueResources.set(resource.name, resource);
      resourceTotals[kindForPath(pathname)] +=
        resource.encodedBodySize || resource.transferSize || 0;
      gzipCodeBytes += await gzipBytesForResource(resource.name);
    }
  }

  const textureResources = [...uniqueResources.keys()]
    .map((resource) => new URL(resource).pathname)
    .filter((pathname) => /\/assets\/worlds\/.+-(?:480|960|1440)\.webp$/i.test(pathname));
  const textureGpuBytesEstimate = textureResources.reduce((total, pathname) => {
    const width = Number(pathname.match(/-(480|960|1440)\.webp$/i)?.[1] ?? 0);
    const height = Math.round((width * 941) / 1672);
    return total + Math.round(width * height * 4 * (4 / 3));
  }, 0);
  const canvasGpuBytesEstimate = browserMetrics.canvases.reduce(
    (total, canvas) => total + canvas.bufferWidth * canvas.bufferHeight * 12,
    0,
  );

  const result = {
    id: testCase.id,
    route: testCase.route,
    viewport: testCase.viewport,
    mobileEmulation: Boolean(testCase.mobile),
    devicePixelRatio: browserMetrics.devicePixelRatio,
    navigationMs: browserMetrics.navigation,
    paintMs: browserMetrics.paints,
    cumulativeLayoutShift: browserMetrics.cumulativeLayoutShift,
    resourceBytes: resourceTotals,
    totalEncodedResourceBytes: Object.values(resourceTotals).reduce(
      (sum, value) => sum + value,
      0,
    ),
    gzipCodeBytes,
    domImageDecodeBytes: browserMetrics.imageDecodeBytes,
    textureGpuBytesEstimate,
    canvasGpuBytesEstimate,
    combinedGpuBytesEstimate: textureGpuBytesEstimate + canvasGpuBytesEstimate,
    frameIntervalMs: {
      median: percentile(browserMetrics.frameIntervals, 0.5),
      p95: percentile(browserMetrics.frameIntervals, 0.95),
      maximum: Math.max(...browserMetrics.frameIntervals),
    },
    longTasks: {
      count: browserMetrics.longTasks.length,
      maximumMs: browserMetrics.longTasks.length
        ? Math.max(...browserMetrics.longTasks)
        : 0,
    },
    canvases: browserMetrics.canvases,
    fallbackActive: browserMetrics.fallbackActive,
    consoleWarnings: [...new Set(consoleWarnings)],
  };
  await context.close();
  return result;
}

const preview = startPreview();
let browser;
try {
  await waitForPreview(preview);
  browser = await chromium.launch();
  const results = [];
  for (const testCase of cases) {
    const result = await measureCase(browser, testCase);
    results.push(result);
    console.log(
      `${result.id}: ${Math.round(result.totalEncodedResourceBytes / 1024)} KiB, ` +
        `LCP ${Math.round(result.paintMs.largestContentfulPaint ?? 0)} ms, ` +
        `frame p95 ${result.frameIntervalMs.p95?.toFixed(1) ?? "n/a"} ms`,
    );
  }
  const report = {
    schemaVersion: "0.1.0",
    measuredAt: new Date().toISOString(),
    mode: "Vite production preview; cold isolated browser context per route",
    environment: {
      platform: `${os.platform()} ${os.release()}`,
      cpu: os.cpus()[0]?.model ?? "unknown",
      logicalCpus: os.cpus().length,
      totalMemoryBytes: os.totalmem(),
      browser: `Chromium ${browser.version()}`,
      note:
        "GPU allocation is estimated from loaded textures and canvas buffers; browser/driver overhead is not observable here.",
    },
    interpretation: {
      lcpCls: "Local lab observations, not 75th-percentile field Core Web Vitals.",
      inp:
        "No field INP is reported because the Phase 1 lab has no real-user interaction population.",
      frameTime:
        "requestAnimationFrame cadence in headless Chromium; physical integrated-GPU and mobile traces remain required before production.",
    },
    results,
  };
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`Wrote ${path.relative(repoRoot, outputPath)}`);
} finally {
  await browser?.close();
  if (preview.exitCode === null) preview.kill();
}
