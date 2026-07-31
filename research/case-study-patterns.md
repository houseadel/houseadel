# Case-study patterns

**Status:** Phase 1 research synthesis, not an approved case-study template  
**Sources accessed:** 2026-07-30

## Reading key

- **Evidence** is a claim supported by a cited source.
- **Inference** is a deduction, not a claim about an undisclosed workflow or stack.
- **Recommendation** is a provisional House Adel content rule.

## A case study must prove authorship

A strong case study connects:

```text
context -> constraint -> governing idea -> House Adel contribution
        -> execution -> evidence -> outcome -> credits
```

It should make the studio's decisions inspectable without reducing a project to a software stack or a collection of full-bleed mockups.

## Minimum credible record

| Field | Why it matters | Publication rule |
| --- | --- | --- |
| Project, client, date | Establishes identity and chronology. | Use exact approved naming. |
| Engagement type | Helps a visitor understand what House Adel can be hired to make. | Use concrete language: invitation, event site, artist release, campaign microsite, cultural presentation, hospitality launch. |
| Context / mandate | Explains the situation before the work. | Distinguish client brief from House Adel interpretation. |
| Constraint | Makes decisions legible. | Include meaningful time, audience, content, platform, accessibility, or production limits when publishable. |
| Governing idea | Connects expression to purpose. | One sentence before visual mechanics. |
| House Adel role | Establishes responsibility. | Separate direction, design, development, motion, sound, writing, production, and collaborators. |
| System | Shows what makes multiple screens or assets cohere. | Discuss typography, pacing, imagery, interaction, sound, and narrative only where they serve the idea. |
| Selected making evidence | Demonstrates decisions and iteration. | Use briefs, master frames, tests, rejected routes, or production notes with rights clearance. |
| Resilience | Shows the experience exists beyond a fast desktop. | Document desktop, tablet, mobile, reduced-motion, no-WebGL, slow-network, and failed-asset behavior. |
| Outcome | Establishes effect. | Label qualitative feedback as qualitative; do not invent metrics. |
| Credits and rights | Gives accurate authorship and media provenance. | Name collaborators and sources. Do not imply sole authorship. |

Locomotive's public Lightship case study separates an overview, mandate, approach, awards, project link, and detailed role credits ([Locomotive — Lightship](https://locomotive.ca/en/work/lightship-1)). It is evidence that a concise public case study can retain specific context and authorship, not a template to copy.

## Recommended narrative sequence

### 1. Recognition

Open with:

- project title;
- one-line engagement and governing idea;
- House Adel role;
- year; and
- a representative master frame with descriptive alternative text.

The first screen should establish proof, not merely atmosphere.

### 2. Situation

Explain the audience, occasion, cultural context, or commercial moment. Name the actual problem, not a generalized desire to “stand out.”

### 3. Idea and system

Show how a governing idea becomes repeatable choices:

- typography and verbal tone;
- image world and provenance;
- pacing and route structure;
- interaction and motion;
- sound, if any; and
- responsive and fallback decisions.

### 4. Making evidence

Show only artifacts that clarify a consequential decision: an early visual bible, a master-frame comparison, an interaction state diagram, an asset transformation, or a mobile reinterpretation. A process gallery without commentary is not evidence.

### 5. Experience

Present a bounded sequence of desktop, tablet, and mobile states. Avoid long mockup stacks that conceal how navigation, content, focus, and loading behave.

### 6. Outcome and reflection

Acceptable outcome categories:

- verified public metrics with date and source;
- client-approved quote;
- launch or event facts;
- awards with awarding body's link;
- operational result, such as a reusable publishing workflow; or
- clearly labelled House Adel reflection.

If no quantified outcome exists, say so and report what can be verified.

### 7. Credits and next route

End with explicit collaborators, tools only where editorially relevant, asset rights/provenance, and named next/all-work links.

## Stable House Adel frame, variable project worlds

The case-study information architecture should remain stable even when each project's art direction changes radically:

