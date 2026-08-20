import { commissionBackend, hasConfiguredCommissionEndpoint } from "../../config/commissionBackend";
import type { CommissionPayload } from "./commissionPayload";

export type ApplicationSubmissionResult = {
  ok: true;
  submissionId: string;
  duplicate?: boolean;
};

type BackendResponse = {
  ok?: unknown;
  submissionId?: unknown;
  duplicate?: unknown;
  error?: unknown;
};

type StatusResponse = {
  ok?: unknown;
  confirmed?: unknown;
  submissionId?: unknown;
};

function readableMessage(value: unknown) {
  if (typeof value !== "string") return undefined;
  const message = value.trim();
  return message.length > 0 && message.length <= 240 ? message : undefined;
}

function interrupted(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function wait(milliseconds: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = window.setTimeout(resolve, milliseconds);
    signal?.addEventListener("abort", () => {
      window.clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    }, { once: true });
  });
}

function readStatusWithJsonp(submissionId: string, signal?: AbortSignal) {
  return new Promise<StatusResponse>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const callbackName = `__houseAdelInquiry_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const url = new URL(commissionBackend.appsScriptEndpointUrl);
    url.searchParams.set("action", "status");
    url.searchParams.set("submissionId", submissionId);
    url.searchParams.set("prefix", callbackName);
    url.searchParams.set("cache", String(Date.now()));

    const script = document.createElement("script");
    const callbacks = window as unknown as Record<string, unknown>;
    let timer = 0;
    const cleanup = () => {
      window.clearTimeout(timer);
      script.remove();
      delete callbacks[callbackName];
      signal?.removeEventListener("abort", onAbort);
    };
    const onAbort = () => {
      cleanup();
      reject(new DOMException("Aborted", "AbortError"));
    };

    callbacks[callbackName] = (value: StatusResponse) => {
      cleanup();
      resolve(value);
    };
    script.async = true;
    script.src = url.toString();
    script.onerror = () => {
      cleanup();
      reject(new Error("The confirmation check could not be loaded."));
    };
    timer = window.setTimeout(() => {
      cleanup();
      reject(new Error("The confirmation check timed out."));
    }, 3_000);
    signal?.addEventListener("abort", onAbort, { once: true });
    document.head.append(script);
  });
}

async function postOpaqueAndConfirm(payload: CommissionPayload, signal?: AbortSignal) {
  await fetch(commissionBackend.appsScriptEndpointUrl, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=UTF-8" },
    body: JSON.stringify(payload),
    redirect: "follow",
    signal,
  });

  for (let attempt = 0; attempt < 5; attempt += 1) {
    if (attempt > 0) await wait(450, signal);
    try {
      const status = await readStatusWithJsonp(payload.submissionId, signal);
      if (status.ok === true && status.confirmed === true && status.submissionId === payload.submissionId) {
        return { ok: true, submissionId: payload.submissionId } as const;
      }
    } catch (error) {
      if (interrupted(error)) throw error;
    }
  }
  throw new Error("The inquiry could not be confirmed. Your answers are still here.");
}

export async function submitApplication(
  payload: CommissionPayload,
  signal?: AbortSignal,
): Promise<ApplicationSubmissionResult> {
  if (!hasConfiguredCommissionEndpoint()) {
    throw new Error(
      "The inquiry destination is not configured yet. Your answers remain here and nothing was sent.",
    );
  }

  let response: Response;
  try {
    response = await fetch(commissionBackend.appsScriptEndpointUrl, {
      method: "POST",
      // text/plain is a CORS-safelisted request type, so a static GitHub Pages
      // origin can reach Apps Script without an OPTIONS preflight. The body is
      // still JSON and doPost parses it as such.
      headers: {
        Accept: "application/json",
        "Content-Type": "text/plain;charset=UTF-8",
      },
      body: JSON.stringify(payload),
      redirect: "follow",
      signal,
    });
  } catch (error) {
    if (interrupted(error)) {
      throw new Error("The inquiry request was interrupted. Nothing was marked as received.");
    }
    try {
      return await postOpaqueAndConfirm(payload, signal);
    } catch (fallbackError) {
      if (interrupted(fallbackError)) {
        throw new Error("The inquiry request was interrupted. Nothing was marked as received.");
      }
      throw new Error("The inquiry service could not be reached. Your answers are still here.");
    }
  }

  let result: BackendResponse;
  try {
    result = (await response.json()) as BackendResponse;
  } catch {
    try {
      return await postOpaqueAndConfirm(payload, signal);
    } catch (fallbackError) {
      if (interrupted(fallbackError)) {
        throw new Error("The inquiry request was interrupted. Nothing was marked as received.");
      }
      throw new Error(
        "The inquiry service did not return a readable confirmation. Your answers are still here.",
      );
    }
  }

  if (!response.ok || result.ok !== true || result.submissionId !== payload.submissionId) {
    throw new Error(
      readableMessage(result.error) ??
        "The inquiry was not confirmed. Your answers are still here. Please try again.",
    );
  }

  return {
    ok: true,
    submissionId: payload.submissionId,
    duplicate: result.duplicate === true,
  };
}
