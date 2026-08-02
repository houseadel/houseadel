export const NEED_VALUES = [
  "save-the-date",
  "digital-invitation",
  "wedding-website",
  "rsvp",
  "guest-specific-invitations",
  "multiple-events",
  "travel-accommodation",
  "registry",
  "multilingual-content",
  "photography",
  "film",
  "illustration",
  "interactive-experience",
  "not-sure",
] as const;

export type NeedValue = (typeof NEED_VALUES)[number];

export const NEED_LABELS: Record<NeedValue, string> = {
  "save-the-date": "Save the date",
  "digital-invitation": "Digital invitation",
  "wedding-website": "Full wedding website",
  rsvp: "RSVP",
  "guest-specific-invitations": "Guest-specific invitations",
  "multiple-events": "Multiple events",
  "travel-accommodation": "Travel and accommodation",
  registry: "Registry",
  "multilingual-content": "Multilingual content",
  photography: "Photography",
  film: "Film",
  illustration: "Illustration",
  "interactive-experience": "3D or interactive experience",
  "not-sure": "Not sure yet",
};

export const NEED_OPTIONS = NEED_VALUES.map((value) => ({ value, label: NEED_LABELS[value] }));

export const GUEST_COUNT_VALUES = [
  "under-50",
  "50-100",
  "101-200",
  "201-350",
  "over-350",
  "not-sure",
] as const;

export type GuestCountValue = (typeof GUEST_COUNT_VALUES)[number];

export const GUEST_COUNT_LABELS: Record<GuestCountValue, string> = {
  "under-50": "Under 50",
  "50-100": "50–100",
  "101-200": "101–200",
  "201-350": "201–350",
  "over-350": "More than 350",
  "not-sure": "Not sure yet",
};

export const EVENT_COUNT_VALUES = ["one", "two", "three", "four-plus", "not-sure"] as const;

export type EventCountValue = (typeof EVENT_COUNT_VALUES)[number];

export const EVENT_COUNT_LABELS: Record<EventCountValue, string> = {
  one: "One event",
  two: "Two events",
  three: "Three events",
  "four-plus": "Four or more events",
  "not-sure": "Not sure yet",
};

export const ENGAGEMENT_VALUES = ["edition", "private-commission", "not-sure"] as const;

export type EngagementValue = (typeof ENGAGEMENT_VALUES)[number];

export const ENGAGEMENT_LABELS: Record<EngagementValue, string> = {
  edition: "Edition",
  "private-commission": "Private Commission",
  "not-sure": "Not sure yet",
};

export const CONTACT_METHOD_VALUES = ["email", "whatsapp", "phone", "not-sure"] as const;

export type ContactMethodValue = (typeof CONTACT_METHOD_VALUES)[number];

export const CONTACT_METHOD_LABELS: Record<ContactMethodValue, string> = {
  email: "Email",
  whatsapp: "WhatsApp",
  phone: "Phone",
  "not-sure": "Not sure yet",
};

export const CONFIDENTIALITY_VALUES = ["standard", "contact-before-sharing", "discuss"] as const;

export type ConfidentialityValue = (typeof CONFIDENTIALITY_VALUES)[number];

export const CONFIDENTIALITY_LABELS: Record<ConfidentialityValue, string> = {
  standard: "Standard project privacy",
  "contact-before-sharing": "Contact me before sharing any project detail",
  discuss: "Prefer to discuss",
};

