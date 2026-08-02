const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type TurnstileResponse = {
  success?: unknown;
  "error-codes"?: unknown;
};

export type TurnstileResult =
  | { verified: true; enabled: boolean }
  | { verified: false; enabled: true; serviceUnavailable: boolean };

export async function verifyTurnstile(
  secret: string | undefined,
  token: string,
  remoteAddress: string,
): Promise<TurnstileResult> {
  if (!secret?.trim()) return { verified: true, enabled: false };
  if (!token.trim()) return { verified: false, enabled: true, serviceUnavailable: false };

  const body = new URLSearchParams({
    secret: secret.trim(),
    response: token,
  });
  if (remoteAddress && remoteAddress !== "unknown") body.set("remoteip", remoteAddress);

  let response: Response;
  try {
    response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body,
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    return { verified: false, enabled: true, serviceUnavailable: true };
  }

  if (!response.ok) return { verified: false, enabled: true, serviceUnavailable: true };

  try {
    const payload = (await response.json()) as TurnstileResponse;
    return payload.success === true
      ? { verified: true, enabled: true }
      : { verified: false, enabled: true, serviceUnavailable: false };
  } catch {
    return { verified: false, enabled: true, serviceUnavailable: true };
  }
}
