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

      const layout = await page.evaluate(() => {
        const viewportWidth = document.documentElement.clientWidth;
        return {
          overflow: document.documentElement.scrollWidth - viewportWidth,
          viewportWidth,
          scrollWidth: document.documentElement.scrollWidth,
          bodyWidth: document.body.scrollWidth,
          activeElement: document.activeElement
            ? `${document.activeElement.tagName.toLowerCase()}.${(document.activeElement as HTMLElement).className}`
            : null,
          offenders: [...document.querySelectorAll<HTMLElement>("body *")]
            .map((element) => {
              const bounds = element.getBoundingClientRect();
              return {
                element: `${element.tagName.toLowerCase()}.${element.className}`,
                left: Math.round(bounds.left * 10) / 10,
                right: Math.round(bounds.right * 10) / 10,
              };
            })
            .filter(({ left, right }) => left < -1 || right > viewportWidth + 1)
            .slice(0, 8),
          internallyWide: [...document.querySelectorAll<HTMLElement>("body *")]
            .filter((element) => element.scrollWidth > element.clientWidth + 1)
            .map((element) => ({
              element: `${element.tagName.toLowerCase()}.${element.className}`,
              clientWidth: element.clientWidth,
              scrollWidth: element.scrollWidth,
            }))
            .slice(0, 12),
        };
      });
      expect(layout.overflow, JSON.stringify(layout)).toBeLessThanOrEqual(1);
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

test.describe("Living Brief application", () => {
  test("shows meaningful errors before review", async ({ page }) => {
    await page.goto("/apply");
    await page.getByRole("button", { name: "Review application" }).click();
    await expect(page.getByText("Some required answers need attention. Nothing has been sent.")).toBeVisible();
    await expect(page.getByText("Applicant name is required.")).toBeVisible();
    await expect(page.getByLabel("Applicant name")).toHaveAttribute("aria-invalid", "true");
  });

  test("reviews and receives an explicit local mock acceptance", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "One canonical non-persistent mock submission");
    await page.goto("/apply");
    await page.getByLabel("Applicant name").fill("Ari Example");
    await page.getByLabel("Partner or project names").fill("Ari and Sol");
    await page.getByLabel("Location").fill("Jakarta");
    await page.getByLabel("Approximate guest count").selectOption("50-100");
    await page.getByLabel("Number of events").selectOption("two");
    await page.getByLabel("Digital invitation").check();
    await page
      .getByLabel("What should guests feel when opening the invitation?")
      .fill("Warm, composed and unmistakably personal.");
    await page.getByLabel("Project path").selectOption("edition");
    await page.getByLabel("Budget range").fill("USD 3,000–6,000");
    await page.getByLabel("Languages").fill("English");
    await page.getByLabel("Confidentiality needs").selectOption("standard");
    await page.getByLabel("Contact name").fill("Ari Example");
    await page.getByLabel("Email").fill("ari@example.com");
    await page.getByLabel("Preferred contact method").selectOption("email");
    await page.getByLabel("Country").fill("Indonesia");
    await page.getByLabel("Time zone").fill("Asia/Jakarta");
    await page.getByLabel(/I consent to House Adel/).check();

    await page.getByRole("button", { name: "Review application" }).click();
    await expect(page.getByRole("heading", { name: "Review the living brief." })).toBeFocused();
    await expect(page.getByText("Ari and Sol").first()).toBeVisible();
    await page.getByRole("button", { name: "Send application" }).click();
    await expect(page).toHaveURL(/\/application-received\?confirmed=1&mode=mock$/);
    await expect(
      page.getByRole("heading", { name: "Your application has been received." }),
    ).toBeVisible();
    await expect(page.getByText(/We review every project personally\./)).toBeVisible();
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

test.describe("spatial enhancement lifecycle", () => {
  test("resolves the graphics capability gate without runtime errors", async ({ page }) => {
    const runtimeErrors: string[] = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") runtimeErrors.push(message.text());
    });

    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.evaluate(() => window.dispatchEvent(new Event("house-adel:request-graphics")));
    await expect(page.locator("[data-spatial-opening]")).toHaveAttribute(
      "data-graphics",
      /ready|fallback/,
      { timeout: 15_000 },
    );
    expect(runtimeErrors).toEqual([]);
  });

  test("scrubs reversibly and cleans up when the route changes", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Canonical WebGL lifecycle uses Chromium");

    await page.goto("/");
    const opening = page.locator("[data-spatial-opening]");
    await page.evaluate(() => window.dispatchEvent(new Event("house-adel:request-graphics")));
    await expect(opening).toHaveAttribute("data-graphics", "ready", { timeout: 15_000 });
    await expect(page.locator("canvas[data-spatial-webgl='ready']")).toHaveCount(1);

    const openingTravel = await opening.evaluate(
      (element) =>
        element.getBoundingClientRect().height -
        window.innerHeight +
        (document.querySelector("header")?.getBoundingClientRect().height ?? 0),
    );
    await page.evaluate((distance) => window.scrollTo(0, Math.max(1, distance)), openingTravel);
    await page.waitForTimeout(700);
    await expect
      .poll(async () => Number((await opening.getAttribute("data-spatial-progress")) ?? 0))
      .toBeGreaterThan(0.85);

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(700);
    await expect
      .poll(async () => Number((await opening.getAttribute("data-spatial-progress")) ?? 1))
      .toBeLessThan(0.08);

    await page
      .getByRole("navigation", { name: "Primary navigation" })
      .getByRole("link", { name: "Editions" })
      .click();
    await expect(page).toHaveURL(/\/editions$/);
    await expect(page.locator("canvas")).toHaveCount(0);

    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await page.evaluate(() => window.dispatchEvent(new Event("house-adel:request-graphics")));
    await expect(page.locator("canvas[data-spatial-webgl='ready']")).toHaveCount(1, {
      timeout: 15_000,
    });
  });

  test("does not load the WebGL runtime on editorial routes", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Canonical route-loading check uses Chromium");
    const requestedAssets: string[] = [];
    page.on("request", (request) => requestedAssets.push(request.url()));

    await page.goto("/editions");
    await page.waitForLoadState("networkidle");

    expect(requestedAssets.some((url) => /\/assets\/webgl-[^/]+\.js/.test(url))).toBe(false);
    await expect(page.locator("canvas")).toHaveCount(0);
  });

  test("keeps the semantic opening visible while WebGL loads slowly", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Canonical slow-load check uses Chromium");
    let delayed = false;
    await page.route(/\/assets\/webgl-[^/]+\.js/, async (route) => {
      delayed = true;
      await new Promise((resolve) => setTimeout(resolve, 900));
      await route.continue();
    });

    await page.goto("/");
    await expect(page.locator("[data-spatial-fallback]")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.evaluate(() => window.dispatchEvent(new Event("house-adel:request-graphics")));
    await expect.poll(() => delayed).toBe(true);
    await expect(page.locator("[data-spatial-opening]")).toHaveAttribute("data-graphics", "ready", {
      timeout: 15_000,
    });
  });
});
