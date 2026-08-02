import {
  ENGAGEMENT_VALUES,
  EVENT_COUNT_VALUES,
  GUEST_COUNT_VALUES,
  NEED_VALUES,
} from "./applicationOptions";
import { FIELD_LIMITS, type ApplicationValues } from "./applicationSchema";

const STORAGE_KEY = "house-adel:application-draft:v1";

export type ApplicationDraft = Pick<
  ApplicationValues,
  | "approximateGuestCount"
  | "numberOfEvents"
  | "needs"
  | "engagementType"
  | "budgetRange"
  | "languages"
>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMember<Value extends string>(values: readonly Value[], candidate: unknown): candidate is Value {
  return typeof candidate === "string" && values.some((value) => value === candidate);
}

export function loadApplicationDraft(): Partial<ApplicationDraft> {
  if (typeof window === "undefined") return {};

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    const parsed: unknown = JSON.parse(stored);
    if (!isRecord(parsed)) return {};

    const draft: Partial<ApplicationDraft> = {};
    if (isMember(GUEST_COUNT_VALUES, parsed.approximateGuestCount)) {
      draft.approximateGuestCount = parsed.approximateGuestCount;
    }
    if (isMember(EVENT_COUNT_VALUES, parsed.numberOfEvents)) {
      draft.numberOfEvents = parsed.numberOfEvents;
    }
    if (Array.isArray(parsed.needs)) {
      draft.needs = [...new Set(parsed.needs.filter((value) => isMember(NEED_VALUES, value)))];
    }
    if (isMember(ENGAGEMENT_VALUES, parsed.engagementType)) {
      draft.engagementType = parsed.engagementType;
    }
    if (typeof parsed.budgetRange === "string") {
      draft.budgetRange = parsed.budgetRange.slice(0, 120);
    }
    if (typeof parsed.languages === "string") {
      draft.languages = parsed.languages.slice(0, FIELD_LIMITS.short);
    }
    return draft;
  } catch {
    return {};
  }
}

export function saveApplicationDraft(values: ApplicationValues) {
  if (typeof window === "undefined") return;

  const draft: ApplicationDraft = {
    approximateGuestCount: values.approximateGuestCount,
    numberOfEvents: values.numberOfEvents,
    needs: values.needs,
    engagementType: values.engagementType,
    budgetRange: values.budgetRange,
    languages: values.languages,
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Storage can be unavailable in private modes. The form remains fully usable.
  }
}

export function clearApplicationDraft() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // A failed cleanup does not change the confirmed server response.
  }
}
