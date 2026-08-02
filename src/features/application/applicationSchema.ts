import type { FieldError, FieldErrors, FieldPath, Resolver } from "react-hook-form";
import { z } from "zod";
import {
  CONFIDENTIALITY_VALUES,
  CONTACT_METHOD_VALUES,
  ENGAGEMENT_VALUES,
  EVENT_COUNT_VALUES,
  GUEST_COUNT_VALUES,
  NEED_VALUES,
} from "./applicationOptions";

export const FIELD_LIMITS = {
  short: 160,
  location: 240,
  phone: 40,
  narrative: 1200,
  material: 800,
  feeling: 400,
  links: 1500,
  link: 500,
  collaborators: 500,
  contactTime: 160,
  turnstile: 2048,
} as const;

const requiredText = (label: string, maximum: number = FIELD_LIMITS.short) =>
  z.string().trim().min(1, `${label} is required.`).max(maximum, `${label} is too long.`);

const optionalText = (maximum: number) => z.string().trim().max(maximum, "Please shorten this answer.");

const optionalDate = z
  .string()
  .trim()
  .refine((value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value), "Enter a valid date.");

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

const referenceLinks = optionalText(FIELD_LIMITS.links).refine((value) => {
  const links = value
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
  return links.length <= 6 && links.every(isHttpUrl);
}, "Enter up to six complete http or https links, one per line.");

const optionalLink = optionalText(FIELD_LIMITS.link).refine(
  (value) => value === "" || isHttpUrl(value),
  "Enter a complete http or https link.",
);

export const applicationSchema = z
  .object({
    applicantName: requiredText("Applicant name", 120),
    celebrationNames: requiredText("Partner or project names"),
    celebrationDate: optionalDate,
    location: requiredText("Location", FIELD_LIMITS.location),
    approximateGuestCount: z.enum(GUEST_COUNT_VALUES, {
      message: "Choose an approximate guest count.",
    }),
    numberOfEvents: z.enum(EVENT_COUNT_VALUES, { message: "Choose the number of events." }),
    requiredLaunchDate: optionalDate,

    needs: z.array(z.enum(NEED_VALUES)).min(1, "Choose at least one need, or Not sure yet."),

    storyTogether: optionalText(FIELD_LIMITS.narrative),
    meaningfulMaterial: optionalText(FIELD_LIMITS.material),
    openingFeeling: requiredText("The feeling guests should have", FIELD_LIMITS.feeling),
    referenceLinks,
    existingWebsite: optionalLink,

    engagementType: z.enum(ENGAGEMENT_VALUES, { message: "Choose a project path." }),
    budgetRange: requiredText("Budget range", 120),
    projectDeadline: optionalDate,
    languages: requiredText("Languages", FIELD_LIMITS.short),
    collaborators: optionalText(FIELD_LIMITS.collaborators),
    confidentiality: z.enum(CONFIDENTIALITY_VALUES, {
      message: "Choose a confidentiality preference.",
    }),

    contactName: requiredText("Contact name", 120),
    email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address.").max(254),
    phone: optionalText(FIELD_LIMITS.phone),
    preferredContact: z.enum(CONTACT_METHOD_VALUES, {
      message: "Choose a preferred contact method.",
    }),
    country: requiredText("Country", 120),
    timeZone: requiredText("Time zone", 120),
    bestContactTime: optionalText(FIELD_LIMITS.contactTime),
    privacyConsent: z.boolean().refine(Boolean, "Consent is required before submission."),

    website: z.string().max(0, "Unable to submit this application."),
    turnstileToken: optionalText(FIELD_LIMITS.turnstile),
  })
  .strict()
  .superRefine((values, context) => {
    if (values.needs.includes("not-sure") && values.needs.length > 1) {
      context.addIssue({
        code: "custom",
        path: ["needs"],
        message: "Choose Not sure yet on its own, or select the relevant services.",
      });
    }

    if (
      (values.preferredContact === "phone" || values.preferredContact === "whatsapp") &&
      values.phone.length < 7
    ) {
      context.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Add a phone number for the contact method selected.",
      });
    }
  });

