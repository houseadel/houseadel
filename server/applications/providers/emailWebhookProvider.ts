import type {
  ApplicationProvider,
  ApplicationProviderContext,
  ApplicationProviderResult,
  ApplicationRecord,
} from "../types";

type EmailWebhookOptions = {
  endpoint: string;
  token?: string;
};

function getWebhookUrl(endpoint: string) {
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    throw new Error("The email webhook URL is invalid.");
  }

  if (url.protocol !== "https:" && !(url.protocol === "http:" && url.hostname === "localhost")) {
    throw new Error("The email webhook must use HTTPS.");
  }
  return url;
}

export class EmailWebhookApplicationProvider implements ApplicationProvider {
  readonly mode = "email" as const;
  private readonly endpoint: URL;

  constructor(private readonly options: EmailWebhookOptions) {
    this.endpoint = getWebhookUrl(options.endpoint);
  }

  async accept(
    application: ApplicationRecord,
    context: ApplicationProviderContext,
  ): Promise<ApplicationProviderResult> {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    if (this.options.token?.trim()) {
      headers.Authorization = `Bearer ${this.options.token.trim()}`;
    }

    const response = await fetch(this.endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        event: "house-adel.application.received",
        requestId: context.requestId,
        submittedAt: context.submittedAt,
        application,
      }),
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) {
      throw new Error(`The email delivery provider returned ${response.status}.`);
    }

    return {
      accepted: true,
      mode: this.mode,
      receiptId: `email-${context.requestId}`,
    };
  }
}
