import { chromium } from "@playwright/test";
const B = "http://127.0.0.1:5174";
const VIEWPORTS = [
  { id: "1440x900", width: 1440, height: 900, mobile: false },
  { id: "1024x768", width: 1024, height: 768, mobile: false },
  { id: "430x932", width: 430, height: 932, mobile: true },
  { id: "390x844", width: 390, height: 844, mobile: true },
];
const browser = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] });

for (const v of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: v.width, height: v.height },
    isMobile: v.mobile, hasTouch: v.mobile, deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  // Ink lab
  await page.goto(`${B}/labs/ink-resolve`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2600);
  await page.screenshot({ path: `output/labs/shot-ink-${v.id}.png`, fullPage: false });
  // Relief lab
  await page.goto(`${B}/labs/morphing-relief`, { waitUntil: "networkidle" });
  await page.waitForTimeout(4200);
  await page.screenshot({ path: `output/labs/shot-relief-${v.id}.png`, fullPage: false });
  // Combined
  await page.goto(`${B}/labs/house-adel-opening`, { waitUntil: "networkidle" });
  await page.waitForTimeout(4200);
  await page.screenshot({ path: `output/labs/shot-opening-${v.id}.png`, fullPage: false });
  await ctx.close();
  console.log("captured", v.id);
}

// Reduced motion
const rm = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce", deviceScaleFactor: 1 });
const rmPage = await rm.newPage();
await rmPage.goto(`${B}/labs/ink-resolve`, { waitUntil: "networkidle" });
await rmPage.waitForTimeout(1800);
const rmInfo = await rmPage.locator("h2").first().evaluate((el) => ({
  split: el.querySelectorAll(":scope > div").length, filter: el.style.filter || "none",
}));
console.log("reduced-motion ink:", JSON.stringify(rmInfo), "(split should be 0, filter none)");
await rmPage.screenshot({ path: "output/labs/shot-ink-reduced-1440x900.png" });
await rmPage.goto(`${B}/labs/morphing-relief`, { waitUntil: "networkidle" });
await rmPage.waitForTimeout(3500);
await rmPage.screenshot({ path: "output/labs/shot-relief-reduced-1440x900.png" });
await rm.close();

// No-WebGL fallback
const nog = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const nogPage = await nog.newPage();
await nogPage.addInitScript(() => {
  const orig = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    if (String(type).includes("webgl")) return null;
    return orig.call(this, type, ...rest);
  };
});
await nogPage.goto(`${B}/labs/morphing-relief`, { waitUntil: "networkidle" });
await nogPage.waitForTimeout(2500);
console.log("no-webgl fallbacks:", await nogPage.locator("[data-relief-fallback]").count(), "canvases:", await nogPage.locator("canvas").count());
await nogPage.screenshot({ path: "output/labs/shot-relief-nowebgl-1440x900.png" });
await nog.close();

// Remount / navigation survival + context count
const nav = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const navPage = await nav.newPage();
const errs = [];
navPage.on("pageerror", (e) => errs.push(e.message));
for (let i = 0; i < 3; i++) {
  await navPage.goto(`${B}/labs/morphing-relief`, { waitUntil: "networkidle" });
  await navPage.waitForTimeout(1500);
  await navPage.goto(`${B}/labs/ink-resolve`, { waitUntil: "networkidle" });
  await navPage.waitForTimeout(800);
}
await navPage.goto(`${B}/labs/morphing-relief`, { waitUntil: "networkidle" });
await navPage.waitForTimeout(2000);
console.log("after 3 nav cycles -> canvases:", await navPage.locator("canvas").count(), "errors:", errs.length ? errs.join("|") : "NONE");
await nav.close();
await browser.close();
