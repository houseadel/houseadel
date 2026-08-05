import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function waitForLoader(page: Page) {
  await page.locator("[data-loader-overlay]").waitFor({ state: "detached", timeout: 7_000 }).catch(() => undefined);
}

const routes = [
  "/",
  "/work",
  "/commissions",
  "/application-received",
  "/privacy",
  "/terms",
  "/labs/loader?visit=repeat&graphics=fallback",
] as const;

for (const route of routes) {
  test(`axe scan: ${route}`, async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("house-adel:graphics", "fallback"));
    await page.goto(route);
    await page.locator("[data-route-heading]").waitFor();
    if (route.startsWith("/labs/loader")) {
      await page.locator("[data-loader-complete='true']").waitFor();
    } else {
      await waitForLoader(page);
    }
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test("skip navigation reaches the main landmark", async ({ page }, testInfo) => {
  await page.goto("/");
  await waitForLoader(page);
  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  if (testInfo.project.name.includes("webkit")) await skipLink.focus();
  else await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();
  await skipLink.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("capability hover has equivalent focus and press behavior", async ({ page }) => {
  await page.goto("/");
  await waitForLoader(page);
  const button = page.getByRole("button", { name: "Motion" });
  await button.focus();
  await button.press("Enter");
  await expect(button).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { name: "Motion", level: 3 })).toBeVisible();
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
  await waitForLoader(page);
  const menu = page.getByRole("button", { name: "Menu" });
  await expectTouchTarget(menu, "menu button");
  await menu.click();
  await expectTouchTarget(
    page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: /Commissions/ }),
    "Commissions menu link",
  );
});
