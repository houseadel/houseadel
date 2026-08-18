import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/config/commissionBackend", () => ({
  commissionBackend: {
    appsScriptEndpointUrl: "https://script.google.com/macros/s/test-deployment/exec",
    frontendVersion: "commission-form-v3",
    source: "houseadel.com",
    minimumCompletionMs: 2500,
  },
  hasConfiguredCommissionEndpoint: () => true,
}));

import { LanguageProvider } from "../../src/context/LanguageContext";
import { APPLICATION_DEFAULTS, applicationSchema, type ApplicationValues } from "../../src/features/application/applicationSchema";
import { createCommissionPayload, generateInquiryId } from "../../src/features/application/commissionPayload";
import { ApplicationForm } from "../../src/features/application/components/ApplicationForm";

const validValues: ApplicationValues = {
  ...APPLICATION_DEFAULTS,
  name: "Ari",
  contactMethod: "instagram",
  instagram: "@ari",
  planning: "A private dinner.",
  websitePurpose: "Share the invitation and receive replies.",
  projectMeaning: "A brass candlestick from the family table.",
};

const metadata = {
  submissionId: "HA-I-2026-ABCDEFGH",
  submittedAt: new Date("2026-08-15T03:00:00.000Z"),
  formStartedAt: new Date("2026-08-15T02:58:00.000Z"),
};

function payloadFor(values: Partial<ApplicationValues> = {}) {
  return createCommissionPayload({ ...validValues, ...values }, metadata);
}

function renderForm() {
  return render(<LanguageProvider><ApplicationForm /></LanguageProvider>);
}

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText(/Your name/i), { target: { value: "Ari" } });
  fireEvent.click(screen.getByRole("radio", { name: "Email" }));
  fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: "ari@example.com" } });
  fireEvent.change(screen.getByLabelText(/What are you planning/i), { target: { value: "A dinner." } });
  fireEvent.change(screen.getByLabelText(/What should the website help people do/i), { target: { value: "Share details." } });
  fireEvent.change(screen.getByLabelText(/Tell us something that belongs to this project/i), { target: { value: "A song." } });
}

describe("simplified inquiry payload", () => {
  it("generates a private-data-free inquiry ID", () => {
    const randomSource = {
      getRandomValues<T extends ArrayBufferView | null>(array: T) {
        if (array instanceof Uint8Array) array.fill(0);
        return array;
      },
    } as Pick<Crypto, "getRandomValues">;
    expect(generateInquiryId(new Date("2026-08-15T00:00:00Z"), randomSource)).toBe("HA-I-2026-AAAAAAAA");
  });

  it("maps the required inquiry and hidden metadata", () => {
    expect(payloadFor()).toMatchObject({
      submissionId: metadata.submissionId,
      name: "Ari",
      contact: "Instagram: @ari",
      planning: "A private dinner.",
      eventDate: "",
      moreDetails: "",
      references: "",
      submittedAt: metadata.submittedAt.toISOString(),
      source: "houseadel.com",
      frontendVersion: "commission-form-v3",
    });
  });

  it("keeps the date, freeform details, and reference links", () => {
    expect(payloadFor({
      eventDate: "2027-02-14",
      moreDetails: "A dinner followed by a small exhibition.",
      references: "https://example.com/one\nhttps://example.com/two",
    })).toMatchObject({
      eventDate: "2027-02-14",
      moreDetails: "A dinner followed by a small exhibition.",
      references: "https://example.com/one\nhttps://example.com/two",
    });
  });

  it("uses natural required messages and accepts links only in references", () => {
    expect(applicationSchema.safeParse({ ...validValues, name: "" }).error?.issues[0]?.message).toBe("Tell us your name.");
    expect(applicationSchema.safeParse({ ...validValues, references: "a Pinterest board" }).success).toBe(false);
    expect(applicationSchema.safeParse({ ...validValues, references: "https://pinterest.com/example" }).success).toBe(true);
  });

  it("validates the selected contact method and normalizes WhatsApp to E.164", () => {
    expect(applicationSchema.safeParse({ ...validValues, contactMethod: "", instagram: "" }).success).toBe(false);
    expect(applicationSchema.safeParse({ ...validValues, contactMethod: "email", email: "not-an-email" }).success).toBe(false);
    expect(applicationSchema.safeParse({
      ...validValues,
      contactMethod: "whatsapp",
      contactCountry: "ID",
      whatsapp: "0811 7783 600",
    }).success).toBe(true);
    expect(payloadFor({
      contactMethod: "whatsapp",
      contactCountry: "ID",
      whatsapp: "0811 7783 600",
    }).contact).toBe("WhatsApp: +628117783600");
  });
});

describe("simplified inquiry form", () => {
  beforeEach(() => window.history.replaceState({}, "", "/contact"));
  afterEach(() => vi.unstubAllGlobals());

  it("preserves answers and reports the exact failure state", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ ok: false, error: "Temporary failure" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )));
    renderForm();
    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: /Submit enquiry/i }));

    expect(await screen.findByText("Something went wrong. Your answers are still here. Please try again.")).toBeVisible();
    expect(screen.getByLabelText(/Your name/i)).toHaveValue("Ari");
    expect(screen.getByLabelText(/Tell us something that belongs to this project/i)).toHaveValue("A song.");
  });

  it("collapses optional details without losing the freeform answer", () => {
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: /Add more details/i }));
    const detail = screen.getByLabelText(/Tell us more/i);
    fireEvent.change(detail, { target: { value: "A quiet film fragment." } });
    fireEvent.click(screen.getByRole("button", { name: /Hide more details/i }));
    fireEvent.click(screen.getByRole("button", { name: /Add more details/i }));
    expect(screen.getByLabelText(/Tell us more/i)).toHaveValue("A quiet film fragment.");
  });

  it("focuses the first invalid field with natural copy", async () => {
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: /Submit enquiry/i }));
    expect(await screen.findByText("Tell us your name.")).toBeVisible();
    await waitFor(() => expect(screen.getByLabelText(/Your name/i)).toHaveFocus());
  });

  it("sends only once when the submit control is activated twice", async () => {
    const request = new Promise<Response>(() => undefined);
    const fetchMock = vi.fn().mockReturnValue(request);
    vi.stubGlobal("fetch", fetchMock);
    renderForm();
    fillRequiredFields();
    const button = screen.getByRole("button", { name: /Submit enquiry/i });
    fireEvent.click(button);
    fireEvent.click(button);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(button).toBeDisabled();
  });

  it("replaces the form with a substantial confirmation state", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async (_url, options: RequestInit) => {
      const body = JSON.parse(String(options.body)) as { submissionId: string };
      return new Response(JSON.stringify({ ok: true, submissionId: body.submissionId }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }));
    renderForm();
    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: /Submit enquiry/i }));
    expect(await screen.findByText("Received.")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Thank you." })).toBeVisible();
    expect(screen.queryByRole("button", { name: /Submit enquiry/i })).not.toBeInTheDocument();
  });
});
