import { test } from "@playwright/test";
test("solid", async ({ page }) => {
  test.setTimeout(200_000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    try { window.sessionStorage.setItem("house-adel:loader-seen", "true"); } catch { /* ignore */ }
  });
  await page.goto("/");
  await page.waitForTimeout(4500);
  await page.screenshot({ path: "output/o-top.png", timeout: 60_000 });
  // Part way through the chapter: it should have turned and lagged the type.
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.4));
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "output/o-turned.png", timeout: 60_000 });
  console.log("ERRORS=" + (errors.length ? errors.join(" | ") : "none"));
});
