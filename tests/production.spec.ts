import { expect, test } from "@playwright/test";

const routeCases = [
  ["/", "Digital invitations and private worlds for singular celebrations."],
  ["/editions", "Original worlds, composed to become personal."],
  ["/editions/threshold", "Threshold"],
  ["/private-commissions", "Created once. Never repeated."],
  ["/stories", "The thinking inside the work."],
  ["/stories/threshold-an-invitation-as-entrance", "Threshold: an invitation as entrance"],
  ["/the-house", "A practice drawn around the occasion."],
  ["/apply", "Begin with what matters."],
  ["/application-received", "Submission not confirmed."],
  ["/privacy", "Privacy, plainly stated."],
  ["/terms", "Terms of use."],
] as const;

test.describe("production routes", () => {
  for (const [route, heading] of routeCases) {
    test(`${route} has a direct, usable document route`, async ({ page }) => {
      await page.goto(route);
      await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
      await expect(page.getByRole("link", { name: "House Adel, home" })).toBeVisible();

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }

  test("uses a truthful not-found document", async ({ page }) => {
    const response = await page.goto("/not-a-route");
    expect(response?.ok()).toBe(true);
    await expect(page.getByRole("heading", { name: "This room is not on the plan." })).toBeVisible();
  });
});

test.describe("navigation and history", () => {
  test("preserves internal Back and Forward navigation", async ({ page }, testInfo) => {
    await page.goto("/");
    if (testInfo.project.name.startsWith("mobile")) {
      await page.locator('button[aria-controls="mobile-navigation"]').click();
      await page
        .getByRole("navigation", { name: "Mobile navigation" })
        .getByRole("link", { name: "Editions" })
        .click();
    } else {
      await page
        .getByRole("navigation", { name: "Primary navigation" })
        .getByRole("link", { name: "Editions" })
        .click();
    }
    await expect(page).toHaveURL(/\/editions$/);
    await page.getByRole("link", { name: /Open Threshold/ }).click();
    await expect(page).toHaveURL(/\/editions\/threshold$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/editions$/);
    await page.goForward();
    await expect(page).toHaveURL(/\/editions\/threshold$/);
  });

  test("opens and closes the mobile navigation with keyboard-safe state", async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.startsWith("mobile"), "Mobile navigation assertion");
    await page.goto("/");
    const menu = page.locator('button[aria-controls="mobile-navigation"]');
    await expect(menu).toContainText("Menu");
    await menu.click();
    await expect(menu).toHaveAttribute("aria-expanded", "true");
    const mobileNavigation = page.getByRole("navigation", { name: "Mobile navigation" });
    await expect(mobileNavigation.getByRole("link", { name: "Editions" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await expect(menu).toBeFocused();
  });
});

test.describe("Edition demonstration", () => {
  test("personalises, navigates and records only a local RSVP demonstration", async ({ page }) => {
    await page.goto("/editions/threshold");
    await page.getByLabel("First sample name").fill("Ari");
    await page.getByLabel("Second sample name").fill("Sol");
    await page.getByLabel("Sample guest name").fill("Mira");
    await expect(page.getByRole("heading", { name: /Ari.*Sol/ })).toBeVisible();

    await page
      .getByRole("navigation", { name: "Invitation sections" })
      .getByRole("button", { name: "Order of the day" })
      .click();
    await expect(page.getByRole("heading", { name: "The gathering" })).toBeVisible();
    await page.getByRole("button", { name: "RSVP" }).last().click();
    await page.getByLabel("Joyfully attending").check();
    await page.getByRole("button", { name: "Confirm sample response" }).click();
    await expect(page.getByRole("status")).toContainText("preview only");
  });
});

test.describe("resilience", () => {
  test("keeps all homepage information when motion is reduced", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "reduced-motion", "Reduced-motion project only");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "The starting point changes everything." })).toBeVisible();
    await expect(page.getByRole("link", { name: "Apply for a project" })).toBeVisible();
  });

  test("keeps the static opening when WebGL is explicitly disabled", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("house-adel:graphics", "fallback"));
    await page.goto("/");
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.locator("[data-spatial-fallback]")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("survives rapid scrolling and resizing without horizontal overflow", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight);
      window.scrollTo(0, 0);
      window.scrollTo(0, document.documentElement.scrollHeight * 0.55);
    });
    await page.setViewportSize({ width: 430, height: 932 });
    await page.setViewportSize({ width: 1024, height: 768 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
