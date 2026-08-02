import { HOUSE_ADEL_STUDY_LABEL } from "./editions";

export type StoryCategory = "Editions" | "Private" | "Studies" | "Other Worlds";

export type StoryInteraction =
  | "aperture-sequence"
  | "letter-fold"
  | "map-path"
  | "light-register";

export type StoryPlateKind = "arch" | "folio" | "atlas" | "register";

export const storySectionOrder = [
  "context",
  "brief",
  "sourceMaterial",
  "creativePremise",
  "visualSystem",
  "informationArchitecture",
  "guestExperience",
  "motionAndTechnology",
  "mobileExperience",
  "result",
  "creditsAndAssetProvenance",
] as const;

export type StorySectionKey = (typeof storySectionOrder)[number];

export const storySectionLabels: Record<StorySectionKey, string> = {
  context: "Context",
  brief: "Brief",
  sourceMaterial: "Source material",
  creativePremise: "Creative premise",
  visualSystem: "Visual system",
  informationArchitecture: "Information architecture",
  guestExperience: "Guest experience",
  motionAndTechnology: "Motion and technology",
  mobileExperience: "Mobile experience",
  result: "Result",
  creditsAndAssetProvenance: "Credits and asset provenance",
};

export type Story = {
  slug: string;
  title: string;
  dek: string;
  category: StoryCategory;
  year: number;
  studyLabel: typeof HOUSE_ADEL_STUDY_LABEL;
  plate: {
    kind: StoryPlateKind;
    alt: string;
    provenance: "Project-owned code-native SVG composition";
  };
  interaction: StoryInteraction;
  sections: Record<StorySectionKey, readonly string[]>;
};

