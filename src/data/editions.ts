export const HOUSE_ADEL_STUDY_LABEL =
  "House Adel Study — Self-initiated." as const;

export type EditionRevealMask =
  | "threshold-arch"
  | "correspondence-fold"
  | "afterlight-window";

export type EditionMicrointeraction =
  | "aperture-open"
  | "letter-unfold"
  | "light-register";

export type EditionPlateKind =
  | "aperture"
  | "fold"
  | "ledger"
  | "window"
  | "seal"
  | "register";

export type EditionTheme = {
  palette: {
    field: string;
    paper: string;
    ink: string;
    signature: string;
    metal: string;
  };
  type: {
    display: "Newsreader Variable";
    text: "Manrope Variable";
  };
  revealMask: EditionRevealMask;
  imageSet: readonly {
    id: string;
    kind: EditionPlateKind;
    alt: string;
    provenance: "Project-owned code-native SVG composition";
  }[];
  metadata: {
    editionNumber: string;
    year: number;
    medium: "Responsive digital invitation";
  };
  microinteraction: {
    type: EditionMicrointeraction;
    purpose: string;
  };
};

export type Edition = {
  slug: string;
  number: string;
  title: string;
  atmosphere: string;
  studyLabel: typeof HOUSE_ADEL_STUDY_LABEL;
  availability: string;
  priceUSD: number;
  timeframe: string;
  summary: string;
  scope: readonly string[];
  includes: readonly string[];
  personalisation: {
    mayChange: readonly string[];
    remains: readonly string[];
  };
  preview: {
    date: string;
    place: string;
    note: string;
  };
  theme: EditionTheme;
};

