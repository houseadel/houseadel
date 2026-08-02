import {
  applicationSchema,
  normalizeApplicationInput,
  type ApplicationValues,
} from "../../src/features/application/applicationSchema";

export type ValidationResult =
  | { success: true; data: ApplicationValues }
  | { success: false; issues: Array<{ field: string; message: string }> };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function containsHoneypotValue(value: unknown) {
  return isObject(value) && typeof value.website === "string" && value.website.trim().length > 0;
}

export function validateApplication(value: unknown): ValidationResult {
  const initial = applicationSchema.safeParse(value);
  if (!initial.success) {
    return {
      success: false,
      issues: initial.error.issues.map((issue) => ({
        field: issue.path.length > 0 ? issue.path.join(".") : "application",
        message: issue.message,
      })),
    };
  }

  const normalized = normalizeApplicationInput(initial.data);
  const normalizedResult = applicationSchema.safeParse(normalized);
  if (!normalizedResult.success) {
    return {
      success: false,
      issues: normalizedResult.error.issues.map((issue) => ({
        field: issue.path.length > 0 ? issue.path.join(".") : "application",
        message: issue.message,
      })),
    };
  }

  return { success: true, data: normalizedResult.data };
}
