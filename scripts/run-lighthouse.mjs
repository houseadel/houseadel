#!/usr/bin/env node

import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const repoRoot = process.cwd();
const port = 4177;
const baseURL = `http://127.0.0.1:${port}`;
const outputDirectory = path.join(repoRoot, "test-results", "lighthouse");
const summaryPath = path.join(repoRoot, "docs", "lighthouse-summary.json");
const routes = [
  { id: "home", path: "/" },
  { id: "editions", path: "/editions" },
  { id: "private-commissions", path: "/private-commissions" },
  { id: "apply", path: "/apply" },
];

function runProcess(executable, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, {
      cwd: repoRoot,
      windowsHide: true,
      stdio: "inherit",
      ...options,
    });
    child.stdout?.on("data", () => {});
    child.stderr?.on("data", () => {});
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${path.basename(executable)} exited with code ${code}.`));
    });
  });
}

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
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (processHandle.exitCode !== null) {
      throw new Error(`Vite preview exited with code ${processHandle.exitCode}.`);
    }
    try {
      const response = await fetch(baseURL);
      if (response.ok) return;
    } catch {
      // Keep polling within the bounded startup window.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Vite preview did not become ready.");
}

await mkdir(outputDirectory, { recursive: true });
const preview = startPreview();
try {
  await waitForPreview(preview);
  const reports = [];
  for (const route of routes) {
    const outputPath = path.join(outputDirectory, `${route.id}.json`);
    await rm(outputPath, { force: true });
    let launchError;
    try {
      await runProcess(
        process.execPath,
        [
          path.join(repoRoot, "node_modules", "lighthouse", "cli", "index.js"),
          `${baseURL}${route.path}`,
          "--quiet",
          "--output=json",
          `--output-path=${outputPath}`,
          "--only-categories=performance,accessibility,best-practices,seo",
          "--throttling-method=simulate",
          "--chrome-flags=--headless=new --no-sandbox --disable-gpu-sandbox",
        ],
        {
          env: {
            ...process.env,
            CHROME_PATH: chromium.executablePath(),
          },
          stdio: ["ignore", "pipe", "pipe"],
        },
      );
    } catch (error) {
      launchError = error;
    }
    let report;
    try {
      report = JSON.parse(await readFile(outputPath, "utf8"));
    } catch {
      throw launchError;
    }
    if (launchError) {
      console.warn(
        `${route.id}: Lighthouse wrote a complete report but its Windows temporary-profile ` +
          `cleanup returned nonzero (${launchError.message}).`,
      );
    }
    const result = {
      id: route.id,
      route: route.path,
      finalUrl: report.finalUrl,
      fetchTime: report.fetchTime,
      lighthouseVersion: report.lighthouseVersion,
      userAgent: report.userAgent,
      scores: Object.fromEntries(
        Object.entries(report.categories).map(([id, category]) => [id, category.score]),
      ),
      metrics: {
        firstContentfulPaintMs: report.audits["first-contentful-paint"]?.numericValue ?? null,
        largestContentfulPaintMs:
          report.audits["largest-contentful-paint"]?.numericValue ?? null,
        totalBlockingTimeMs: report.audits["total-blocking-time"]?.numericValue ?? null,
        cumulativeLayoutShift:
          report.audits["cumulative-layout-shift"]?.numericValue ?? null,
        speedIndexMs: report.audits["speed-index"]?.numericValue ?? null,
      },
    };
    reports.push(result);
    console.log(
      `${route.id}: performance ${Math.round((result.scores.performance ?? 0) * 100)}, ` +
        `accessibility ${Math.round((result.scores.accessibility ?? 0) * 100)}, ` +
        `LCP ${Math.round(result.metrics.largestContentfulPaintMs ?? 0)} ms`,
    );
  }
  await writeFile(
    summaryPath,
    `${JSON.stringify(
      {
        schemaVersion: "0.1.0",
        mode:
          "Lighthouse mobile simulation against a local Vite production preview; lab evidence, not field data",
        reports,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  console.log(`Wrote ${path.relative(repoRoot, summaryPath)}`);
} finally {
  if (preview.exitCode === null) preview.kill();
}
