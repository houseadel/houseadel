#!/usr/bin/env node

import { access, mkdir, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { relative, resolve } from "node:path";
import { chromium } from "@playwright/test";
import { preview } from "vite";

const HOST = "127.0.0.1";
const OUTPUT_DIRECTORY = resolve(
  process.cwd(),
  "output",
  "playwright",
  "final-production",
);

const VIEWPORTS = [
  { id: "desktop-1440x900", width: 1440, height: 900, mobile: false },
  { id: "laptop-1024x768", width: 1024, height: 768, mobile: false },
  { id: "mobile-430x932", width: 430, height: 932, mobile: true },
  { id: "mobile-390x844", width: 390, height: 844, mobile: true },
];

const ROUTES = [
  { id: "home", path: "/" },
  { id: "work", path: "/work" },
  { id: "studies", path: "/studies" },
  { id: "marvell-20", path: "/marvell-20" },
  { id: "contact", path: "/contact" },
  { id: "begin-a-project", path: "/begin-a-project" },
  { id: "enquiry-received-direct", path: "/enquiry-received" },
  { id: "privacy", path: "/privacy" },
  { id: "terms", path: "/terms" },
  { id: "not-found", path: "/not-a-route" },
];

const captures = [];
const startedAt = new Date();
let previewServer;
let browser;
let baseURL = "";
let failure;

function getAvailablePort() {
  return new Promise((resolvePort, reject) => {
    const reservation = createServer();
    reservation.unref();
    reservation.once("error", reject);
    reservation.listen(0, HOST, () => {
      const address = reservation.address();
      if (!address || typeof address === "string") {
        reservation.close();
        reject(new Error("Unable to reserve a local preview port."));
        return;
      }
      const { port } = address;
      reservation.close((error) => {
        if (error) reject(error);
        else resolvePort(port);
      });
    });
  });
}

async function waitForPreview(url) {
  const deadline = Date.now() + 15_000;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.ok) return;
      lastError = new Error(`Preview returned HTTP ${response.status}.`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  }
  throw lastError ?? new Error("Timed out waiting for the Vite preview.");
}

async function settlePage(page, path) {
  const response = await page.goto(`${baseURL}${path}`, {
    waitUntil: "networkidle",
    timeout: 20_000,
  });
  if (!response?.ok()) {
    throw new Error(`${path} returned HTTP ${response?.status() ?? "unknown"}.`);
  }

  await page.locator("[data-route-heading]").waitFor({ state: "visible" });
  await page
    .locator("[data-loader-overlay]")
    .waitFor({ state: "detached", timeout: 8_000 })
    .catch(() => undefined);
  await page.evaluate(async () => {
    await Promise.all([
      document.fonts.load('400 16px "Newsreader Variable"'),
      document.fonts.load('400 italic 16px "Newsreader Variable"'),
      document.fonts.load('400 16px "Manrope Variable"'),
    ]);
    await new Promise((resolveFrame) =>
      requestAnimationFrame(() => requestAnimationFrame(resolveFrame)),
    );
  });

  if (path === "/") {
    await page.evaluate(() => window.dispatchEvent(new Event("house-adel:request-graphics")));
    await page
      .waitForFunction(() => {
        const opening = document.querySelector("[data-spatial-opening]");
        return (
          !opening ||
          opening.getAttribute("data-graphics") === "ready" ||
          opening.getAttribute("data-spatial-motion") === "reduced" ||
          window.localStorage.getItem("house-adel:graphics") === "fallback"
        );
      }, undefined, { timeout: 8_000 })
      .catch(() => undefined);
  }
}

async function makeContext(viewport, options = {}) {
  return browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    screen: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    hasTouch: viewport.mobile,
    isMobile: viewport.mobile,
    colorScheme: "light",
    locale: "en-US",
    ...options,
  });
}

async function recordScreenshot(page, capture) {
  const absolutePath = resolve(OUTPUT_DIRECTORY, capture.file);
  if (!capture.fullPage) {
    // Give sticky/composited layers one complete capture cycle before the recorded frame.
    await page.screenshot({ animations: "disabled", caret: "hide", scale: "css" });
    await page.evaluate(
      () => new Promise((resolveFrame) => requestAnimationFrame(() => resolveFrame(undefined))),
    );
  }
  await page.screenshot({
    path: absolutePath,
    fullPage: capture.fullPage,
    animations: "disabled",
    caret: "hide",
    scale: "css",
  });
  captures.push({
    ...capture,
    file: relative(process.cwd(), absolutePath).replaceAll("\\", "/"),
    capturedAt: new Date().toISOString(),
  });
}

