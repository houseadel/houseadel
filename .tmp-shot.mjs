import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const OUT = process.env.SHOT_OUT;
const BASE = "http://127.0.0.1:5174";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();

async function enter(path) {
  await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(1500);
  const skip = page.getByRole("button", { name: /skip|lewati/i });
  if (await skip.count()) {
    await skip.first().click({ timeout: 5000 }).catch(() => {});
  }
  await page.waitForTimeout(5000);
}

async function shot(name, scrollPx) {
  if (scrollPx) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), scrollPx);
    await page.waitForTimeout(3000);
  }
  await page.screenshot({ path: `${OUT}/${name}.png`, timeout: 180000 });
  console.log("captured", name);
}

await enter("/");
await shot("home-top", 0);
await shot("home-2", 700);
await shot("home-3", 1600);

await enter("/work");
await shot("work-top", 0);
await shot("work-2", 1200);
await shot("work-3", 2600);

await browser.close();
