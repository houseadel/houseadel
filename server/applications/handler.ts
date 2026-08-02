import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createApplicationProvider, ApplicationProviderConfigurationError } from "./providers";
import { InMemoryRateLimiter, type RateLimiter } from "./rateLimit";
import { verifyTurnstile } from "./turnstile";
import { toApplicationRecord, type ApplicationServerEnvironment } from "./types";
import { containsHoneypotValue, validateApplication } from "./validation";

export const APPLICATION_BODY_LIMIT_BYTES = 64 * 1024;

type ApplicationHandlerOptions = {
  environment: ApplicationServerEnvironment;
  rateLimiter?: RateLimiter;
};

class BodyTooLargeError extends Error {}
class InvalidJsonError extends Error {}

function sendJson(
  response: ServerResponse,
  status: number,
  body: Record<string, unknown>,
  headers: Record<string, string> = {},
) {
  response.statusCode = status;
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("X-Content-Type-Options", "nosniff");
  for (const [name, value] of Object.entries(headers)) response.setHeader(name, value);
  response.end(JSON.stringify(body));
}

function isApplicationPath(request: IncomingMessage) {
  const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
  return pathname === "/api/applications";
}

function clientAddress(request: IncomingMessage, trustProxy: boolean) {
  if (trustProxy) {
    const forwarded = request.headers["x-forwarded-for"];
    const first = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0];
    if (first?.trim()) return first.trim();
  }
  return request.socket.remoteAddress ?? "unknown";
}

function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const declaredLength = Number(request.headers["content-length"] ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > APPLICATION_BODY_LIMIT_BYTES) {
    throw new BodyTooLargeError();
  }

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let length = 0;
    let tooLarge = false;

    request.on("data", (chunk: Buffer | string) => {
      if (tooLarge) return;
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      length += buffer.byteLength;
      if (length > APPLICATION_BODY_LIMIT_BYTES) {
        tooLarge = true;
        chunks.length = 0;
        reject(new BodyTooLargeError());
        return;
      }
      chunks.push(buffer);
    });
    request.once("end", () => {
      if (tooLarge) return;
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown);
      } catch {
        reject(new InvalidJsonError());
      }
    });
    request.once("error", reject);
  });
}

export function createApplicationRequestHandler(options: ApplicationHandlerOptions) {
  const rateLimiter = options.rateLimiter ?? new InMemoryRateLimiter();
  const trustProxy = options.environment.HOUSE_ADEL_TRUST_PROXY === "true";

  return async function handleApplicationRequest(
    request: IncomingMessage,
    response: ServerResponse,
  ): Promise<boolean> {
    if (!isApplicationPath(request)) return false;

    if (request.method !== "POST") {
      sendJson(response, 405, { accepted: false, message: "Use POST for application submissions." }, {
        Allow: "POST",
      });
      return true;
    }

    if (!request.headers["content-type"]?.toLowerCase().startsWith("application/json")) {
      sendJson(response, 415, {
        accepted: false,
        message: "Application submissions must use JSON.",
      });
      return true;
    }

    const address = clientAddress(request, trustProxy);
    const rateLimit = rateLimiter.consume(address);
    response.setHeader("X-RateLimit-Remaining", String(rateLimit.remaining));
    if (!rateLimit.allowed) {
      sendJson(
        response,
        429,
        { accepted: false, message: "Too many attempts. Please wait before trying again." },
        { "Retry-After": String(rateLimit.retryAfterSeconds) },
      );
      return true;
    }

    let payload: unknown;
    try {
      payload = await readJsonBody(request);
    } catch (error) {
      if (error instanceof BodyTooLargeError) {
        sendJson(response, 413, {
          accepted: false,
          message: "The application exceeds the 64 KB submission limit.",
        });
      } else {
        sendJson(response, 400, {
          accepted: false,
          message: "The application body is not valid JSON.",
        });
      }
      return true;
    }

    if (containsHoneypotValue(payload)) {
      sendJson(response, 400, {
        accepted: false,
        message: "The application could not be accepted.",
      });
      return true;
    }

    const validation = validateApplication(payload);
    if (!validation.success) {
      sendJson(response, 422, {
        accepted: false,
        message: "Some application fields require attention.",
        issues: validation.issues.slice(0, 12),
      });
      return true;
    }

    const turnstile = await verifyTurnstile(
      options.environment.HOUSE_ADEL_TURNSTILE_SECRET_KEY,
      validation.data.turnstileToken,
      address,
    );
    if (!turnstile.verified) {
      sendJson(response, turnstile.serviceUnavailable ? 503 : 422, {
        accepted: false,
        message: turnstile.serviceUnavailable
          ? "The verification service is unavailable. Nothing was submitted."
          : "Please complete the verification before submitting.",
      });
      return true;
    }

    const requestId = randomUUID();
    try {
      const provider = createApplicationProvider(options.environment);
      const receipt = await provider.accept(toApplicationRecord(validation.data), {
        requestId,
        submittedAt: new Date().toISOString(),
      });
      sendJson(response, 202, {
        accepted: true,
        mode: receipt.mode,
        receiptId: receipt.receiptId,
      });
    } catch (error) {
      const configurationError = error instanceof ApplicationProviderConfigurationError;
      console.error(
        `[application:${requestId}] ${configurationError ? "provider configuration" : "provider delivery"} failed.`,
      );
      sendJson(response, configurationError ? 503 : 502, {
        accepted: false,
        message: configurationError
          ? error.message
          : "The delivery provider did not accept the application. Nothing was marked as received.",
      });
    }
    return true;
  };
}
