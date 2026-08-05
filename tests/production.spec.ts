import { expect, test, type Page } from "@playwright/test";

async function waitForLoader(page: Page) {
  await page.locator("[data-loader-overlay]").waitFor({ state: "detached", timeout: 7_000 }).catch(() => undefined);
}

const routeCases = [
  ["/", "Wedding websites, composed as private worlds."],
  ["/work", "The work, when it is ready."],
  ["/commissions", "Begin with your world."],
  ["/application-received", "Submission not confirmed."],
  ["/privacy", "Privacy, plainly stated."],
  ["/terms", "Terms of use."],
] as const;

test.describe("production routes", () => {
  for (const [route, heading] of routeCases) {
    test(`${route} has a direct, usable document route`, async ({ page }) => {
      await page.goto(route);
      await waitForLoader(page);
      await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
      await expect(page.getByRole("link", { name: "House Adel, home" })).toBeVisible();

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }

  test("uses a truthful not-found document", async ({ page }) => {
    await page.goto("/not-a-route");
    await waitForLoader(page);
    await expect(page.getByRole("heading", { name: "This room is not on the plan." })).toBeVisible();
  });
});

test.describe("navigation, language and sound", () => {
  test("preserves internal Back and Forward navigation", async ({ page }) => {
    await page.goto("/");
    await waitForLoader(page);
    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: /Work/ }).click();
    await expect(page).toHaveURL(/\/work$/);
    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: /Commissions/ }).click();
    await expect(page).toHaveURL(/\/commissions$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/work$/);
    await page.goForward();
    await expect(page).toHaveURL(/\/commissions$/);
  });

  test("opens and closes the navigation with keyboard-safe state", async ({ page }) => {
    await page.goto("/");
    await waitForLoader(page);
    const menu = page.locator('button[aria-controls="site-navigation"]');
    await menu.click();
    await expect(menu).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: /Home/ })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await expect(menu).toBeFocused();
  });

  test("switches EN/ID content and enables sound only after explicit input", async ({ page }) => {
    await page.goto("/");
    await waitForLoader(page);
    const sound = page.locator('header button[aria-pressed]');
    await expect(sound).toHaveAttribute("aria-pressed", "false");
    await sound.click();
    await expect(sound).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Change language to Indonesian" }).click();
    await expect(page.getByRole("heading", { name: "Situs pernikahan, digubah menjadi dunia privat." })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "id");
    await page.goto("/commissions#application");
    await waitForLoader(page);
    await page.getByRole("button", { name: "Tinjau pengajuan" }).click();
    await expect(page.getByText("Beberapa jawaban wajib perlu diperiksa. Belum ada yang dikirim.")).toBeVisible();
    await expect(page.getByText("Bidang ini wajib diisi.").first()).toBeVisible();
    await page.goto("/application-received");
    await expect(page.getByRole("heading", { name: "Pengiriman belum dikonfirmasi." })).toBeVisible();
  });
});

test.describe("homepage capability and resilience", () => {
  test("exposes capability changes through a pressed button and live readout", async ({ page }) => {
    await page.goto("/");
    await waitForLoader(page);
    const development = page.getByRole("button", { name: "Development" });
    await development.click();
    await expect(development).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("heading", { name: "Development", level: 3 })).toBeVisible();
  });

  test("keeps all homepage information when motion is reduced", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "reduced-motion", "Reduced-motion project only");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await waitForLoader(page);
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "One invitation, read through four layers." })).toBeVisible();
    await expect(page.getByRole("link", { name: "Begin a commission" }).first()).toBeVisible();
  });

  test("keeps the static opening when WebGL is explicitly disabled", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("house-adel:graphics", "fallback"));
    await page.goto("/");
    await waitForLoader(page);
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.locator("[data-spatial-fallback]")).toBeVisible();
  });

  test("does not load the WebGL runtime on Work", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Canonical route-loading check uses Chromium");
    const requestedAssets: string[] = [];
    page.on("request", (request) => requestedAssets.push(request.url()));
    await page.goto("/work");
    await waitForLoader(page);
    await page.waitForLoadState("networkidle");
    expect(requestedAssets.some((url) => /\/assets\/webgl-[^/]+\.js/.test(url))).toBe(false);
  });
});

test.describe("commission application", () => {
  test("shows meaningful errors before review", async ({ page }) => {
    await page.goto("/commissions#application");
    await waitForLoader(page);
    await page.getByRole("button", { name: "Review application" }).click();
    await expect(page.getByText("Some required answers need attention. Nothing has been sent.")).toBeVisible();
    await expect(page.getByLabel(/Applicant name/)).toHaveAttribute("aria-invalid", "true");
  });

  test("reviews and receives an explicit local mock acceptance", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "One canonical mock submission");
    await page.goto("/commissions#application");
    await waitForLoader(page);
    await page.getByLabel(/Applicant name/).fill("Ari Example");
    await page.getByLabel(/Partner or project names/).fill("Ari and Sol");
    await page.getByLabel(/Location/).fill("Jakarta");
    await page.getByLabel(/Approximate guest count/).selectOption("50-100");
    await page.getByLabel(/Number of events/).selectOption("two");
    await page.getByRole("checkbox", { name: "Digital invitation" }).check();
    await page.getByLabel(/What should guests feel/).fill("Warm, composed and unmistakably personal.");
    await page.getByLabel(/Project path/).selectOption("private-commission");
    await page.getByLabel(/Budget range/).fill("USD 12,000–18,000");
    await page.getByLabel(/Languages/).fill("English and Indonesian");
    await page.getByLabel(/Contact name/).fill("Ari Example");
    await page.getByLabel(/^Email/).fill("ari@example.com");
    await page.getByLabel(/Country/).fill("Indonesia");
    await page.getByLabel(/Time zone/).fill("Asia/Jakarta");
    await page.getByLabel(/I consent to House Adel/).check();
    await page.getByRole("button", { name: "Review application" }).click();
    await expect(page.getByRole("heading", { name: "Review the living brief." })).toBeFocused();
    await page.getByRole("button", { name: "Send application" }).click();
    await expect(page).toHaveURL(/\/application-received\?confirmed=1&mode=mock$/);
    await expect(page.getByRole("heading", { name: "Your application has been received." })).toBeVisible();
  });
});
