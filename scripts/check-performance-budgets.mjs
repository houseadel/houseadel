#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const report = JSON.parse(await readFile(new URL("../docs/performance-results.json", import.meta.url), "utf8"));
const failures = [];

for (const result of report.results ?? []) {
  const mobile = Boolean(result.mobileEmulation);
  const lcp = result.paintMs?.largestContentfulPaint;
  const cls = result.cumulativeLayoutShift;
  const bytes = result.totalEncodedResourceBytes;
  const frameP95 = result.frameIntervalMs?.p95;
  const longestTask = result.longTasks?.maximumMs;

  if (typeof lcp === "number" && lcp > 2_500) failures.push(`${result.id}: LCP ${Math.round(lcp)} ms > 2500 ms`);
  if (typeof cls === "number" && cls > 0.1) failures.push(`${result.id}: CLS ${cls.toFixed(3)} > 0.10`);
  if (typeof bytes === "number" && bytes > 950 * 1024) {
    failures.push(`${result.id}: encoded resources ${Math.round(bytes / 1024)} KiB > 950 KiB`);
  }
  if (typeof frameP95 === "number" && frameP95 > (mobile ? 34 : 25)) {
    failures.push(`${result.id}: frame p95 ${frameP95.toFixed(1)} ms > ${mobile ? 34 : 25} ms`);
  }
  if (typeof longestTask === "number" && longestTask > 200) {
    failures.push(`${result.id}: longest task ${longestTask.toFixed(1)} ms > 200 ms`);
  }
  if ((result.consoleWarnings?.length ?? 0) > 0) {
    failures.push(`${result.id}: console warnings/errors: ${result.consoleWarnings.join(" | ")}`);
  }

  for (const canvas of result.canvases ?? []) {
    const dpr = canvas.cssWidth > 0 ? canvas.bufferWidth / canvas.cssWidth : 1;
    const cap = mobile ? 1.25 : 1.5;
    if (dpr > cap + 0.05) failures.push(`${result.id}: canvas DPR ${dpr.toFixed(2)} > ${cap}`);
  }
}

if (failures.length > 0) {
  console.error(`Performance budget failures:\n- ${failures.join("\n- ")}`);
  process.exitCode = 1;
} else {
  console.log(`Performance budgets passed for ${(report.results ?? []).length} measured cases.`);
}
