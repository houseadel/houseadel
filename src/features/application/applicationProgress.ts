import type { ApplicationValues } from "./applicationSchema";

export type ApplicationStep = {
  id: string;
  label: string;
  complete: boolean;
};

function hasText(value: string | undefined) {
  return Boolean(value?.trim());
}

export function getApplicationSteps(values: ApplicationValues): ApplicationStep[] {
  return [
    {
      id: "your-celebration",
      label: "Your celebration",
      complete:
        hasText(values.applicantName) && hasText(values.celebrationNames) && hasText(values.location),
    },
    {
      id: "what-you-need",
      label: "What you need",
      complete: values.needs.length > 0,
    },
    {
      id: "the-story",
      label: "The story",
      complete: hasText(values.openingFeeling),
    },
    {
      id: "scope",
      label: "Scope",
      complete: hasText(values.budgetRange) && hasText(values.languages),
    },
    {
      id: "contact",
      label: "Contact",
      complete:
        hasText(values.contactName) &&
        hasText(values.email) &&
        hasText(values.country) &&
        hasText(values.timeZone) &&
        values.privacyConsent,
    },
  ];
}

