import { chromium } from "@playwright/test";

const BASE = process.env.SHOT_BASE ?? "http://127.0.0.1:5173";
const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("console", (m) => console.log(`[page:${m.type()}]`, m.text()));
await page.goto(`${BASE}/contact`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1200);
const skip = page.getByRole("button", { name: /skip|lewati/i });
if (await skip.count()) await skip.first().click().catch(() => {});
await page.waitForTimeout(4000);

// Ask the app's own module, not a paraphrase of it.
await page.evaluate(async () => {
  const module = await import("/src/lib/interactive.ts");
  window.__verdicts = [];
  window.addEventListener("click", (event) => {
    const target = event.target;
    window.__verdicts.push({
      target: target?.tagName?.toLowerCase?.() ?? String(target),
      background: module.isBackgroundClick(event),
      match: module.interactiveAncestor(target)?.tagName?.toLowerCase?.() ?? null,
      button: event.button,
      prevented: event.defaultPrevented,
    });
  });
});

const audio = () =>
  page.evaluate(() => {
    const el = document.querySelector("[data-house-adel-score]");
    return { present: Boolean(el), paused: el ? el.paused : null };
  });

for (const [name, selector] of [
  ["language button", "header nav button"],
  ["language button again", "header nav button"],
  ["whatsapp direct link", 'main a[href^="https://wa.me"]'],
]) {
  await page.evaluate(() => {
    window.__verdicts = [];
  });
  const locator = page.locator(selector).first();
  await locator.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(400);
  const box = await locator.boundingBox();
  await page.evaluate((s) => {
    const el = document.querySelector(s);
    if (el && el.tagName === "A") el.addEventListener("click", (e) => e.preventDefault(), { once: true });
  }, selector);
  const before = await audio();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(700);
  const after = await audio();
  console.log(
    `\n${name}\n  audio ${JSON.stringify(before)} -> ${JSON.stringify(after)} toggled=${before.paused !== after.paused || before.present !== after.present}` +
      `\n  verdicts=${JSON.stringify(await page.evaluate(() => window.__verdicts))}`,
  );
}

await browser.close();
