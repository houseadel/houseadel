import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/editions",
  "/editions/threshold",
  "/private-commissions",
  "/stories",
  "/stories/threshold-an-invitation-as-entrance",
  "/the-house",
  "/apply",
  "/application-received",
  "/privacy",
  "/terms",
] as const;

for (const route of routes) {
  test(`axe scan: ${route}`, async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("house-adel:graphics", "fallback"));
    await page.goto(route);
    await page.locator("[data-route-heading]").waitFor();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test("skip navigation reaches the main landmark", async ({ page }, testInfo) => {
  await page.goto("/");
  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  if (testInfo.project.name.includes("webkit")) {
    // Playwright WebKit on Windows does not emulate Safari's system-level full-keyboard-access
    // preference, so verify the same focus/activation path explicitly in that engine.
    await skipLink.focus();
  } else {
    await page.keyboard.press("Tab");
  }
  await expect(skipLink).toBeFocused();
  await skipLink.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("Stories exposes its visual stage through focus as well as hover", async ({ page }) => {
  await page.goto("/stories");
  const firstStory = page.getByRole("link", { name: /Threshold: an invitation as entrance/ });
  await firstStory.focus();
  await expect(firstStory).toBeFocused();
  if ((await page.viewportSize())!.width <= 1024) {
    await expect(
      firstStory
        .locator("xpath=ancestor::article")
        .getByRole("img"),
    ).toBeVisible();
    return;
  }
  await expect(
    page.getByRole("complementary", { name: /Visual plate for Threshold: an invitation as entrance/ }),
  ).toBeVisible();
});

test("mobile controls meet the 44 by 44 touch-target rule", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "Mobile-only target-size assertion");

  const expectTouchTarget = async (locator: ReturnType<typeof page.locator>, label: string) => {
    const box = await locator.boundingBox();
    expect(box, `${label} should be visible`).not.toBeNull();
    expect(box!.width, `${label} width`).toBeGreaterThanOrEqual(44);
    expect(box!.height, `${label} height`).toBeGreaterThanOrEqual(44);
  };

  await page.goto("/");
  const menu = page.getByRole("button", { name: /Menu/ });
  await expectTouchTarget(menu, "menu button");
  await menu.click();
  await expectTouchTarget(
    page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Apply" }),
    "mobile Apply link",
  );

  await page.goto("/editions/threshold");
  await expectTouchTarget(page.getByRole("button", { name: "Mobile" }), "preview size button");
  await expectTouchTarget(
    page.getByRole("navigation", { name: "Invitation sections" }).getByRole("button", { name: "RSVP" }),
    "preview RSVP button",
  );
});
