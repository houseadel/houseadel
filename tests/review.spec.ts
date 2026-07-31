import { expect, test } from "@playwright/test";

test.describe("direction lab", () => {
  test("presents the evidence and all decision options", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Evidence before identity." })).toBeVisible();
    await expect(page.getByText("The Private Occasion Atelier")).toBeVisible();
    await expect(page.getByText("The Focused Digital Experience Studio")).toBeVisible();
    await expect(page.getByRole("link", { name: /Open full-screen test/ })).toHaveCount(3);
    await expect(page.locator("main")).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("keeps prototype routes deep-linkable and history-safe", async ({ page }) => {
    await page.goto("/prototypes/fracture");
    await expect(page.getByRole("heading", { name: "SVG / DOM fracture" })).toBeVisible();
    const links = page.getByRole("navigation", { name: "Fictional world studies" }).getByRole("link");
    await expect(links).toHaveCount(3);
    await links.nth(1).click();
    await expect(page).toHaveURL(/\/studies\/listening-garden\?from=fracture$/);
    await expect(page.getByRole("heading", { name: "The Listening Garden" })).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(/\/prototypes\/fracture$/);
    await expect(page.getByRole("heading", { name: "SVG / DOM fracture" })).toBeVisible();
    await page.goForward();
    await expect(page).toHaveURL(/\/studies\/listening-garden\?from=fracture$/);
    await expect(page.getByRole("heading", { name: "The Listening Garden" })).toBeVisible();
  });

  test("focuses a cold lazy-loaded prototype heading", async ({ page }) => {
    await page.goto("/prototypes/cinematic");
    await expect(page.getByRole("heading", { name: "Cinematic compositing" })).toBeFocused();
  });

  test("lets a newer fracture destination supersede an in-flight transition", async ({ page }) => {
    await page.goto("/prototypes/fracture");
    const links = page
      .getByRole("navigation", { name: "Fictional world studies" })
      .getByRole("link");
    await expect(links).toHaveCount(3);
    await links.evaluateAll((links) => {
      links[0]?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      links[2]?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    });
    await expect(page).toHaveURL(/\/studies\/room-no-8\?from=fracture$/);
  });

  test("keeps semantic destinations usable while portal images are slow", async ({ page }) => {
    await page.route("**/assets/worlds/*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      await route.continue();
    });
    await page.goto("/prototypes/fracture", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("navigation", { name: "Fictional world studies" }).getByRole("link"),
    ).toHaveCount(3);
    await expect(page.getByRole("link", { name: /Afterlight/ })).toBeVisible();
  });

  test("activates the semantic fallback when WebGL fails", async ({ page }) => {
    await page.goto("/prototypes/hybrid");
    await expect(page.getByRole("heading", { name: "Hybrid WebGL glass" })).toBeVisible();
    const simulateFailure = page.getByRole("button", { name: "Simulate WebGL failure" });
    const fallbackMessage = page.getByText(/DOM\/SVG fallback (?:is active|was activated)|activated the DOM\/SVG fallback/);

    await expect(simulateFailure.or(fallbackMessage).first()).toBeVisible();
    if (await simulateFailure.isVisible()) {
      await simulateFailure.click({ timeout: 2_000 }).catch(async () => {
        await expect(fallbackMessage).toBeVisible();
      });
    }

    await expect(fallbackMessage).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Fictional world studies" }).getByRole("link"),
    ).toHaveCount(3);
  });

  test("keeps cinematic preview controls separate from direct links", async ({ page }) => {
    await page.goto("/prototypes/cinematic");
    await expect(page.getByRole("heading", { name: "Cinematic compositing" })).toBeVisible();
    await page.getByRole("button", { name: /The Listening Garden/ }).click();
    await expect(page.getByRole("heading", { name: "The Listening Garden" })).toBeVisible();
    await page.getByRole("link", { name: /Enter this study/ }).click();
    await expect(page).toHaveURL(/\/studies\/listening-garden\?from=cinematic$/);
  });

  test("keeps destinations reachable when a portal image fails", async ({ page }) => {
    await page.route("**/afterlight-portal-01-*", (route) => route.abort("failed"));
    await page.goto("/prototypes/fracture");
    await expect(page.getByRole("link", { name: /Afterlight/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /The Listening Garden/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Room No. 8/ })).toBeVisible();
  });

  test("does not leak canvases across repeated route cycles", async ({ page }) => {
    const expectSingleRuntime = async () => {
      await expect(page.locator("canvas, .hybrid-fallback").first()).toBeVisible();
      expect(await page.locator("canvas").count()).toBeLessThanOrEqual(1);
    };

    await page.goto("/prototypes/hybrid");
    await expectSingleRuntime();
    for (let index = 0; index < 3; index += 1) {
      await page.getByRole("link", { name: /Direction lab/ }).click();
      await expect(page.locator("canvas")).toHaveCount(0);
      await page.goto("/prototypes/hybrid");
      await expectSingleRuntime();
    }
  });

  test("keeps renderer resource counts stable through 20 route cycles", async ({
    page,
  }, testInfo) => {
    test.setTimeout(120_000);
    test.skip(testInfo.project.name !== "chromium", "One canonical renderer lifecycle trace");
    let baseline: { geometries: string | null; textures: string | null; programs: string | null } | null =
      null;

    for (let index = 0; index < 20; index += 1) {
      if (index === 0) {
        await page.goto("/prototypes/hybrid");
      } else {
        await page
          .getByRole("link", { name: /Open full-screen test/ })
          .nth(1)
          .click();
      }
      const canvas = page.locator("canvas");
      await expect(canvas).toHaveCount(1);
      const current = await page
        .waitForFunction(() => {
          const runtime = document.querySelector("canvas");
          if (!runtime || runtime.dataset.textures !== "3") return null;
          return {
            geometries: runtime.dataset.geometries ?? null,
            textures: runtime.dataset.textures ?? null,
            programs: runtime.dataset.programs ?? null,
          };
        })
        .then((handle) => handle.jsonValue());
      baseline ??= current;
      expect(current).toEqual(baseline);
      await page.getByRole("link", { name: /Direction lab/ }).click();
      await expect(page.locator("canvas")).toHaveCount(0);
    }
  });
});

test.describe("mobile interpretation", () => {
  test("recomposes the fracture instead of shrinking desktop geometry", async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.startsWith("mobile"), "Mobile-only composition assertion");
    await page.goto("/prototypes/fracture");
    await expect(page.getByRole("navigation", { name: "Fictional world studies" })).toBeVisible();
    const first = page.locator(".fracture-panel").first();
    const second = page.locator(".fracture-panel").nth(1);
    const [firstBox, secondBox] = await Promise.all([first.boundingBox(), second.boundingBox()]);
    expect(firstBox).not.toBeNull();
    expect(secondBox).not.toBeNull();
    expect(secondBox!.y).toBeGreaterThan(firstBox!.y);
  });
});

test.describe("reduced motion", () => {
  test("commits routes without a long exit timeline", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "reduced-motion", "Reduced-motion project only");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/prototypes/fracture");
    const start = Date.now();
    await page.getByRole("link", { name: /Afterlight/ }).click();
    await expect(page).toHaveURL(/\/studies\/afterlight/);
    expect(Date.now() - start).toBeLessThan(1_000);
  });
});
