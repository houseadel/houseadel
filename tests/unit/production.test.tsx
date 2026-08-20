import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "../../src/App";
import { SiteFooter } from "../../src/components/layout/SiteFooter";
import { LanguageProvider } from "../../src/context/LanguageContext";
import { APPLICATION_DEFAULTS, applicationSchema } from "../../src/features/application/applicationSchema";

describe("site architecture", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
    window.localStorage.clear();
  });

  it("opens on one statement with text-only navigation", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Interactive websites for singular occasions." }),
    ).toBeInTheDocument();

    const navigation = screen.getByRole("navigation", { name: "Primary navigation" });
    expect(within(navigation).getByRole("link", { name: "Work" })).toHaveAttribute("href", "/work");
    expect(within(navigation).getByRole("link", { name: "Studies" })).toHaveAttribute(
      "href",
      "/studies",
    );
    expect(within(navigation).getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
  });

  it("shows the mark as an icon with no wordmark text", () => {
    render(<App />);
    const mark = screen.getByRole("link", { name: "House Adel, home" });
    expect(mark).toHaveAttribute("href", "/");
    expect(mark.textContent?.trim()).toBe("");
  });

  it("lists real work only, described by a single sentence", () => {
    render(<App />);

    // The work index has no heading of its own any more: the opening statement
    // leads straight into the gallery.
    //
    // Asserted through the link rather than by bare text. Each entry carries an
    // inert duplicate of itself for the chromatic brush to smear, so its words
    // appear twice in the document; the link is the single copy a reader can
    // actually reach, which is what the test should be checking anyway.
    const project = screen.getByRole("link", { name: /MARVELL 20/ });
    expect(project).toBeInTheDocument();
    expect(project).toHaveTextContent(
      "A digital experience created for Marvell Florist's twentieth anniversary.",
    );
  });

  /*
   * The line between the two indexes is the whole reason Studies exists.
   *
   * The wedding invitation is a piece House Adel made for itself, and it used to
   * sit in the work index behind a `placeholder` status that nothing rendered. It
   * belongs to Studies, so the home document must not carry it at all: Studies is
   * a route of its own, and the work index is delivered work only.
   */
  it("keeps the studies off the home document", () => {
    render(<App />);
    expect(screen.queryByRole("link", { name: /AMARA & DANIEL/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /MARVELL 20/ })).toBeInTheDocument();
  });

  it("holds the studies on their own page", async () => {
    window.history.replaceState({}, "", "/studies");
    render(<App />);

    /*
     * The page is lazily routed, so it arrives after the shell rather than with
     * it, and the wait has to allow for the chunk being compiled on first use.
     * The default second is not enough: this assertion took 1.3s the run it
     * failed on and passed on the next, which is a test that reports the state of
     * the machine it ran on rather than the state of the code.
     */
    /*
     * Empty, and saying so.
     *
     * The one published study was taken off the site, so the index has nothing in
     * it. That is a state the page has to render honestly: the assertion is that
     * a reader is told there is nothing here and pointed at the work, not that
     * some frame or placeholder is drawn where a study used to be.
     */
    await screen.findByText("Nothing is published here at the moment.", undefined, {
      timeout: 10_000,
    });
    expect(screen.getByRole("link", { name: /See the work/ })).toHaveAttribute("href", "/work");
    expect(screen.queryByRole("button", { name: /AMARA & DANIEL/ })).not.toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Work made without a brief, to find out how something behaves.",
        level: 1,
      }),
    ).toBeInTheDocument();
  });

  it("keeps every public contact destination linked in the footer", () => {
    render(<LanguageProvider><SiteFooter /></LanguageProvider>);
    expect(screen.getByRole("link", { name: /Instagram @thehouseadel/ })).toHaveAttribute(
      "href",
      "https://www.instagram.com/thehouseadel/",
    );
    expect(screen.getByRole("link", { name: /TikTok @house\.adel/ })).toHaveAttribute(
      "href",
      "https://www.tiktok.com/@house.adel",
    );
    expect(screen.getByRole("link", { name: /WhatsApp \+62 811 7783 600/ })).toHaveAttribute(
      "href",
      "https://wa.me/628117783600",
    );
    expect(screen.getByRole("link", { name: /Email hello@houseadel\.com/ })).toHaveAttribute(
      "href",
      "mailto:hello@houseadel.com",
    );
  });
});

describe("enquiry schema", () => {
  const valid = {
    ...APPLICATION_DEFAULTS,
    name: "Ari",
    contactMethod: "email",
    email: "ari@example.com",
    planning: "A launch dinner.",
    websitePurpose: "Confirm attendance and share the schedule.",
    projectMeaning: "A handwritten menu from the first dinner.",
  };

  it("accepts a bounded enquiry", () => {
    expect(applicationSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a filled honeypot", () => {
    expect(applicationSchema.safeParse({ ...valid, website: "spam" }).success).toBe(false);
  });

  it("requires the five answers it asks for", () => {
    for (const field of ["name", "contactMethod", "email", "planning", "websitePurpose", "projectMeaning"] as const) {
      expect(applicationSchema.safeParse({ ...valid, [field]: "" }).success).toBe(false);
    }
  });

  it("accepts complete reference links and rejects prose in the link field", () => {
    expect(applicationSchema.safeParse({
      ...valid,
      references: "https://example.com/reference\nhttps://example.com/second",
    }).success).toBe(true);
    expect(applicationSchema.safeParse({ ...valid, references: "The paper texture from our invitation" }).success).toBe(false);
  });
});
