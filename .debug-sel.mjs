import { chromium } from "@playwright/test";
const BASE = "http://127.0.0.1:5173";
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`${BASE}/contact`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1500);
const skip = page.getByRole("button", { name: /skip|lewati/i });
if (await skip.count()) await skip.first().click().catch(() => {});
await page.waitForTimeout(3500);
const out = await page.evaluate(async () => {
  const m = await import("/src/lib/interactive.ts");
  const button = document.querySelector("header nav button");
  const span = button?.querySelector("span") ?? null;
  let closestError = null;
  let closestResult = null;
  try {
    closestResult = span?.closest(m.INTERACTIVE_SELECTOR)?.tagName ?? null;
  } catch (e) { closestError = String(e); }
  // Which individual clause, if any, is broken?
  const broken = [];
  for (const clause of m.INTERACTIVE_SELECTOR.split(",")) {
    try { document.querySelector(clause); } catch (e) { broken.push([clause, String(e)]); }
  }
  return {
    selectorLength: m.INTERACTIVE_SELECTOR.length,
    selectorHead: m.INTERACTIVE_SELECTOR.slice(0, 120),
    hasButton: Boolean(button),
    spanTag: span?.tagName ?? null,
    spanIsElement: span instanceof Element,
    plainClosestButton: span?.closest("button")?.tagName ?? null,
    closestResult,
    closestError,
    broken,
    viaHelper: m.interactiveAncestor(span)?.tagName ?? null,
  };
});
console.log(JSON.stringify(out, null, 2));
await browser.close();
