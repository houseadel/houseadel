import { expect, test } from "@playwright/test";

test("review hero visual", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Canonical visual baseline uses Chromium");
  await page.goto("/");
  await expect(page.locator(".review-hero")).toHaveScreenshot("review-hero.png");
});

for (const [route, name] of [
  ["/prototypes/fracture", "prototype-a-fracture.png"],
  ["/prototypes/hybrid", "prototype-b-hybrid.png"],
  ["/prototypes/cinematic", "prototype-c-cinematic.png"],
] as const) {
  test(`visual: ${route}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Canonical visual baseline uses Chromium");
    await page.emulateMedia({ reducedMotion: "reduce" });
    if (route !== "/prototypes/fracture") {
      await page.addInitScript(() => localStorage.setItem("house-adel:graphics", "fallback"));
    }
    await page.goto(route);
    await page.locator("[data-route-heading]").waitFor();
    if (route !== "/prototypes/fracture") {
      await expect(page.locator("html")).toHaveAttribute("data-graphics", "fallback");
      await expect(page.locator("canvas")).toHaveCount(0);
    }
    await expect(page.locator(".prototype-stage")).toHaveScreenshot(name, {
      animations: "disabled",
    });
  });
}

for (const [route, name] of [
  ["/prototypes/fracture", "prototype-a-fracture-mobile.png"],
  ["/prototypes/hybrid", "prototype-b-hybrid-mobile.png"],
  ["/prototypes/cinematic", "prototype-c-cinematic-mobile.png"],
] as const) {
  test(`mobile visual: ${route}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chromium", "Canonical mobile baseline uses Chromium");
    await page.emulateMedia({ reducedMotion: "reduce" });
    if (route !== "/prototypes/fracture") {
      await page.addInitScript(() => localStorage.setItem("house-adel:graphics", "fallback"));
    }
    await page.goto(route);
    await page.locator("[data-route-heading]").waitFor();
    if (route !== "/prototypes/fracture") {
      await expect(page.locator("html")).toHaveAttribute("data-graphics", "fallback");
      await expect(page.locator("canvas")).toHaveCount(0);
    }
    await expect(page.locator(".prototype-stage")).toHaveScreenshot(name, {
      animations: "disabled",
    });
  });
}
