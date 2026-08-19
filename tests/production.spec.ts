import { expect, test, type Page } from "@playwright/test";

// The first-visit loader ends on a sound choice that would sit over every
// assertion. Marking it seen gives each test the returning-visitor path, which is
// the state the rest of the site is being checked in.
test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try {
      window.sessionStorage.setItem("house-adel:loader-seen", "true");
    } catch {
      /* storage may be unavailable */
    }
  });
});

async function settle(page: Page) {
  await page
    .locator("[data-loader-overlay]")
    .waitFor({ state: "detached", timeout: 8_000 })
    .catch(() => undefined);
}

const routes = [
  ["/", "Interactive websites for singular occasions."],
  ["/marvell-20", "MARVELL 20"],
  ["/studies", "Work made without a brief, to find out how something behaves."],
  ["/contact", "Tell us what is taking shape."],
  ["/begin-a-project", "Tell us what is taking shape."],
  // Privacy is a full policy now rather than two sentences; its h1 changed with it.
  ["/privacy", "What happens to what you send us."],
  ["/terms", "What a commission commits us both to."],
] as const;

test.describe("routes", () => {
  for (const [route, heading] of routes) {
    test(`${route} renders its single statement`, async ({ page }) => {
      await page.goto(route);
      await settle(page);
      await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }

  test("unknown routes state the situation plainly", async ({ page }) => {
    await page.goto("/not-a-route");
    await settle(page);
    await expect(
      page.getByRole("heading", { name: "This page is no longer here, or the address is incorrect." }),
    ).toBeVisible();
  });
});

test.describe("shell", () => {
  test("a direct Work visit enters the foreground chapter immediately", async ({ page }) => {
    await page.goto("/work");
    await settle(page);
    await expect(page).toHaveURL(/\/work$/);
    await expect(page.locator("[data-foreground-active='true']")).toBeVisible();
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(
      await page.evaluate(() => window.innerHeight),
    );
  });

  /*
   * Studies is a page, not a chapter.
   *
   * Work is reached by scrolling the document it belongs to; Studies is a route,
   * so reaching it is a navigation that lands at the top of a new page. Both
   * halves of that are asserted here, because the difference between them is the
   * whole reason the studies index is not at the foot of the home document.
   */
  test("Studies is its own page, reached by navigating rather than scrolling", async ({ page }) => {
    await page.goto("/");
    await settle(page);
    const nav = page.getByRole("navigation", { name: "Primary navigation" });
    await nav.getByRole("link", { name: "Studies" }).click();
    await expect(page).toHaveURL(/\/studies$/);
    await expect(
      page.getByRole("heading", {
        name: "Work made without a brief, to find out how something behaves.",
        level: 1,
      }),
    ).toBeVisible();
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    // Studies is deliberately empty while the index is reworked, and says so
    // rather than showing a frame with nothing in it.
    await expect(page.getByText("Nothing is published here at the moment.")).toBeVisible();
    await expect(page.getByRole("link", { name: /AMARA & DANIEL/ })).toHaveCount(0);
    // The work index it was moved out of keeps only delivered work.
    await page.goto("/work");
    await settle(page);
    await expect(page.getByRole("link", { name: /MARVELL 20/ }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /AMARA & DANIEL/ })).toHaveCount(0);
  });

  test("navigation is text only, with no header bar and no wordmark", async ({ page }) => {
    await page.goto("/");
    await settle(page);
    const nav = page.getByRole("navigation", { name: "Primary navigation" });
    await expect(nav.getByRole("link", { name: "Work" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Studies" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Contact" })).toBeVisible();
    // The mark is an icon link with no visible wordmark text.
    const mark = page.getByRole("link", { name: "House Adel, home" });
    await expect(mark).toBeVisible();
    expect((await mark.innerText()).trim()).toBe("");
  });

  test("moves between routes and back", async ({ page }) => {
    await page.goto("/");
    await settle(page);
    const nav = page.getByRole("navigation", { name: "Primary navigation" });
    // Work is a chapter of the same document, so this scrolls rather than routes.
    await nav.getByRole("link", { name: "Work" }).click();
    await expect(page).toHaveURL(/\/work$/);
    // The forest carries no heading of its own; the projects are the content.
    await expect(page.getByRole("link", { name: /MARVELL 20/ }).first()).toBeVisible();
    await nav.getByRole("link", { name: "Contact" }).click();
    await expect(page).toHaveURL(/\/contact$/);
    const dissolve = page.locator("[data-route-transition]");
    await dissolve.evaluate((node) => {
      node.setAttribute("data-test-history-activations", "0");
      new MutationObserver(() => {
        if (node.getAttribute("data-active") === "true") {
          const count = Number(node.getAttribute("data-test-history-activations") ?? 0);
          node.setAttribute("data-test-history-activations", String(count + 1));
        }
      }).observe(node, { attributes: true, attributeFilter: ["data-active"] });
    });
    await page.goBack();
    await expect(page).toHaveURL(/\/work$/);
    await expect.poll(async () => Number(await dissolve.getAttribute("data-test-history-activations"))).toBeGreaterThan(0);
    await expect(page.locator("[data-foreground-active='true']")).toBeVisible();
    await expect(dissolve).toHaveAttribute("data-active", "false");
    await dissolve.evaluate((node) => node.setAttribute("data-test-history-activations", "0"));
    await page.goForward();
    await expect(page).toHaveURL(/\/contact$/);
    await expect.poll(async () => Number(await dissolve.getAttribute("data-test-history-activations"))).toBeGreaterThan(0);
    await expect(page.getByRole("heading", { name: "Tell us what is taking shape." })).toBeVisible();
    await expect(dissolve).toHaveAttribute("data-active", "false");
  });

  test("the public contact destinations remain available in the footer", async ({ page }) => {
    await page.goto("/");
    await settle(page);
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("link", { name: /Instagram @thehouseadel/ })).toHaveAttribute(
      "href",
      "https://www.instagram.com/thehouseadel/",
    );
    await expect(footer.getByRole("link", { name: /TikTok @house\.adel/ })).toHaveAttribute(
      "href",
      "https://www.tiktok.com/@house.adel",
    );
    await expect(footer.getByRole("link", { name: /WhatsApp \+62 811 7783 600/ })).toHaveAttribute(
      "href",
      "https://wa.me/628117783600",
    );
    await expect(footer.getByRole("link", { name: /Email hello@houseadel\.com/ })).toHaveAttribute(
      "href",
      "mailto:hello@houseadel.com",
    );
  });
});

test.describe("enquiry", () => {
  test("reports validation without claiming a send", async ({ page }) => {
    await page.goto("/contact");
    await settle(page);
    await page.getByRole("button", { name: "Submit Enquiry" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "A few answers need your attention." })).toBeVisible();
    await expect(page.locator("#enquiry-name")).toBeFocused();
  });

  test("does not claim receipt for a direct visit", async ({ page }) => {
    await page.goto("/enquiry-received");
    await settle(page);
    await expect(
      page.getByRole("heading", { name: /Nothing has been sent yet/ }),
    ).toBeVisible();
  });
});