async function captureRoutes() {
  for (const viewport of VIEWPORTS) {
    const context = await makeContext(viewport);
    const page = await context.newPage();
    try {
      for (const route of ROUTES) {
        await settlePage(page, route.path);
        await recordScreenshot(page, {
          id: `${route.id}-${viewport.id}`,
          kind: "route",
          route: route.path,
          viewport: viewport.id,
          width: viewport.width,
          height: viewport.height,
          fullPage: true,
          file: `${route.id}-${viewport.width}x${viewport.height}.png`,
          title: await page.title(),
        });
      }
    } finally {
      await context.close();
    }
  }
}

async function captureIndonesianPrimaryRoutes() {
  const viewport = VIEWPORTS[0];
  const context = await makeContext(viewport);
  await context.addInitScript(() => {
    window.localStorage.setItem("house-adel:language", "id");
    window.sessionStorage.setItem("house-adel:loader-seen", "true");
  });
  const page = await context.newPage();
  try {
    // Home, Work, Studies and the project page. The slice grew with Studies
    // rather than sliding off the end of it: the project page was always in this
    // set, and a new chapter should be added to the Indonesian pass, not swapped
    // into it.
    for (const route of ROUTES.slice(0, 4)) {
      await settlePage(page, route.path);
      await recordScreenshot(page, {
        id: `${route.id}-id-${viewport.id}`,
        kind: "language-state",
        state: "indonesian",
        route: route.path,
        viewport: viewport.id,
        width: viewport.width,
        height: viewport.height,
        fullPage: true,
        file: `${route.id}-id-${viewport.width}x${viewport.height}.png`,
        title: await page.title(),
      });
    }
  } finally {
    await context.close();
  }
}

async function captureMobileNavigation() {
  const viewport = VIEWPORTS.find(({ id }) => id === "mobile-390x844");
  const context = await makeContext(viewport);
  const page = await context.newPage();
  try {
    await settlePage(page, "/");
    await page.locator('button[aria-controls="site-navigation"]').click();
    await page
      .getByRole("navigation", { name: "Primary navigation" })
      .getByRole("link", { name: /Work/ })
      .waitFor({ state: "visible" });
    await recordScreenshot(page, {
      id: "state-mobile-navigation-open-390x844",
      kind: "state",
      state: "mobile-navigation-open",
      route: "/",
      viewport: viewport.id,
      width: viewport.width,
      height: viewport.height,
      fullPage: false,
      file: "state-mobile-navigation-open-390x844.png",
      title: await page.title(),
    });
  } finally {
    await context.close();
  }
}

async function captureSpatialSequence(viewport) {
  const context = await makeContext(viewport);
  const page = await context.newPage();
  try {
    await settlePage(page, "/");
    const opening = page.locator("[data-spatial-opening]");
    const travel = await opening.evaluate(
      (element) =>
        element.getBoundingClientRect().height -
        window.innerHeight +
        (document.querySelector("header")?.getBoundingClientRect().height ?? 0),
    );
    const states = [
      { id: "master", progress: 0 },
      { id: "assembly", progress: 0.5 },
      { id: "passage", progress: 1 },
    ];

    for (const state of states) {
      await page.evaluate(
        ({ distance, progress }) => window.scrollTo(0, Math.max(0, distance * progress)),
        { distance: travel, progress: state.progress },
      );
      await page.waitForTimeout(700);
      const file =
        state.id === "master"
          ? `master-frame-${viewport.width}x${viewport.height}.png`
          : `home-spatial-${state.id}-${viewport.width}x${viewport.height}.png`;
      await recordScreenshot(page, {
        id: `state-home-spatial-${state.id}-${viewport.width}x${viewport.height}`,
        kind: state.id === "master" ? "master-frame" : "state",
        state: `spatial-${state.id}`,
        route: "/",
        viewport: viewport.id,
        width: viewport.width,
        height: viewport.height,
        fullPage: false,
        file,
        title: await page.title(),
      });
    }
  } finally {
    await context.close();
  }
}

