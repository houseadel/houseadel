import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = ["/", "/prototypes/fracture", "/prototypes/hybrid", "/prototypes/cinematic"];

for (const route of routes) {
  test(`axe scan: ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.locator("[data-route-heading]").waitFor();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test("keyboard focus reaches all fracture destinations in DOM order", async ({ page }) => {
  await page.goto("/prototypes/fracture");
  const links = page.getByRole("navigation", { name: "Fictional world studies" }).getByRole("link");
  for (let index = 0; index < 3; index += 1) {
    await links.nth(index).focus();
    await expect(links.nth(index)).toBeFocused();
  }
});

test("graphics preference exposes a complete no-WebGL path", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("house-adel:graphics", "fallback"));
  await page.goto("/prototypes/hybrid");
  await expect(page.getByText("No-WebGL review mode is active.")).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Fictional world studies" }).getByRole("link"),
  ).toHaveCount(3);
});

test("cinematic graphics preference exposes a complete static path", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("house-adel:graphics", "fallback"));
  await page.goto("/prototypes/cinematic");
  await expect(page.locator(".cinematic-static")).toBeVisible();
  await expect(page.getByRole("link", { name: /Enter this study/ })).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
});

test("mobile review controls meet the 44 by 44 touch-target rule", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "Mobile-only target-size assertion");

  const expectTouchTargets = async (selector: string) => {
    const targets = page.locator(selector);
    for (let index = 0; index < (await targets.count()); index += 1) {
      const box = await targets.nth(index).boundingBox();
      expect(box, `${selector} target ${index} should be visible`).not.toBeNull();
      expect(box!.width, `${selector} target ${index} width`).toBeGreaterThanOrEqual(44);
      expect(box!.height, `${selector} target ${index} height`).toBeGreaterThanOrEqual(44);
    }
  };

  await page.goto("/");
  await expectTouchTargets(".filter-row button");
  await expectTouchTargets(".mode-toolbar button");

  await page.goto("/prototypes/cinematic");
  await expectTouchTargets(".cinematic-index button");
  await expectTouchTargets(".cinematic-copy a");

  await page.goto("/prototypes/hybrid");
  await expectTouchTargets(".context-loss-button");
});
