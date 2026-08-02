import { EmailWebhookApplicationProvider } from "./emailWebhookProvider";
import { GoogleSheetsApplicationProvider } from "./googleSheetsProvider";
import { MockApplicationProvider } from "./mockProvider";
import type {
  ApplicationProvider,
  ApplicationProviderMode,
  ApplicationServerEnvironment,
} from "../types";

export class ApplicationProviderConfigurationError extends Error {}

export function getApplicationProviderMode(
  environment: ApplicationServerEnvironment,
): ApplicationProviderMode | "disabled" {
  const configured = environment.HOUSE_ADEL_APPLICATION_PROVIDER?.trim().toLowerCase() ?? "mock";
  if (configured === "mock" || configured === "email" || configured === "google-sheets") {
    return configured;
  }
  return "disabled";
}

export function createApplicationProvider(
  environment: ApplicationServerEnvironment,
): ApplicationProvider {
  const mode = getApplicationProviderMode(environment);
  if (mode === "mock") return new MockApplicationProvider();

  if (mode === "email") {
    const endpoint = environment.HOUSE_ADEL_EMAIL_WEBHOOK_URL?.trim();
    if (!endpoint) {
      throw new ApplicationProviderConfigurationError(
        "Email delivery is selected but its server-side webhook is not configured.",
      );
    }
    try {
      return new EmailWebhookApplicationProvider({
        endpoint,
        token: environment.HOUSE_ADEL_EMAIL_WEBHOOK_TOKEN,
      });
    } catch {
      throw new ApplicationProviderConfigurationError(
        "The server-side email delivery configuration is invalid.",
      );
    }
  }

  if (mode === "google-sheets") {
    const spreadsheetId = environment.HOUSE_ADEL_GOOGLE_SHEETS_ID?.trim();
    const serviceAccountJson = environment.HOUSE_ADEL_GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
    if (!spreadsheetId || !serviceAccountJson) {
      throw new ApplicationProviderConfigurationError(
        "Google Sheets is selected but its server-side credentials are not configured.",
      );
    }
    try {
      return new GoogleSheetsApplicationProvider({
        spreadsheetId,
        serviceAccountJson,
        range: environment.HOUSE_ADEL_GOOGLE_SHEETS_RANGE?.trim() || "Applications!A:AC",
      });
    } catch {
      throw new ApplicationProviderConfigurationError(
        "The server-side Google Sheets configuration is invalid.",
      );
    }
  }

  throw new ApplicationProviderConfigurationError(
    "Application submission is disabled until a server-side provider is selected.",
  );
}
