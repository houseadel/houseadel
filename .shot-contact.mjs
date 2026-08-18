import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const OUT = process.env.SHOT_OUT ?? "./shots";
const BASE = process.env.SHOT_BASE ?? "http://127.0.0.1:5174";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});

async function run(label, viewport, isMobile) {
  const ctx = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    isMobile,
    hasTouch: isMobile,
  });
  const page = await ctx.newPage();
  page.on("console", (m) => {
    if (m.type() === "error") console.log(`[${label}] console error:`, m.text());
  });
  page.on("pageerror", (e) => console.log(`[${label}] page error:`, e.message));

  await page.goto(`${BASE}/contact`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(1500);
  const skip = page.getByRole("button", { name: /skip|lewati/i });
  if (await skip.count()) await skip.first().click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(6000);

  for (const [name, y] of [["top", 0], ["mid", 900], ["low", 2000], ["end", 4200]]) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
    await page.waitForTimeout(2200);
    await page.screenshot({ path: `${OUT}/${label}-${name}.png`, timeout: 180000 });
    console.log("captured", `${label}-${name}`);
  }
  await ctx.close();
}

await run("desktop", { width: 1440, height: 900 }, false);
await run("mobile", { width: 390, height: 844 }, true);

await browser.close();
