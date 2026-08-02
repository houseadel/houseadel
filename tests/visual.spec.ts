import { expect, test } from "@playwright/test";

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

for (const [route, name] of canonicalPages) {
  test(`desktop visual: ${route}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Canonical desktop visual uses Chromium");
    await page.addInitScript(() => localStorage.setItem("house-adel:graphics", "fallback"));
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(route);
    await page.locator("[data-route-heading]").waitFor();
    await expect(page).toHaveScreenshot(`${name}-1440x900.png`, {
      animations: "disabled",
      fullPage: true,
    });
  });

  test(`mobile visual: ${route}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chromium", "Canonical mobile visual uses Chromium");
    await page.addInitScript(() => localStorage.setItem("house-adel:graphics", "fallback"));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route);
    await page.locator("[data-route-heading]").waitFor();
    await expect(page).toHaveScreenshot(`${name}-390x844.png`, {
      animations: "disabled",
      fullPage: true,
    });
  });
}

test("mobile navigation visual", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Canonical mobile visual uses Chromium");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator('button[aria-controls="mobile-navigation"]').click();
  await expect(page).toHaveScreenshot("navigation-open-390x844.png", { animations: "disabled" });
});

test("reduced-motion homepage visual", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "reduced-motion", "Reduced-motion project only");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page).toHaveScreenshot("home-reduced-motion-1440x900.png", {
    animations: "disabled",
  });
});
