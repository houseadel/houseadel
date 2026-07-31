# Homepage patterns

**Status:** Phase 1 research synthesis, not an approved homepage direction  
**Sources accessed:** 2026-07-30

## Reading key

- **Evidence** reports something a cited source or its author explicitly states.
- **Inference** is a deduction from observed material and is not evidence of an undisclosed implementation.
- **Recommendation** is a House Adel hypothesis to test. It is not a creative-direction decision.

## What a homepage must still do

An authored entry experience can be unfamiliar without making the studio illegible. Within the first encounter, a visitor should be able to determine:

1. the name: **House Adel**;
2. the proposition: an independent studio for compact, highly art-directed digital experiences;
3. the kind of work available;
4. how to inspect that work without mastering a novel control scheme; and
5. how to contact or learn about the studio.

This is a content contract, not a prescribed layout. A nexus, editorial index, object, film, or typographic composition can satisfy it if the same destinations remain available as semantic links.

## Recurrent patterns

| Pattern | What survives after the initial spectacle | Evidence and risk | House Adel hypothesis |
| --- | --- | --- | --- |
| **Promise plus proof** | A short positioning statement is followed quickly by selected work, roles, or recognizable deliverables. | The public Locomotive work index exposes a filterable body of work rather than making a visitor infer the studio's capabilities from a hero alone ([Locomotive — Work](https://locomotive.ca/en/work)). | Put one concise proposition and at least one direct route to selected work in the first usable viewport or first keyboard tab sequence. |
| **Authored entry plus conventional escape hatch** | A novel surface coexists with a work index, menu, or “view all” route. | The WebGL portfolio case studies reviewed here describe accessible URLs or conventional routes underneath authored motion; one author explicitly pushed hash routes into browser history so scenes remained addressable ([Codrops, “Letting the Creative Process Shape a WebGL Portfolio”](https://tympanus.net/codrops/2025/11/27/letting-the-creative-process-shape-a-webgl-portfolio/)). | Any nexus prototype must retain a plainly labelled “Selected work” link. Treat that link as primary navigation, not an accessibility-only duplicate. |
| **Edition or chapter framework** | A durable house system organizes changing visual releases without turning each release into a skin. | Shopify describes Editions as a release published every six months; individual editions radically change presentation while preserving a recognizable publishing purpose ([Shopify Editions](https://www.shopify.com/editions), [Winter ’25](https://www.shopify.com/editions/winter2025), [Spring ’26](https://www.shopify.com/editions/spring2026)). Shopify's own account of the Boring Edition documents a concept-led production process rather than a generic reskin ([Shopify Newsroom](https://www.shopify.com/news/how-we-built-boring-edition)). | Test whether a stable House Adel frame can introduce distinct project realities. Do not use an “edition” metaphor unless it clarifies actual publishing cadence. |
| **Two-pass discovery** | A visitor may browse sensorially first, then switch to a scannable index with titles and categories. | **Inference:** Immersive work often delays comparison; an index restores comparison and direct choice. No claim is made about a reference site's undisclosed stack. | Prototype a reversible `Explore / Index` presentation of the same destinations. It must not behave like five selectable website themes. |
| **Evidence-led case-study preview** | A preview names the project, type of engagement, role, and a specific outcome or artifact. | Locomotive's Lightship case study separates an overview, mandate, approach, awards, external destination, and role-based credits ([Locomotive — Lightship](https://locomotive.ca/en/work/lightship-1)). | Prefer precise project labels such as “launch microsite” or “artist release” over atmospheric names without context. |
| **Returning-visitor shortcut** | The homepage does not force a repeat viewing of an intro or loader. | View transitions are intended to preserve cognitive continuity, not to obstruct navigation ([MDN, View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)). | Allow direct navigation immediately. If an opening sequence exists, make it skippable and remember the skip locally only as a convenience, never as the sole route to content. |

## Candidate homepage models to prototype

These are comparative test fixtures, not recommended visual directions.

### A. Editorial threshold

- House Adel proposition, selected-work list, and one changing art-directed master frame.
- Best evidence for clarity, indexing, SEO, no-WebGL resilience, and fast return visits.
- Risk: the master frame may read as decoration if it does not express the governing concept.

### B. Spatial nexus with visible index

- One WebGL or composited scene relates project realities; a persistent DOM index exposes the same links.
- Best evidence for testing whether “relationship between realities” can become an interaction rather than five skins.
- Risks: gaming-menu resemblance, ambiguous hit targets, GPU cost, and visitors mistaking the nexus for the work itself.

### C. Guided sequence with interruption

- A short authored sequence reveals the studio proposition and selected projects, while persistent navigation permits immediate exit.
- Best evidence for testing pacing and narrative.
- Risks: intro fatigue, history mismatch, motion sensitivity, and delayed proof.

## Evaluation questions

Each prototype review should record:

- Can a first-time visitor describe the studio and name one service or deliverable within 30 seconds?
- Can the visitor reach every featured project with keyboard, touch, reduced motion, no WebGL, and a failed hero asset?
- Does the entry communicate one idea, or does it resemble a portal selector, effects reel, or collection of themes?
- Is project proof visible before the visitor is asked to learn an interaction?
- Does Back return to the prior state, and does a copied project URL open directly?
- Does the layout remain meaningful with images and scripts delayed?

## Rejection conditions

Reject a homepage hypothesis if it:

- requires drag, hover, sound, WebGL, or cursor position to expose an essential destination;
- obscures the name **House Adel** or uses the legacy “House of Adel” name;
- forces a loader or intro on every visit;
- presents project realities as cosmetic theme choices;
- cannot describe its fallback without saying “simpler version”; or
- has no content value after the first 30 seconds.

## Primary and author-attributed sources

- Shopify, “Editions”: https://www.shopify.com/editions
- Shopify, “Winter ’25 Edition”: https://www.shopify.com/editions/winter2025
- Shopify, “Spring ’26 Edition”: https://www.shopify.com/editions/spring2026
- Shopify Newsroom, “How we built the Boring Edition”: https://www.shopify.com/news/how-we-built-boring-edition
- Locomotive, “Work”: https://locomotive.ca/en/work
- Locomotive, “Lightship”: https://locomotive.ca/en/work/lightship-1
- Codrops, author case study, “Letting the Creative Process Shape a WebGL Portfolio”: https://tympanus.net/codrops/2025/11/27/letting-the-creative-process-shape-a-webgl-portfolio/
- MDN, “View Transition API”: https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API