export const editions = [
  {
    slug: "threshold",
    number: "Edition 01",
    title: "Threshold",
    atmosphere:
      "An invitation composed as a measured entrance: quiet paper, a garnet aperture and a precise sequence of arrivals.",
    studyLabel: HOUSE_ADEL_STUDY_LABEL,
    availability: "Available for controlled personalisation",
    priceUSD: 2800,
    timeframe: "Six to eight weeks",
    summary:
      "Threshold uses one recurring arched opening to move guests from announcement to practical detail without leaving its single architectural language.",
    scope: [
      "Save-the-date and invitation release",
      "Responsive celebration website",
      "Guest-specific welcome and up to three event schedules",
      "RSVP, travel notes, registry links and contact details",
    ],
    includes: [
      "Art-directed personalisation within the Threshold system",
      "Copy-setting for supplied English content",
      "Guest-list import and RSVP setup",
      "One design review and one pre-launch content review",
      "Twelve months of managed hosting from launch",
    ],
    personalisation: {
      mayChange: [
        "Names, dates, wording and event information",
        "One supplied signature or handwriting line",
        "Garnet accent adjusted within the approved dark-red range",
        "Up to four supplied, rights-cleared photographs",
      ],
      remains: [
        "Aperture composition and page sequence",
        "House type pairing and spacing system",
        "Core transition and invitation interaction",
        "Information hierarchy and RSVP pattern",
      ],
    },
    preview: {
      date: "12 September 2027",
      place: "The chosen place",
      note: "A quiet evening, followed by dinner and dancing.",
    },
    theme: {
      palette: {
        field: "#f2eee5",
        paper: "#e7dfd1",
        ink: "#211c1b",
        signature: "#6f2431",
        metal: "#9c8768",
      },
      type: {
        display: "Newsreader Variable",
        text: "Manrope Variable",
      },
      revealMask: "threshold-arch",
      imageSet: [
        {
          id: "threshold-aperture",
          kind: "aperture",
          alt: "A code-drawn garnet arch set into an ivory paper field.",
          provenance: "Project-owned code-native SVG composition",
        },
        {
          id: "threshold-ledger",
          kind: "ledger",
          alt: "Fine registration lines arranged as a ceremonial schedule.",
          provenance: "Project-owned code-native SVG composition",
        },
        {
          id: "threshold-seal",
          kind: "seal",
          alt: "A restrained circular mark crossing two paper planes.",
          provenance: "Project-owned code-native SVG composition",
        },
      ],
      metadata: {
        editionNumber: "01",
        year: 2026,
        medium: "Responsive digital invitation",
      },
      microinteraction: {
        type: "aperture-open",
        purpose: "Uncover the invitation hierarchy through one framed opening.",
      },
    },
  },
  {
    slug: "correspondence",
    number: "Edition 02",
    title: "Correspondence",
    atmosphere:
      "A ceremonial exchange of letters, folds and marginal notes, held together by disciplined editorial typography.",
    studyLabel: HOUSE_ADEL_STUDY_LABEL,
    availability: "Available for controlled personalisation",
    priceUSD: 3200,
    timeframe: "Seven to nine weeks",
    summary:
      "Correspondence treats each part of the guest journey as a letter in one collected sequence, balancing intimate annotation with an exact reading order.",
    scope: [
      "Save-the-date and invitation release",
      "Responsive celebration website",
      "Guest-specific welcome and up to four event schedules",
      "RSVP, travel, accommodation, registry and contact details",
      "English plus one additional supplied language",
    ],
    includes: [
      "Art-directed personalisation within the Correspondence system",
      "Typesetting for two supplied language versions",
      "Guest-list import and RSVP setup",
      "One design review and one pre-launch content review",
      "Twelve months of managed hosting from launch",
    ],
    personalisation: {
      mayChange: [
        "Names, dates, wording and event information",
        "Two supplied handwriting or signature fragments",
        "Paper tone selected from the Edition palette",
        "Up to six supplied, rights-cleared photographs or scans",
      ],
      remains: [
        "Letter sequence and folded editorial composition",
        "House type pairing and spacing system",
        "Core unfolding interaction",
        "Information hierarchy and RSVP pattern",
      ],
    },
    preview: {
      date: "04 October 2027",
      place: "The appointed address",
      note: "A gathering written in a series of small correspondences.",
    },
    theme: {
      palette: {
        field: "#ede6da",
        paper: "#f6f0e7",
        ink: "#2a2420",
        signature: "#783946",
        metal: "#8f826f",
      },
      type: {
        display: "Newsreader Variable",
        text: "Manrope Variable",
      },
      revealMask: "correspondence-fold",
      imageSet: [
        {
          id: "correspondence-fold",
          kind: "fold",
          alt: "Two offset paper leaves joined by a fine fold line.",
          provenance: "Project-owned code-native SVG composition",
        },
        {
          id: "correspondence-register",
          kind: "register",
          alt: "A typographic register made from lines, dates and margin marks.",
          provenance: "Project-owned code-native SVG composition",
        },
        {
          id: "correspondence-seal",
          kind: "seal",
          alt: "A code-drawn seal interrupting a handwritten line.",
          provenance: "Project-owned code-native SVG composition",
        },
      ],
      metadata: {
        editionNumber: "02",
        year: 2026,
        medium: "Responsive digital invitation",
      },
      microinteraction: {
        type: "letter-unfold",
        purpose: "Reveal related information by unfolding one editorial letter.",
      },
    },
  },
  {
    slug: "afterlight",
    number: "Edition 03",
    title: "Afterlight",
    atmosphere:
      "A pale sequence of translucent registers in which time, place and gathering appear through changing light.",
    studyLabel: HOUSE_ADEL_STUDY_LABEL,
    availability: "Available for controlled personalisation",
    priceUSD: 3600,
    timeframe: "Eight to ten weeks",
    summary:
      "Afterlight layers vellum-like planes over a stable editorial grid, using luminosity as a reading device rather than a decorative effect.",
    scope: [
      "Save-the-date and invitation release",
      "Responsive celebration website",
      "Guest-specific welcome and up to four event schedules",
      "RSVP, travel, accommodation, registry and contact details",
      "English plus one additional supplied language",
    ],
    includes: [
      "Art-directed personalisation within the Afterlight system",
      "Typesetting for two supplied language versions",
      "Guest-list import and RSVP setup",
      "Two design reviews and one pre-launch content review",
      "Twelve months of managed hosting from launch",
    ],
    personalisation: {
      mayChange: [
        "Names, dates, wording and event information",
        "Light temperature selected from three Edition settings",
        "One supplied line drawing or handwritten fragment",
        "Up to six supplied, rights-cleared photographs or scans",
      ],
      remains: [
        "Translucent register composition and page sequence",
        "House type pairing and spacing system",
        "Core light-register interaction",
        "Information hierarchy and RSVP pattern",
      ],
    },
    preview: {
      date: "21 November 2027",
      place: "The gathering place",
      note: "Arrival before dusk. The table opens after the light changes.",
    },
    theme: {
      palette: {
        field: "#eee9df",
        paper: "#dad2c4",
        ink: "#24201f",
        signature: "#55202a",
        metal: "#a08b69",
      },
      type: {
        display: "Newsreader Variable",
        text: "Manrope Variable",
      },
      revealMask: "afterlight-window",
      imageSet: [
        {
          id: "afterlight-window",
          kind: "window",
          alt: "A translucent rectangular opening crossed by a fine metallic line.",
          provenance: "Project-owned code-native SVG composition",
        },
        {
          id: "afterlight-register",
          kind: "register",
          alt: "Three pale registers aligned around one dark date mark.",
          provenance: "Project-owned code-native SVG composition",
        },
        {
          id: "afterlight-ledger",
          kind: "ledger",
          alt: "A measured arrangement of evening times and rule lines.",
          provenance: "Project-owned code-native SVG composition",
        },
      ],
      metadata: {
        editionNumber: "03",
        year: 2026,
        medium: "Responsive digital invitation",
      },
      microinteraction: {
        type: "light-register",
        purpose: "Change contrast to guide attention from ceremony to practical detail.",
      },
    },
  },
] as const satisfies readonly Edition[];

export function getEdition(slug: string) {
  return editions.find((edition) => edition.slug === slug);
}

export function formatEditionPrice(priceUSD: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(priceUSD);
}
