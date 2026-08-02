import { render, screen, within } from "@testing-library/react";
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

  it("opens with the House Adel product position and primary navigation", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: "Digital invitations and private worlds for singular celebrations.",
      }),
    ).toBeInTheDocument();
    const navigation = screen.getByRole("navigation", { name: "Primary navigation" });
    expect(navigation).toBeInTheDocument();
    expect(within(navigation).getByRole("link", { name: "Editions" })).toHaveAttribute(
      "href",
      "/editions",
    );
    expect(within(navigation).getByRole("link", { name: "Apply" })).toHaveAttribute(
      "href",
      "/apply",
    );
  });

  it("resolves a direct Edition route", async () => {
    window.history.replaceState({}, "", "/editions/threshold");
    render(<App />);

    expect(await screen.findByRole("heading", { name: "Threshold", level: 1 })).toBeInTheDocument();
    expect(screen.getAllByText("House Adel Study — Self-initiated.").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Live invitation demonstration" })).toBeInTheDocument();
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
    const result = applicationSchema.safeParse({ ...validApplication, website: "spam" });
    expect(result.success).toBe(false);
  });

  it("requires Not sure yet to stand alone", () => {
    const result = applicationSchema.safeParse({
      ...validApplication,
      needs: ["not-sure", "digital-invitation"],
    });
    expect(result.success).toBe(false);
  });
});
