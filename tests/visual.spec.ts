import { expect, test, type Page } from "@playwright/test";

const canonicalPages = [
  ["/", "home"],
  ["/editions", "editions"],
  ["/editions/threshold", "edition-threshold"],
  ["/private-commissions", "private-commissions"],
  ["/stories", "stories"],
  ["/stories/threshold-an-invitation-as-entrance", "story-threshold"],
  ["/the-house", "the-house"],
  ["/apply", "apply"],
  ["/application-received", "application-received-direct"],
  ["/privacy", "privacy"],
  ["/terms", "terms"],
  ["/not-a-route", "not-found"],
] as const;

async function prepareVisualPage(page: Page, route: string) {
  await page.addInitScript(() => localStorage.setItem("house-adel:graphics", "fallback"));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route, { waitUntil: "networkidle" });
  await page.locator("[data-route-heading]").waitFor();
  // Warm the local type system, then reload so `font-display: optional` resolves to the
  // intended faces from the first layout pass instead of changing a long-page capture.
  await page.evaluate(async () => {
    await Promise.all([
      document.fonts.load('400 16px "Newsreader Variable"'),
      document.fonts.load('400 italic 16px "Newsreader Variable"'),
      document.fonts.load('400 16px "Manrope Variable"'),
    ]);
  });
  await page.reload({ waitUntil: "networkidle" });
  await page.locator("[data-route-heading]").waitFor();
  // Let deferred route modules and their reduced-motion setup reach a deterministic state.
  await page.waitForTimeout(2_200);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolveFrame) =>
      requestAnimationFrame(() => requestAnimationFrame(resolveFrame)),
    );
  });
}

for (const [route, name] of canonicalPages) {
  test(`desktop visual: ${route}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Canonical desktop visual uses Chromium");
    await page.setViewportSize({ width: 1440, height: 900 });
    await prepareVisualPage(page, route);
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

test("mobile navigation visual", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Canonical mobile visual uses Chromium");
  await page.setViewportSize({ width: 390, height: 844 });
  await prepareVisualPage(page, "/");
  await page.locator('button[aria-controls="mobile-navigation"]').click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Editions" })
    .waitFor();
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
