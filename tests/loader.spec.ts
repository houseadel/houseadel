import { expect, test } from "@playwright/test";

test.describe("real SVG-text loader lab", () => {
  test("uses critical readiness without presenting a fake percentage", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Canonical loader lifecycle uses Chromium");
    await page.addInitScript(() => window.sessionStorage.clear());
    await page.goto("/labs/loader?visit=first");

    const overlay = page.locator("[data-loader-overlay]");
    await expect(overlay).toHaveAttribute("data-loader-phase", "animating");
    await expect(overlay.getByRole("button", { name: "Skip animation" })).toBeVisible();
    await expect(overlay).not.toContainText(/\b\d+%\b/);
    await expect(page.locator("[data-loader-lab]")).toHaveAttribute("data-loader-complete", "true");
    await expect(page.locator("[data-loader-lab]")).toHaveAttribute("data-readiness", "settled");
    await expect(page.getByRole("heading", { name: /Readiness, held with ceremony/ })).toBeVisible();
    expect(await page.evaluate(() => window.sessionStorage.getItem("house-adel:loader-seen"))).toBe(
      "true",
    );
  });

  test("lets keyboard users skip and restores focus to the lab heading", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Canonical keyboard check uses Chromium");
    await page.goto("/labs/loader?visit=first&preview=loader");
    const skip = page.getByRole("button", { name: "Skip animation" });
    await expect(page.locator("[data-loader-overlay]")).toHaveAttribute("data-loader-phase", "preview");
    await skip.focus();
    await page.keyboard.press("Enter");

    await expect(page.locator("[data-loader-overlay]")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: /Readiness, held with ceremony/ })).toBeFocused();
  });

  test("uses a short resolving transition on repeat visits", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Canonical repeat check uses Chromium");
    await page.goto("/labs/loader?visit=repeat");
    await expect(page.locator("[data-loader-overlay]")).toHaveAttribute("data-visit", "repeat");
    await expect(page.locator("[data-loader-lab]")).toHaveAttribute("data-loader-complete", "true");
    await expect(page.locator("[data-loader-lab]")).toHaveAttribute("data-visit", "repeat");
  });

  test("keeps the mobile loader inside the viewport with a 44px skip target", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chromium", "Canonical mobile check uses Chromium");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/labs/loader?visit=first&preview=loader");
    await expect(page.locator("[data-loader-overlay]")).toHaveAttribute("data-loader-phase", "preview");
    const skipBounds = await page.getByRole("button", { name: "Skip animation" }).boundingBox();
    expect(skipBounds?.height).toBeGreaterThanOrEqual(44);
    expect(skipBounds?.x).toBeGreaterThanOrEqual(0);
    expect((skipBounds?.x ?? 0) + (skipBounds?.width ?? 0)).toBeLessThanOrEqual(390);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("removes travel and canvas work when motion is reduced", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "reduced-motion", "Reduced-motion project only");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/labs/loader?visit=first");
    const lab = page.locator("[data-loader-lab]");
    await expect(lab).toHaveAttribute("data-loader-complete", "true");
    await expect(lab).toHaveAttribute("data-motion", "reduced");
    await expect(lab).toHaveAttribute("data-graphics", "fallback");
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: /Readiness, held with ceremony/ })).toBeVisible();
  });

  test("resolves a graphics failure into the complete poster composition", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Canonical fallback check uses Chromium");
    await page.goto("/labs/loader?visit=first&graphics=fallback");
    const lab = page.locator("[data-loader-lab]");
    await expect(lab).toHaveAttribute("data-loader-complete", "true");
    await expect(lab).toHaveAttribute("data-graphics", "fallback");
    await expect(page.getByAltText(/architectural drawing-room interior/)).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(0);
  });
});