async function captureApplyValidation() {
  const viewport = VIEWPORTS[0];
  const context = await makeContext(viewport);
  const page = await context.newPage();
  try {
    await settlePage(page, "/begin-a-project");
    await page.getByRole("button", { name: "Submit Enquiry" }).click();
    await page
      .getByText("Some required answers need attention. Nothing has been sent.")
      .waitFor({ state: "visible" });
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    });
    await recordScreenshot(page, {
      id: "state-apply-validation-1440x900",
      kind: "state",
      state: "enquiry-validation",
      route: "/begin-a-project",
      viewport: viewport.id,
      width: viewport.width,
      height: viewport.height,
      fullPage: true,
      file: "state-apply-validation-1440x900.png",
      title: await page.title(),
    });
  } finally {
    await context.close();
  }
}

async function captureReducedMotionHome() {
  const viewport = VIEWPORTS[0];
  const context = await makeContext(viewport, { reducedMotion: "reduce" });
  const page = await context.newPage();
  try {
    await settlePage(page, "/");
    await page.locator("canvas").waitFor({ state: "detached" }).catch(() => undefined);
    await recordScreenshot(page, {
      id: "state-home-reduced-motion-1440x900",
      kind: "state",
      state: "reduced-motion",
      route: "/",
      viewport: viewport.id,
      width: viewport.width,
      height: viewport.height,
      fullPage: true,
      file: "state-home-reduced-motion-1440x900.png",
      title: await page.title(),
    });
  } finally {
    await context.close();
  }
}

async function captureNoWebGLHome() {
  const viewport = VIEWPORTS[0];
  const context = await makeContext(viewport);
  await context.addInitScript(() => {
    window.localStorage.setItem("house-adel:graphics", "fallback");
  });
  const page = await context.newPage();
  try {
    await settlePage(page, "/");
    await page.locator("[data-spatial-fallback]").waitFor({ state: "visible" });
    if ((await page.locator("canvas").count()) !== 0) {
      throw new Error("No-WebGL capture unexpectedly rendered a canvas.");
    }
    await recordScreenshot(page, {
      id: "state-home-no-webgl-1440x900",
      kind: "state",
      state: "no-webgl",
      route: "/",
      viewport: viewport.id,
      width: viewport.width,
      height: viewport.height,
      fullPage: true,
      file: "state-home-no-webgl-1440x900.png",
      title: await page.title(),
    });
  } finally {
    await context.close();
  }
}

async function closePreview() {
  if (!previewServer?.httpServer.listening) return;
  await new Promise((resolveClose, reject) => {
    previewServer.httpServer.close((error) => {
      if (error) reject(error);
      else resolveClose();
    });
  });
}

async function writeManifest() {
  const manifest = {
    schemaVersion: 1,
    status: failure ? "failed" : "complete",
    generatedAt: new Date().toISOString(),
    startedAt: startedAt.toISOString(),
    baseURL,
    outputDirectory: relative(process.cwd(), OUTPUT_DIRECTORY).replaceAll("\\", "/"),
    viewports: VIEWPORTS,
    routes: ROUTES,
    captureCount: captures.length,
    captures,
    failure: failure
      ? {
          name: failure.name,
          message: failure.message,
        }
      : null,
  };
  await writeFile(
    resolve(OUTPUT_DIRECTORY, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
}

try {
  await access(resolve(process.cwd(), "dist", "index.html"));
  await mkdir(OUTPUT_DIRECTORY, { recursive: true });
  const port = await getAvailablePort();
  baseURL = `http://${HOST}:${port}`;
  previewServer = await preview({
    logLevel: "warn",
    preview: { host: HOST, port, strictPort: true },
  });
  await waitForPreview(baseURL);
  browser = await chromium.launch({ headless: true });

  await captureRoutes();
  await captureIndonesianPrimaryRoutes();
  await captureSpatialSequence(VIEWPORTS[0]);
  await captureMobileNavigation();
  await captureApplyValidation();
  await captureReducedMotionHome();
  await captureNoWebGLHome();
} catch (error) {
  failure = error instanceof Error ? error : new Error(String(error));
} finally {
  if (browser) await browser.close();
  await closePreview().catch((error) => {
    failure ??= error instanceof Error ? error : new Error(String(error));
  });
  await mkdir(OUTPUT_DIRECTORY, { recursive: true });
  await writeManifest();
}

if (failure) throw failure;

console.log(`Captured ${captures.length} production screenshots in ${OUTPUT_DIRECTORY}.`);
