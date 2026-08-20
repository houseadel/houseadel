import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function waitForLoader(page: Page) {
  const overlay = page.locator("[data-loader-overlay]");
  await overlay.waitFor({ state: "detached", timeout: 3_000 }).catch(async () => {
    const continueButton = overlay.getByRole("button", { name: "Continue without sound" });
    if (await continueButton.isVisible().catch(() => false)) {
      await continueButton.click().catch(() => undefined);
    }
    await overlay.waitFor({ state: "detached", timeout: 5_000 }).catch(() => undefined);
  });
}

const routes = [
  "/",
  "/work",
  "/studies",
  "/marvell-20",
  "/contact",
  "/begin-a-project",
  "/enquiry-received",
  "/privacy",
  "/terms",
] as const;

for (const route of routes) {
  test(`axe scan: ${route}`, async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("house-adel:graphics", "fallback"));
    await page.goto(route);
    await page.locator("[data-route-heading]").waitFor();
    if (route.startsWith("/labs-loader")) {
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
  if (testInfo.project.name.includes("webkit")) {
    /*
     * `.focus()` on an element still `inert` while the opening finishes is a
     * silent no-op with nothing to retry it, unlike `Tab` below, which gets a
     * fresh attempt on every one of `toBeFocused`'s polls for free. Retrying
     * the call ourselves gives WebKit the same tolerance for a loader that is
     * still legitimately running.
     */
    await expect(async () => {
      await skipLink.focus();
      await expect(skipLink).toBeFocused();
    }).toPass({ timeout: 20_000 });
  } else {
    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();
  }
  await skipLink.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});