export const stories = [
  {
    slug: "threshold-an-invitation-as-entrance",
    title: "Threshold: an invitation as entrance",
    dek: "A design study in using one aperture to order announcement, occasion and response.",
    category: "Editions",
    year: 2026,
    studyLabel: HOUSE_ADEL_STUDY_LABEL,
    plate: {
      kind: "arch",
      alt: "An abstract code-drawn arch intersecting a measured ivory page.",
      provenance: "Project-owned code-native SVG composition",
    },
    interaction: "aperture-sequence",
    sections: {
      context: [
        "Threshold treats the first invitation screen as an entrance, using proportion, paper tone and a single opening instead of photography or ornament.",
      ],
      brief: [
        "Create a reusable Edition whose identity remains recognisable while names, dates, event information and selected personal material change.",
        "Guests must reach essential details and RSVP without waiting for a visual sequence to finish.",
      ],
      sourceMaterial: [
        "The study begins with project-owned rule lines, paper tones, registration marks and the proportion of an arched opening.",
        "Its visual language is made entirely from original House Adel typography and drawings.",
      ],
      creativePremise: [
        "The invitation behaves as a threshold. One opening changes scale and function as the guest moves from announcement into practical information.",
      ],
      visualSystem: [
        "Warm ivory and ink establish the field; a scarce garnet identifies invitations to act. Newsreader and Manrope create the ceremonial and practical voices.",
        "Apertures, fine frames and paper offsets repeat at every scale.",
      ],
      informationArchitecture: [
        "The sequence is invitation, occasion, schedule, place, response and practical notes. The same destinations remain available in a compact internal navigation.",
      ],
      guestExperience: [
        "A named welcome leads directly to the date and response choice. Guest-specific details share one composed reading system rather than splitting into separate page designs.",
      ],
      motionAndTechnology: [
        "The aperture changes scale to uncover each part of the invitation, shifting the sense of space without moving the essential copy out of reach.",
        "The frame advances only when the reading context changes. Navigation and guest details remain available at every state.",
      ],
      mobileExperience: [
        "On small screens, the arch becomes a vertical reading frame rather than a cropped desktop composition. Navigation and RSVP controls remain in normal document flow.",
      ],
      result: [
        "The study resolves into a defined Edition with a working, personalisable invitation preview and a clear route from welcome to response.",
      ],
      creditsAndAssetProvenance: [
        "House Adel Study — Self-initiated. Concept, art direction, copy, interface and code by House Adel, 2026.",
        "Visual plate: project-owned code-native SVG and CSS. Typefaces: Newsreader and Manrope under their open-source licences. No generative media is present.",
      ],
    },
  },
  {
    slug: "correspondence-the-guest-as-reader",
    title: "Correspondence: the guest as reader",
    dek: "A letter-led Edition study balancing handwriting, ordered information and two languages.",
    category: "Editions",
    year: 2026,
    studyLabel: HOUSE_ADEL_STUDY_LABEL,
    plate: {
      kind: "folio",
      alt: "Two code-drawn paper folios joined by a typographic margin line.",
      provenance: "Project-owned code-native SVG composition",
    },
    interaction: "letter-fold",
    sections: {
      context: [
        "Correspondence creates intimacy through sequence, address and the physical memory of a letter rather than an invented personal history.",
      ],
      brief: [
        "Build an Edition that accommodates two supplied languages and several event groups while remaining one calm, continuous correspondence.",
      ],
      sourceMaterial: [
        "The House vocabulary is built from project-owned lines, folds, marginalia and typographic marks.",
      ],
      creativePremise: [
        "Every destination is treated as a letter within one collected correspondence. The reader always understands which leaf has opened and where to continue.",
      ],
      visualSystem: [
        "Overlapping paper planes provide material depth while a strict baseline keeps copy calm. Garnet appears only at a fold, annotation or action.",
      ],
      informationArchitecture: [
        "A persistent contents line connects welcome, gathering, travel and response. Language choice changes the content layer without changing the page position.",
      ],
      guestExperience: [
        "The invited guest can read in order or move directly to a known detail. Response controls use plain language and confirm that the demonstration sends no data.",
      ],
      motionAndTechnology: [
        "A letter fold uncovers related passages while keeping the reader's place. Its movement explains which details belong together.",
        "When movement is reduced, the same leaves open immediately and retain their intended reading order.",
      ],
      mobileExperience: [
        "Folio leaves stack vertically and their reading order becomes explicit. The same language and section controls use full-width touch targets.",
      ],
      result: [
        "The live invitation demonstrates a bilingual content model, direct section navigation and a complete sample response journey.",
      ],
      creditsAndAssetProvenance: [
        "House Adel Study — Self-initiated. Concept, art direction, copy, interface and code by House Adel, 2026.",
        "Visual plate: project-owned code-native SVG and CSS. Typefaces: Newsreader and Manrope under their open-source licences. No generative media is present.",
      ],
    },
  },
  {
    slug: "atlas-table-from-fragments-to-order",
    title: "Atlas Table: from fragments to order",
    dek: "A Private Commission study in gathering unlocated fragments into one ordered identity.",
    category: "Private",
    year: 2026,
    studyLabel: HOUSE_ADEL_STUDY_LABEL,
    plate: {
      kind: "atlas",
      alt: "An abstract overhead arrangement of a map line, date, paper sample and measurement marks.",
      provenance: "Project-owned code-native SVG composition",
    },
    interaction: "map-path",
    sections: {
      context: [
        "Atlas Table begins with neutral fragments created by House Adel: an unlocated route, an unspecified date, paper, a line of language and an abstract plan.",
      ],
      brief: [
        "Show how an original commission can begin with disparate personal material and become a coherent digital identity without resembling an Edition.",
      ],
      sourceMaterial: [
        "An abstract map fragment, an unspecified date, a handwritten line, paper tones, a plan-like outline and measurement marks form the source table.",
        "Every fragment is an original House Adel abstraction, created without reference to a real person, place or private archive.",
      ],
      creativePremise: [
        "The atelier table is both source and interface. Its fragments remain visible as they gather into a clear order.",
      ],
      visualSystem: [
        "Stone, warm paper and oxblood establish continuity while the composition remains deliberately more irregular than an Edition. A drawn route is the sole repeating mark.",
      ],
      informationArchitecture: [
        "The experience moves from source fragments to premise, invitation, event information and response, with each detail traceable to the initial table.",
      ],
      guestExperience: [
        "Guests encounter an authored sequence but retain immediate access to schedule and response. Personal specificity would come only from approved client material in a real commission.",
      ],
      motionAndTechnology: [
        "A drawn route connects fragments in sequence, then settles into the margin as navigation. The gesture gives order without turning the material into spectacle.",
        "On a smaller screen, the same route becomes a quiet vertical guide between the invitation's practical destinations.",
      ],
      mobileExperience: [
        "Fragments become an ordered vertical folio. The route line moves to the margin and the practical destinations remain visible between sections.",
      ],
      result: [
        "The study establishes a Private Commission principle: source material determines form, and every formal decision should trace back to it.",
      ],
      creditsAndAssetProvenance: [
        "House Adel Study — Self-initiated. Concept, art direction, copy, interface and code by House Adel, 2026.",
        "All map, paper, handwriting and measurement forms are project-owned code-native SVG/CSS abstractions. They do not reproduce a real place or hand.",
      ],
    },
  },
  {
    slug: "afterlight-time-as-material",
    title: "Afterlight: time as material",
    dek: "A study in using a change of light to clarify an invitation rather than decorate it.",
    category: "Studies",
    year: 2026,
    studyLabel: HOUSE_ADEL_STUDY_LABEL,
    plate: {
      kind: "register",
      alt: "Three translucent code-drawn registers aligned around one dark time mark.",
      provenance: "Project-owned code-native SVG composition",
    },
    interaction: "light-register",
    sections: {
      context: [
        "Afterlight uses luminosity as part of the reading order, allowing atmosphere to emerge without obscuring the invitation's practical purpose.",
      ],
      brief: [
        "Use luminosity to order a multi-event invitation while maintaining text contrast and immediate access to every destination.",
      ],
      sourceMaterial: [
        "Project-owned translucent rectangles, registration lines, time notation and paper colour tests provide the entire visual source set.",
      ],
      creativePremise: [
        "Light acts as editorial emphasis. It passes across stable registers to indicate which part of the occasion is being read; it never conceals core content.",
      ],
      visualSystem: [
        "Pale stone and warm ivory layers sit above ink type. A dark garnet mark locates the current moment while a muted metallic rule connects the schedule.",
      ],
      informationArchitecture: [
        "The event sequence is grouped by time and guest relevance. Practical details remain adjacent to the event they qualify rather than in a distant miscellaneous section.",
      ],
      guestExperience: [
        "A guest sees the next relevant time first, can inspect the full order and can move to RSVP without crossing a decorative interlude.",
      ],
      motionAndTechnology: [
        "A passing light register shifts emphasis across the schedule while names, times and actions remain fixed and readable.",
        "When movement is reduced, the change appears as a short tonal transition rather than a travelling field.",
      ],
      mobileExperience: [
        "The schedule uses one column and the light field becomes a local section accent. No horizontal scrub or precision gesture is required.",
      ],
      result: [
        "The study defines a legible visual language and one restrained motion principle carried from the schedule to the response journey.",
      ],
      creditsAndAssetProvenance: [
        "House Adel Study — Self-initiated. Concept, art direction, copy, interface and code by House Adel, 2026.",
        "Visual plate: project-owned code-native SVG and CSS. Typefaces: Newsreader and Manrope under their open-source licences. No generative media is present.",
      ],
    },
  },
] as const satisfies readonly Story[];

export function getStory(slug: string) {
  return stories.find((story) => story.slug === slug);
}
