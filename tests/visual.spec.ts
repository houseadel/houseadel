import { expect, test, type Page } from "@playwright/test";

const canonicalPages = [
  ["/", "home"],
  ["/work", "work"],
  ["/commissions", "commissions"],
] as const;

async function prepareVisualPage(page: Page, route: string) {
  await page.addInitScript(() => {
    localStorage.setItem("house-adel:graphics", "fallback");
    localStorage.setItem("house-adel:language", "en");
    sessionStorage.setItem("house-adel:loader-seen", "true");
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(async () => {
    await Promise.all([
      document.fonts.load('400 16px "Newsreader Variable"'),
      document.fonts.load('400 italic 16px "Newsreader Variable"'),
      document.fonts.load('400 16px "Manrope Variable"'),
    ]);
  });
  await page.goto(route, { waitUntil: "networkidle" });
  await page.locator("[data-route-heading]").waitFor();
  if (route === "/commissions") {
    await page.getByRole("button", { name: "Review application" }).waitFor();
  }
  await page.locator("[data-loader-overlay]").waitFor({ state: "detached", timeout: 5_000 }).catch(() => undefined);
  await page.evaluate(async () => {
    await Promise.all([
      document.fonts.load('400 16px "Newsreader Variable"'),
      document.fonts.load('400 italic 16px "Newsreader Variable"'),
      document.fonts.load('400 16px "Manrope Variable"'),
    ]);
    await new Promise((resolveFrame) => requestAnimationFrame(() => requestAnimationFrame(resolveFrame)));
  });
  await page.waitForFunction(async () => {
    const first = document.documentElement.scrollHeight;
    await new Promise((resolve) => setTimeout(resolve, 250));
    return document.documentElement.scrollHeight === first;
  });
}

for (const [route, name] of canonicalPages) {
  test(`desktop visual: ${route}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Canonical desktop visual uses Chromium");
    await page.setViewportSize({ width: 1440, height: 900 });
    await prepareVisualPage(page, route);
    if (route === "/commissions") {
      await expect(page.locator("body")).toHaveScreenshot(`${name}-1440x900.png`, {
        animations: "disabled",
      });
      return;
    }
    await expect(page).toHaveScreenshot(`${name}-1440x900.png`, {
      animations: "disabled",
      fullPage: true,
    });
  });

  test(`mobile visual: ${route}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chromium", "Canonical mobile visual uses Chromium");
    await page.setViewportSize({ width: 390, height: 844 });
    await prepareVisualPage(page, route);
    await expect(page).toHaveScreenshot(`${name}-390x844.png`, {
      animations: "disabled",
      fullPage: true,
    });
  });
}

test("navigation visual", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Canonical mobile visual uses Chromium");
  await page.setViewportSize({ width: 390, height: 844 });
  await prepareVisualPage(page, "/");
  await page.getByRole("button", { name: "Menu" }).click();
  await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: /Work/ }).waitFor();
  await expect(page).toHaveScreenshot("navigation-open-390x844.png", { animations: "disabled" });
});

test("reduced-motion homepage visual", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "reduced-motion", "Reduced-motion project only");
  await page.setViewportSize({ width: 1440, height: 900 });
  await prepareVisualPage(page, "/");
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page).toHaveScreenshot("home-reduced-motion-1440x900.png", {
    animations: "disabled",
  });
});
