import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/max";
import { z } from "zod";

export const CONTACT_METHODS = ["whatsapp", "instagram", "email"] as const;
export type ContactMethod = (typeof CONTACT_METHODS)[number];
export type ContactMethodValue = ContactMethod | "";

const CONTACT_EMAIL = z.email();
const INSTAGRAM_HANDLE = /^[a-zA-Z0-9._]{1,30}$/;
const PRIORITY_COUNTRIES: CountryCode[] = ["ID", "SG", "MY", "AU", "US", "GB"];

export type CountryCallingOption = {
  country: CountryCode;
  name: string;
  callingCode: string;
};

export function getCountryCallingOptions(locale: "en" | "id"): CountryCallingOption[] {
  const displayNames = new Intl.DisplayNames([locale], { type: "region" });
  const collator = new Intl.Collator(locale, { sensitivity: "base" });

  return getCountries()
    .map((country) => ({
      country,
      name: displayNames.of(country) ?? country,
      callingCode: getCountryCallingCode(country),
    }))
    .sort((left, right) => {
      const leftPriority = PRIORITY_COUNTRIES.indexOf(left.country);
      const rightPriority = PRIORITY_COUNTRIES.indexOf(right.country);
      if (leftPriority !== -1 || rightPriority !== -1) {
        if (leftPriority === -1) return 1;
        if (rightPriority === -1) return -1;
        return leftPriority - rightPriority;
      }
      return collator.compare(left.name, right.name);
    });
}

export function normalizeWhatsAppNumber(country: CountryCode, value: string) {
  const phone = parsePhoneNumberFromString(value.trim(), {
    defaultCountry: country,
    extract: false,
  });
  return phone?.isValid() ? phone.number : null;
}

export function isValidContactEmail(value: string) {
  return CONTACT_EMAIL.safeParse(value.trim()).success;
}

export function readInstagramHandle(value: string) {
  let candidate = value.trim();
  if (!candidate) return null;

  if (/^https?:\/\//i.test(candidate)) {
    try {
      const url = new URL(candidate);
      if (!/^(?:www\.)?instagram\.com$/i.test(url.hostname)) return null;
      candidate = decodeURIComponent(url.pathname.split("/").filter(Boolean)[0] ?? "");
    } catch {
      return null;
    }
  }

  const handle = candidate.replace(/^@/, "");
  if (!INSTAGRAM_HANDLE.test(handle) || handle.endsWith(".")) return null;
  return handle;
}

export function composeBackendContact(values: {
  contactMethod: ContactMethodValue;
  contactCountry: CountryCode;
  whatsapp: string;
  instagram: string;
  email: string;
}) {
  if (values.contactMethod === "whatsapp") {
    const number = normalizeWhatsAppNumber(values.contactCountry, values.whatsapp);
    return number ? `WhatsApp: ${number}` : "";
  }
  if (values.contactMethod === "instagram") {
    const handle = readInstagramHandle(values.instagram);
    return handle ? `Instagram: @${handle}` : "";
  }
  if (values.contactMethod === "email") {
    const email = values.email.trim();
    return isValidContactEmail(email) ? `Email: ${email}` : "";
  }
  return "";
}
