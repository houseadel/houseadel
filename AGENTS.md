# House Adel — Agent Operating Contract

## Project

House Adel is Marshall Phan's independent creative web studio. It creates compact, highly art-directed digital experiences: invitations, occasion and event sites, campaign microsites, artist releases, cultural and editorial presentations, brand launches, and intimate hospitality launches.

The studio is not a generic agency, SaaS studio, ecommerce shop, template seller, Active Theory imitation, effects reel, or collection of unrelated fashionable themes.

## Current phase

This repository is in **Phase 1: evidence, strategic options, prototypes, and creative-direction review**.

Do not build or present a final production portfolio until the creative director explicitly approves:

1. the positioning direction;
2. the governing concept;
3. the experience architecture;
4. the nexus interaction model;
5. the initial asset-world direction.

The current multiverse and shattered-fragment nexus are hypotheses to test, not approved answers.

## Non-negotiable creative rules

- Preserve one authored House Adel system while allowing project worlds to change radically.
- Treat the multiverse as the relationship between realities, never as five skins or a theme picker.
- Avoid Marvel, gaming-menu, portal-template, generic AI, particle-field, glowing-button, custom-cursor, and Awwwards-clone clichés.
- Do not make visual direction from CSS effects alone. Start each proposed world with a brief, visual bible, master frame, provenance record, web exports, mobile alternative, and static fallback.
- Separate House Adel's identity from the aesthetic of client work.
- Typography, pacing, imagery, interaction, sound, and storytelling must serve an idea.
- Preserve the name **House Adel**. Legacy material using “House of Adel” is not naming authority.

## Evidence and research rules

- Prefer primary sources: official sites, case studies, repositories, documentation, talks, and interviews.
- Cite direct URLs beside the claims they support.
- Label every unsupported technical observation as `Inference`.
- Record access date for sources whose content may change.
- Distinguish realistic peers, future-scale references, and narrow technical references.
- Analyze what survives after the first 30 seconds, not only hero spectacle.
- Never claim a framework, renderer, CMS, shader, or asset method without evidence.
- Keep the reference matrix and dossiers consistent; update both when facts change.

## Architecture rules

- Use a single principal WebGL architecture after the architecture decision is recorded.
- Prefer semantic DOM for essential content and destinations.
- Use GSAP for coordinated timelines and CSS for simple state transitions unless evidence justifies a change.
- Use native scrolling by default. Add smooth-scroll machinery only to an experience that needs it.
- Preserve browser history, deep links, Back/Forward behavior, interruption handling, cleanup, and direct route access.
- Treat the review interface and prototypes as disposable evidence, not the final portfolio architecture.

## Accessibility and resilience

Every essential destination must remain reachable with semantic links and keyboard navigation.

Every experience must define:

- desktop, tablet, and mobile behavior;
- reduced-motion behavior;
- no-WebGL behavior;
- slow-network behavior;
- failed-asset behavior;
- visible focus, logical focus order, sufficient contrast, and touch targets of at least 44 × 44 CSS pixels;
- alternatives for information otherwise conveyed by hover, sound, motion, WebGL, cursor, or color.

## Performance

- Establish budgets from measurements, then enforce them in tests.
- Test on integrated graphics and ordinary mobile-class constraints, not only a fast desktop.
- Cap device pixel ratio by quality tier.
- Lazy-load universe-specific code and assets.
- Dispose WebGL resources and detect route-transition leaks.
- Do not ship a visual layer without its loading placeholder and fallback.

## Asset and rights rules

- Record source, creator/tool, prompt or transformation notes, license, commercial-use status, generation date, and human approval for every production candidate.
- Keep raw masters separate from optimized exports.
- Never commit secrets, unlicensed paid assets, or unverifiable third-party media.
- Prefer deterministic build scripts for image, video, model, and manifest processing.

## Repository map

- `docs/` — decisions, audits, architecture, workflows, and execution records
- `research/` — cited landscape, market, pattern, and conclusion documents
- `references/` — preserved source material and captured evidence
- `prototypes/` — isolated nexus and transition experiments
- `src/` — local Phase 1 review interface
- `tests/` — unit, browser, accessibility, visual, and performance checks
- `scripts/` — repeatable asset and research utilities
- `skills/` — version-controlled House Adel Codex skills

The pre-Phase-1 static concept is preserved in `references/legacy-v0/`. It is evidence of prior exploration, not an approved direction.

## Change discipline

- Preserve unrelated user work.
- Document material decisions in `docs/decision-log.md`.
- Keep research facts separate from recommendations.
- Keep prototypes technically isolated and explicitly label their strengths, weaknesses, and status.
- Run relevant validation before handing work back.
- Do not conceal unresolved risks behind visual polish.
