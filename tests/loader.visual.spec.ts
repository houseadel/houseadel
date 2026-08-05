import { expect, test, type Page } from "@playwright/test";

async function warmLoaderLab(page: Page, route: string, completionSelector: string) {
  await page.goto(route, { waitUntil: "networkidle" });
  await page.locator(completionSelector).waitFor();
  await page.evaluate(async () => {
    await Promise.all([
      document.fonts.load('400 16px "Newsreader Variable"'),
      document.fonts.load('400 16px "Manrope Variable"'),
    ]);
  });
  await page.reload({ waitUntil: "networkidle" });
  await page.locator(completionSelector).waitFor();
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
}

test("loader overlay desktop visual", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Canonical desktop visual uses Chromium");
  await page.setViewportSize({ width: 1440, height: 900 });
  await warmLoaderLab(page, "/labs/loader?visit=first&preview=loader", "[data-loader-phase='preview']");
  await expect(page).toHaveScreenshot("loader-overlay-1440x900.png", { animations: "disabled" });
});

test("loader overlay mobile visual", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Canonical mobile visual uses Chromium");
  await page.setViewportSize({ width: 390, height: 844 });
  await warmLoaderLab(page, "/labs/loader?visit=first&preview=loader", "[data-loader-phase='preview']");
  await expect(page).toHaveScreenshot("loader-overlay-390x844.png", { animations: "disabled" });
});

test("loader fallback destination visual", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Canonical fallback visual uses Chromium");
  await page.setViewportSize({ width: 1440, height: 900 });
  await warmLoaderLab(
    page,
    "/labs/loader?visit=first&graphics=fallback",
    "[data-loader-complete='true']",
  );
  await expect(page).toHaveScreenshot("loader-fallback-1440x900.png", { animations: "disabled" });
});

test("loader reduced-motion destination visual", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "reduced-motion", "Reduced-motion project only");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await warmLoaderLab(page, "/labs/loader?visit=first", "[data-loader-complete='true']");
  await expect(page).toHaveScreenshot("loader-reduced-motion-1440x900.png", {
    animations: "disabled",
  });
});
