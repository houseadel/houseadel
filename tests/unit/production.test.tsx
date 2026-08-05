import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "../../src/App";
import {
  APPLICATION_DEFAULTS,
  applicationSchema,
} from "../../src/features/application/applicationSchema";

describe("production route architecture", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
    window.localStorage.clear();
  });

  it("opens with the House Adel product position and three-route navigation", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: "Wedding websites, composed as private worlds.",
      }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    const navigation = screen.getByRole("navigation", { name: "Primary navigation" });
    expect(within(navigation).getByRole("link", { name: /Home/ })).toHaveAttribute("href", "/");
    expect(within(navigation).getByRole("link", { name: /Work/ })).toHaveAttribute("href", "/work");
    expect(within(navigation).getByRole("link", { name: /Commissions/ })).toHaveAttribute(
      "href",
      "/commissions",
    );
  });

  it("resolves the direct, truthful empty Work archive", () => {
    window.history.replaceState({}, "", "/work");
    render(<App />);

    expect(screen.getByRole("heading", { name: "The work, when it is ready.", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "No completed commissions are published yet." })).toBeInTheDocument();
  });

  it("uses the production not-found state for unknown paths", async () => {
    window.history.replaceState({}, "", "/not-a-house-adel-route");
    render(<App />);

    expect(await screen.findByRole("heading", { name: "This room is not on the plan." })).toBeInTheDocument();
  });
});

describe("application schema", () => {
  const validApplication = {
    ...APPLICATION_DEFAULTS,
    applicantName: "Ari",
    celebrationNames: "Ari and Sol",
    location: "Jakarta",
    approximateGuestCount: "50-100" as const,
    numberOfEvents: "two" as const,
    needs: ["digital-invitation"],
    openingFeeling: "Warm, lucid and personal",
    engagementType: "not-sure" as const,
    budgetRange: "USD 3,000–6,000",
    languages: "English",
    confidentiality: "standard" as const,
    contactName: "Ari",
    email: "ari@example.com",
    preferredContact: "email" as const,
    country: "Indonesia",
    timeZone: "Asia/Jakarta",
    privacyConsent: true,
  };

  it("accepts a bounded, consented application", () => {
    expect(applicationSchema.safeParse(validApplication).success).toBe(true);
  });

  it("rejects an application when the honeypot is filled", () => {
    expect(applicationSchema.safeParse({ ...validApplication, website: "spam" }).success).toBe(false);
  });

  it("requires Not sure yet to stand alone", () => {
    expect(
      applicationSchema.safeParse({
        ...validApplication,
        needs: ["not-sure", "digital-invitation"],
      }).success,
    ).toBe(false);
  });
});
