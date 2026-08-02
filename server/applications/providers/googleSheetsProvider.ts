import { createSign } from "node:crypto";
import type {
  ApplicationProvider,
  ApplicationProviderContext,
  ApplicationProviderResult,
  ApplicationRecord,
} from "../types";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

type ServiceAccount = {
  client_email: string;
  private_key: string;
  token_uri?: string;
};

type GoogleSheetsOptions = {
  spreadsheetId: string;
  range: string;
  serviceAccountJson: string;
};

function base64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function parseServiceAccount(value: string): ServiceAccount {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error("The Google service account JSON is invalid.");
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("client_email" in parsed) ||
    !("private_key" in parsed) ||
    typeof parsed.client_email !== "string" ||
    typeof parsed.private_key !== "string"
  ) {
    throw new Error("The Google service account is missing required fields.");
  }

  return {
    client_email: parsed.client_email,
    private_key: parsed.private_key.replace(/\\n/g, "\n"),
    token_uri:
      "token_uri" in parsed && typeof parsed.token_uri === "string"
        ? parsed.token_uri
        : GOOGLE_TOKEN_URL,
  };
}

function createAssertion(serviceAccount: ServiceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64Url(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope: GOOGLE_SHEETS_SCOPE,
      aud: serviceAccount.token_uri ?? GOOGLE_TOKEN_URL,
      iat: now,
      exp: now + 3_600,
    }),
  );
  const unsigned = `${header}.${claims}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  return `${unsigned}.${base64Url(signer.sign(serviceAccount.private_key))}`;
}

async function requestAccessToken(serviceAccount: ServiceAccount) {
  const response = await fetch(serviceAccount.token_uri ?? GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: createAssertion(serviceAccount),
    }),
    signal: AbortSignal.timeout(12_000),
  });

  if (!response.ok) throw new Error(`Google authentication returned ${response.status}.`);
  const payload = (await response.json()) as { access_token?: unknown };
  if (typeof payload.access_token !== "string" || !payload.access_token) {
    throw new Error("Google authentication did not return an access token.");
  }
  return payload.access_token;
}

function applicationRow(
  application: ApplicationRecord,
  context: ApplicationProviderContext,
): Array<string | boolean> {
  return [
    context.submittedAt,
    context.requestId,
    application.applicantName,
    application.celebrationNames,
    application.celebrationDate,
    application.location,
    application.approximateGuestCount,
    application.numberOfEvents,
    application.requiredLaunchDate,
    application.needs.join(", "),
    application.storyTogether,
    application.meaningfulMaterial,
    application.openingFeeling,
    application.referenceLinks,
    application.existingWebsite,
    application.engagementType,
    application.budgetRange,
    application.projectDeadline,
    application.languages,
    application.collaborators,
    application.confidentiality,
    application.contactName,
    application.email,
    application.phone,
    application.preferredContact,
    application.country,
    application.timeZone,
    application.bestContactTime,
    application.privacyConsent,
  ];
}

export class GoogleSheetsApplicationProvider implements ApplicationProvider {
  readonly mode = "google-sheets" as const;
  private readonly serviceAccount: ServiceAccount;

  constructor(private readonly options: GoogleSheetsOptions) {
    this.serviceAccount = parseServiceAccount(options.serviceAccountJson);
  }

  async accept(
    application: ApplicationRecord,
    context: ApplicationProviderContext,
  ): Promise<ApplicationProviderResult> {
    const accessToken = await requestAccessToken(this.serviceAccount);
    const spreadsheetId = encodeURIComponent(this.options.spreadsheetId);
    const range = encodeURIComponent(this.options.range);
    const endpoint =
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append` +
      "?valueInputOption=RAW&insertDataOption=INSERT_ROWS";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: [applicationRow(application, context)] }),
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) throw new Error(`Google Sheets returned ${response.status}.`);
    return {
      accepted: true,
      mode: this.mode,
      receiptId: `sheets-${context.requestId}`,
    };
  }
}
