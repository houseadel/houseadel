import { expect, test } from "@playwright/test";

test.describe("real SVG-text loader lab", () => {
  test("uses critical readiness without presenting a fake percentage", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Canonical loader lifecycle uses Chromium");
    await page.addInitScript(() => window.sessionStorage.clear());
    await page.goto("/labs-loader?visit=first");

    const overlay = page.locator("[data-loader-overlay]");
    await expect(overlay).toHaveAttribute("data-loader-phase", "choice");
    await expect(overlay.getByRole("button", { name: "Continue without sound" })).toBeVisible();
    await expect(overlay.getByRole("button", { name: "Skip" })).toBeVisible();
    await expect(overlay).not.toContainText(/\b\d+%\b/);
    await overlay.getByRole("button", { name: "Continue without sound" }).click();
    await expect(page.locator("[data-loader-lab]")).toHaveAttribute("data-loader-complete", "true");
    await expect(page.locator("[data-loader-lab]")).toHaveAttribute("data-readiness", "settled");
    await expect(page.getByRole("heading", { name: /Readiness, held with ceremony/ })).toBeVisible();
    expect(await page.evaluate(() => window.sessionStorage.getItem("house-adel:loader-seen"))).toBe(
      "true",
    );
  });

  test("lets keyboard users skip and restores focus to the lab heading", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Canonical keyboard check uses Chromium");
    await page.goto("/labs-loader?visit=first&preview=loader");
    const skip = page.getByRole("button", { name: "Skip" });
    await expect(page.locator("[data-loader-overlay]")).toHaveAttribute("data-loader-phase", "preview");
    await skip.focus();
    await page.keyboard.press("Enter");

    await expect(page.locator("[data-loader-overlay]")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: /Readiness, held with ceremony/ })).toBeFocused();
  });

  test("uses a short resolving transition on repeat visits", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Canonical repeat check uses Chromium");
    await page.goto("/labs-loader?visit=repeat");
    await expect(page.locator("[data-loader-overlay]")).toHaveAttribute("data-visit", "repeat");
    await expect(page.locator("[data-loader-lab]")).toHaveAttribute("data-loader-complete", "true");
    await expect(page.locator("[data-loader-lab]")).toHaveAttribute("data-visit", "repeat");
  });

  test("keeps the mobile loader inside the viewport with a 44px skip target", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chromium", "Canonical mobile check uses Chromium");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/labs-loader?visit=first&preview=loader");
    await expect(page.locator("[data-loader-overlay]")).toHaveAttribute("data-loader-phase", "preview");
    const skipBounds = await page.getByRole("button", { name: "Skip" }).boundingBox();
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
    await page.goto("/labs-loader?visit=first");
    const lab = page.locator("[data-loader-lab]");
    await expect(lab).toHaveAttribute("data-loader-complete", "true");
    await expect(lab).toHaveAttribute("data-motion", "reduced");
    await expect(lab).toHaveAttribute("data-graphics", "fallback");
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: /Readiness, held with ceremony/ })).toBeVisible();
  });

  test("resolves a graphics failure into the complete poster composition", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Canonical fallback check uses Chromium");
    await page.addInitScript(() => {
      window.sessionStorage.clear();
      /*
       * `?graphics=fallback` is the *loader's* parameter and governs only the
       * loader. What decides whether the site mounts WebGL at all is the stored
       * preference, so the no-WebGL assertion at the end of this test needs it
       * set — without it the site's own liquid lens is present on this route and
       * the count is one, which is what it was measuring by accident.
       */
      window.localStorage.setItem("house-adel:graphics", "fallback");
    });
    await page.goto("/labs-loader?visit=first&graphics=fallback");
    const overlay = page.locator("[data-loader-overlay]");
    await expect(overlay).toHaveAttribute("data-loader-phase", "choice");
    await overlay.getByRole("button", { name: "Continue without sound" }).click();
    const lab = page.locator("[data-loader-lab]");
    await expect(lab).toHaveAttribute("data-loader-complete", "true");
    await expect(lab).toHaveAttribute("data-graphics", "fallback");
    await expect(page.getByAltText(/architectural drawing-room interior/)).toBeVisible();
    const webgl = await page.evaluate(() =>
      Array.from(document.querySelectorAll("canvas")).filter((c) =>
        Boolean(c.getContext("webgl2", { failIfMajorPerformanceCaveat: false }) ?? null),
      ).length,
    );
    expect(webgl).toBe(0);
  });

  test("the site opens by itself and takes sound only on a real gesture", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Canonical production opening uses Chromium");
    // The only test that boots the production loader on the real home page, so it
    // pays for readiness and for tearing down a live WebGL context.
    test.setTimeout(90_000);
    await page.addInitScript(() => window.sessionStorage.clear());
    await page.goto("/");

    // No gate: nothing is clicked here, and the overlay resolves on its own.
    const overlay = page.locator("[data-loader-overlay]");
    await expect(overlay).toHaveCount(0, { timeout: 20_000 });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Autoplay rules are still respected: sound is off until asked for, and the
    // cursor companion carries the control that asks.
    const companion = page.locator("[data-enabled]");
    await expect(companion).toHaveAttribute("data-enabled", "false");
    // Clicking empty page is the gesture the companion offers.
    await page.mouse.click(20, 400);
    await expect(companion).toHaveAttribute("data-enabled", "true");
  });
});
