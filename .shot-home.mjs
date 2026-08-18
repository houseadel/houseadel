import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const OUT = process.env.SHOT_OUT ?? "./shots";
const BASE = process.env.SHOT_BASE ?? "http://127.0.0.1:5174";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(1500);
const skip = page.getByRole("button", { name: /skip|lewati/i });
if (await skip.count()) await skip.first().click({ timeout: 5000 }).catch(() => {});
await page.waitForTimeout(6000);

for (const [name, y] of [["top", 0], ["mid", 500], ["low", 900]]) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}/home-${name}.png`, timeout: 180000 });
  console.log("captured", name);
}
await browser.close();
