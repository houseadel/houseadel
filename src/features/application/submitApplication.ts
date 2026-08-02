import type { ApplicationValues } from "./applicationSchema";

export type ApplicationSubmissionResult = {
  accepted: true;
  mode: string;
};

type ServerResponse = {
  accepted?: unknown;
  mode?: unknown;
  message?: unknown;
};

export function getApplicationMode() {
  const configured = import.meta.env.VITE_APPLICATION_MODE;
  return typeof configured === "string" && configured.trim() ? configured.trim() : "mock";
}

export function getApplicationModeLabel(mode: string) {
  if (mode === "mock") return "Local mock";
  if (mode === "email") return "Email delivery";
  if (mode === "google-sheets") return "Google Sheets sync";
  return mode;
}

function readableServerMessage(value: unknown) {
  if (typeof value !== "string") return undefined;
  const message = value.trim();
  return message.length > 0 && message.length <= 240 ? message : undefined;
}

export async function submitApplication(
  values: ApplicationValues,
  signal?: AbortSignal,
): Promise<ApplicationSubmissionResult> {
  let response: Response;

  try {
    response = await fetch("/api/applications", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("The application request was interrupted. Nothing was submitted.");
    }
    throw new Error(
      "The application service is unavailable. Your answers remain on this page and have not been accepted.",
    );
  }

  let payload: ServerResponse | undefined;
  try {
    payload = (await response.json()) as ServerResponse;
  } catch {
    payload = undefined;
  }

  if (!response.ok) {
    throw new Error(
      readableServerMessage(payload?.message) ??
        `The application was not accepted (server response ${response.status}). Please try again.`,
    );
  }

  if (payload?.accepted !== true) {
    throw new Error(
      readableServerMessage(payload?.message) ??
        "The application endpoint did not confirm acceptance. Nothing has been marked as received.",
    );
  }

  return {
    accepted: true,
    mode: typeof payload.mode === "string" && payload.mode.trim() ? payload.mode.trim() : getApplicationMode(),
  };
}

