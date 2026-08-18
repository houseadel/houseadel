import type { FieldError, FieldErrors, FieldPath, Resolver } from "react-hook-form";
import { isSupportedCountry, type CountryCode } from "libphonenumber-js/max";
import { z } from "zod";
import {
  CONTACT_METHODS,
  isValidContactEmail,
  normalizeWhatsAppNumber,
  readInstagramHandle,
} from "./contactMethods";

export const FIELD_LIMITS = {
  name: 160,
  contact: 254,
  date: 10,
  narrative: 4000,
  references: 4000,
  honeypot: 0,
} as const;

const requiredText = (emptyMessage: string, maximum: number) =>
  z.string().trim().min(1, emptyMessage).max(maximum, "Please shorten this answer.");

const optionalText = (maximum: number) =>
  z.string().trim().max(maximum, "Please shorten this answer.");

const optionalDate = z.string().trim().refine(
  (value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value),
  "Enter a valid date.",
);

const optionalReferenceLinks = optionalText(FIELD_LIMITS.references).refine((value) => {
  if (!value) return true;
  return value.split(/\s+/).every((candidate) => {
    try {
      const url = new URL(candidate);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  });
}, "Use complete links beginning with http:// or https://.");

export const applicationSchema = z
  .object({
    name: requiredText("Tell us your name.", FIELD_LIMITS.name),
    contactMethod: z.union([z.literal(""), z.enum(CONTACT_METHODS)]),
    contactCountry: z.custom<CountryCode>(
      (value) => typeof value === "string" && isSupportedCountry(value),
      "Choose a valid country code.",
    ),
    whatsapp: optionalText(FIELD_LIMITS.contact),
    instagram: optionalText(FIELD_LIMITS.contact),
    email: optionalText(FIELD_LIMITS.contact),
    planning: requiredText("Tell us a little about what you are planning.", FIELD_LIMITS.narrative),
    eventDate: optionalDate,
    websitePurpose: requiredText("Tell us what the site needs to do.", FIELD_LIMITS.narrative),
    projectMeaning: requiredText("Give us one thing to begin with.", FIELD_LIMITS.narrative),
    moreDetails: optionalText(FIELD_LIMITS.narrative),
    references: optionalReferenceLinks,
    anythingElse: optionalText(FIELD_LIMITS.narrative),
    website: z.string().max(FIELD_LIMITS.honeypot, "Unable to submit this enquiry."),
  })
  .strict()
  .superRefine((values, context) => {
    if (!values.contactMethod) {
      context.addIssue({
        code: "custom",
        path: ["contactMethod"],
        message: "Choose how we should contact you.",
      });
      return;
    }

    if (values.contactMethod === "whatsapp") {
      if (!values.whatsapp) {
        context.addIssue({ code: "custom", path: ["whatsapp"], message: "Enter your WhatsApp number." });
      } else if (!normalizeWhatsAppNumber(values.contactCountry, values.whatsapp)) {
        context.addIssue({
          code: "custom",
          path: ["whatsapp"],
          message: "Enter a valid phone number for the selected country.",
        });
      }
    }

    if (values.contactMethod === "instagram") {
      if (!values.instagram) {
        context.addIssue({ code: "custom", path: ["instagram"], message: "Enter your Instagram username." });
      } else if (!readInstagramHandle(values.instagram)) {
        context.addIssue({
          code: "custom",
          path: ["instagram"],
          message: "Enter an Instagram username or profile link.",
        });
      }
    }

    if (values.contactMethod === "email") {
      if (!values.email) {
        context.addIssue({ code: "custom", path: ["email"], message: "Enter your email address." });
      } else if (!isValidContactEmail(values.email)) {
        context.addIssue({ code: "custom", path: ["email"], message: "Enter a valid email address." });
      }
    }
  });

export type ApplicationValues = z.infer<typeof applicationSchema>;

export const APPLICATION_DEFAULTS: ApplicationValues = {
  name: "",
  contactMethod: "",
  contactCountry: "ID",
  whatsapp: "",
  instagram: "",
  email: "",
  planning: "",
  eventDate: "",
  websitePurpose: "",
  projectMeaning: "",
  moreDetails: "",
  references: "",
  anythingElse: "",
  website: "",
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
    .split("\n").join(" ")
    .split("\r").join(" ")
    .split("\t").join(" ")
    .split("\f").join(" ");
  return stripControlCharacters(spaced, false).replace(/ +/g, " ").trim();
}

function normalizeMultiline(value: string) {
  const withLineFeeds = value.normalize("NFKC").replace(/\r\n?/g, "\n").split("\t").join(" ");
  return stripControlCharacters(withLineFeeds, true)
    .replace(/ +/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizeApplicationInput(values: ApplicationValues): ApplicationValues {
  return {
    name: normalizeSingleLine(values.name),
    contactMethod: values.contactMethod,
    contactCountry: values.contactCountry,
    whatsapp: normalizeSingleLine(values.whatsapp),
    instagram: normalizeSingleLine(values.instagram),
    email: normalizeSingleLine(values.email),
    planning: normalizeMultiline(values.planning),
    eventDate: normalizeSingleLine(values.eventDate),
    websitePurpose: normalizeMultiline(values.websitePurpose),
    projectMeaning: normalizeMultiline(values.projectMeaning),
    moreDetails: normalizeMultiline(values.moreDetails),
    references: normalizeMultiline(values.references),
    anythingElse: normalizeMultiline(values.anythingElse),
    website: normalizeSingleLine(values.website),
  };
}

export const applicationResolver: Resolver<ApplicationValues> = async (values) => {
  const normalized = normalizeApplicationInput(values);
  const result = applicationSchema.safeParse(normalized);

  if (result.success) return { values: result.data, errors: {} };

  const errors: FieldErrors<ApplicationValues> = {};
  const fieldErrors = errors as Record<string, FieldError | undefined>;
  for (const issue of result.error.issues) {
    const field = issue.path[0] as FieldPath<ApplicationValues> | undefined;
    if (!field || fieldErrors[field]) continue;
    fieldErrors[field] = { type: issue.code, message: issue.message };
  }
  return { values: {}, errors };
};
