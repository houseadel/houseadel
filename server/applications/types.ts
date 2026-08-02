import type { ApplicationValues } from "../../src/features/application/applicationSchema";

export type ApplicationRecord = Omit<ApplicationValues, "website" | "turnstileToken">;

export type ApplicationProviderMode = "mock" | "email" | "google-sheets";

export type ApplicationProviderContext = {
  requestId: string;
  submittedAt: string;
};

export type ApplicationProviderResult = {
  accepted: true;
  mode: ApplicationProviderMode;
  receiptId: string;
};

export interface ApplicationProvider {
  readonly mode: ApplicationProviderMode;
  accept(
    application: ApplicationRecord,
    context: ApplicationProviderContext,
  ): Promise<ApplicationProviderResult>;
}

export type ApplicationServerEnvironment = Record<string, string | undefined>;

export function toApplicationRecord(values: ApplicationValues): ApplicationRecord {
  return Object.fromEntries(
    Object.entries(values).filter(([field]) => field !== "website" && field !== "turnstileToken"),
  ) as ApplicationRecord;
}