export type ApplicationValues = z.infer<typeof applicationSchema>;

export const APPLICATION_DEFAULTS: ApplicationValues = {
  applicantName: "",
  celebrationNames: "",
  celebrationDate: "",
  location: "",
  approximateGuestCount: "not-sure",
  numberOfEvents: "not-sure",
  requiredLaunchDate: "",
  needs: [],
  storyTogether: "",
  meaningfulMaterial: "",
  openingFeeling: "",
  referenceLinks: "",
  existingWebsite: "",
  engagementType: "not-sure",
  budgetRange: "Not sure yet",
  projectDeadline: "",
  languages: "",
  collaborators: "",
  confidentiality: "standard",
  contactName: "",
  email: "",
  phone: "",
  preferredContact: "email",
  country: "",
  timeZone: "",
  bestContactTime: "",
  privacyConsent: false,
  website: "",
  turnstileToken: "",
};

function stripControlCharacters(value: string, preserveNewlines: boolean) {
  return Array.from(value)
    .filter((character) => {
      const codePoint = character.codePointAt(0) ?? 0;
      if (preserveNewlines && codePoint === 10) return true;
      return codePoint >= 32 && codePoint !== 127;
    })
    .join("");
}

function normalizeSingleLine(value: string) {
  const spaced = value
    .normalize("NFKC")
    .split("\n")
    .join(" ")
    .split("\r")
    .join(" ")
    .split("\t")
    .join(" ")
    .split("\f")
    .join(" ");
  return stripControlCharacters(spaced, false).replace(/ +/g, " ").trim();
}

function normalizeMultiline(value: string) {
  const withLineFeeds = value
    .normalize("NFKC")
    .replace(/\r\n?/g, "\n")
    .split("\t")
    .join(" ");
  return stripControlCharacters(withLineFeeds, true)
    .replace(/ +/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizeApplicationInput(values: ApplicationValues): ApplicationValues {
  const singleLineFields: Array<keyof ApplicationValues> = [
    "applicantName",
    "celebrationNames",
    "celebrationDate",
    "location",
    "requiredLaunchDate",
    "existingWebsite",
    "budgetRange",
    "projectDeadline",
    "languages",
    "contactName",
    "email",
    "phone",
    "country",
    "timeZone",
    "bestContactTime",
    "website",
    "turnstileToken",
  ];
  const multilineFields: Array<keyof ApplicationValues> = [
    "storyTogether",
    "meaningfulMaterial",
    "openingFeeling",
    "referenceLinks",
    "collaborators",
  ];
  const normalized = { ...values, needs: [...values.needs] };

  for (const field of singleLineFields) {
    const value = normalized[field];
    if (typeof value === "string") {
      (normalized as Record<string, unknown>)[field] = normalizeSingleLine(value);
    }
  }

  for (const field of multilineFields) {
    const value = normalized[field];
    if (typeof value === "string") {
      (normalized as Record<string, unknown>)[field] = normalizeMultiline(value);
    }
  }

  normalized.needs = [...new Set(normalized.needs)];
  return normalized;
}

export const applicationResolver: Resolver<ApplicationValues> = async (values) => {
  const normalized = normalizeApplicationInput(values);
  const result = applicationSchema.safeParse(normalized);

  if (result.success) {
    return { values: result.data, errors: {} };
  }

  const errors: FieldErrors<ApplicationValues> = {};
  const fieldErrors = errors as Record<string, FieldError | undefined>;
  for (const issue of result.error.issues) {
    const field = issue.path[0] as FieldPath<ApplicationValues> | undefined;
    if (!field || fieldErrors[field]) continue;
    fieldErrors[field] = {
      type: issue.code,
      message: issue.message,
    };
  }

  return { values: {}, errors };
};