```text
House Adel identity/navigation
└── project record
    ├── recognition
    ├── context + role
    ├── idea + system
    ├── experience evidence
    ├── resilience / production
    ├── outcome
    └── credits + next route
```

This separates House Adel's authored publishing system from a client's aesthetic. Project typography or imagery may enter as content; it should not replace site navigation, focus behavior, or the studio's information hierarchy.

## What author case studies reveal

The following are first-person or developer-attributed disclosures. They should not be generalized into claims about other sites:

- A 2025 WebGL portfolio case study reports using React Three Fiber, Three.js, GSAP, and hash routes pushed into browser history, and describes removing experiments that did not serve the final idea ([Codrops, “Letting the Creative Process Shape a WebGL Portfolio”](https://tympanus.net/codrops/2025/11/27/letting-the-creative-process-shape-a-webgl-portfolio/)).
- Stefan Vitasović's 2025 case study reports Next.js Pages Router, Motion, Three.js/React Three Fiber, Cloudflare R2 video delivery, and Vercel hosting ([Codrops, “Stefan Vitasović Portfolio 2025”](https://tympanus.net/codrops/2025/03/05/case-study-stefan-vitasovic-portfolio-2025/)). These are the author's implementation disclosures, not browser-derived stack identification.
- The Design Embraced developer case study reports a custom static-site generator, WebGL/router/scroller, keyboard navigation, and an up-front preload tradeoff ([Codrops, “Design Embraced Portfolio 2024”](https://tympanus.net/codrops/2024/03/21/case-study-design-embraced-portfolio-2024/)).

The useful pattern is not “use their stack.” It is that a case study becomes credible when it explains choices, tradeoffs, and discarded experiments.

## Media and interaction rules

- Every gallery item needs a reason for inclusion and a usable mobile crop.
- Videos require a poster, controls when more than decorative, captions/transcript where speech or meaningful audio exists, and a failed-video state.
- Do not autoplay sound.
- Avoid scroll-jacking to reveal project facts.
- A comparison slider or hover detail must have keyboard/touch controls and a noninteractive alternative.
- Do not communicate role, result, or state only through motion or color.
- Maintain meaningful reading order without CSS positioning, canvas, or JavaScript.

## CMS/content-model hypothesis

Keep evidence structured rather than embedding it in bespoke page code:

```ts
type Project = {
  slug: string
  title: string
  year: number
  engagementTypes: string[]
  summary: string
  context: string
  constraints: string[]
  governingIdea: string
  roles: Credit[]
  sections: Section[]
  outcomes: EvidenceItem[]
  credits: Credit[]
  assets: AssetReference[]
  accessibility: ResilienceRecord
}
```

**Recommendation:** Begin with version-controlled typed local content in Phase 1. Add a CMS adapter only when the publishing owner, preview workflow, and update frequency are known. A CMS does not replace asset provenance or editorial review.

## Review checklist

- Can a visitor state what House Adel did?
- Does each visual support a decision or outcome?
- Are client claims sourced or approved?
- Are roles and collaborators complete?
- Are project-world aesthetics contained within the stable House Adel frame?
- Does the case study work without canvas, autoplay video, hover, or sound?
- Are mobile and reduced-motion states shown rather than promised?
- Is absent evidence described honestly?

## Sources

- Locomotive, Work: https://locomotive.ca/en/work
- Locomotive, Lightship: https://locomotive.ca/en/work/lightship-1
- Codrops, author case study, “Letting the Creative Process Shape a WebGL Portfolio”: https://tympanus.net/codrops/2025/11/27/letting-the-creative-process-shape-a-webgl-portfolio/
- Codrops, author case study, “Stefan Vitasović Portfolio 2025”: https://tympanus.net/codrops/2025/03/05/case-study-stefan-vitasovic-portfolio-2025/
- Codrops, author case study, “Design Embraced Portfolio 2024”: https://tympanus.net/codrops/2024/03/21/case-study-design-embraced-portfolio-2024/
- W3C, WCAG 2.2: https://www.w3.org/TR/WCAG22/
