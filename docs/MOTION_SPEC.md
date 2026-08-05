# Motion Specification

Last updated: 2026-08-04

## Purpose and grammar

Motion exists only to introduce the studio, change spatial context, explain capability, preserve continuity between pages, or give meaningful feedback. The House Adel grammar is assembly, uncovering, framing, restrained depth change, material light, and typographic masking. Native scrolling remains authoritative.

Simple hover, focus, pressed, and menu-glyph changes use CSS. GSAP is reserved for coordinated entrance, route transition, capability-state choreography, and the optional spatial opening. Every GSAP owner scopes its work and reverts on cleanup.

## Implemented interaction acceptance

| Interaction | Visible purpose | Trigger and reverse | Mobile / interruption | Reduced motion / fallback | Cost and cleanup |
| --- | --- | --- | --- | --- | --- |
| Production loader | Establish the mark while real fonts, poster, mark, and graphics capability become ready. | First visit begins after document mount; repeat visits shorten; Skip resolves immediately. | Re-composed for narrow screens; keyboard Skip; cleanup resolves pending work. | Immediate composed destination with no travel; no-canvas poster path; destination is never loader-dependent. | Route-local GSAP; isolated lab at `/labs/loader`; no media payload added. |
| Page change | Make navigation feel like one continuous editorial object and identify the destination. | Internal primary link; cover then reveal. Back/Forward commits directly and restores route focus. | Shorter distance and duration; a transition in progress cannot stack. | Brief opacity crossfade only; overlay is hidden when inactive. | One global overlay; GSAP timeline killed on cleanup; no layout dependency. |
| Spatial opening | Introduce House Adel as a framed private world and demonstrate progressive spatial capability. | Visitor intent requests enhancement; desktop scroll advances assembly and passage. | Mobile is a static single-viewport composition without pinned travel; rendering pauses offscreen/hidden. | Static approved archival frame; no canvas for reduced motion, Save-Data, forced colours, explicit fallback, or failed capability. | Lazy Three/R3F chunk, demand rendering, capped DPR, no post-processing/shadows; route-local context cleanup. |
| Capability instrument | Explain how art direction, information, motion, and development combine. | Click, tap, or keyboard selects one `aria-pressed` layer; another selection reverses/re-targets the coordinated field. | Pointer offsets are subtle and absent on touch; state remains operable without hover. | Complete static layer state with immediate content change. | Small GSAP choreography scoped to the component and reverted on unmount. |
| Menu and micro-feedback | Reveal navigation hierarchy and confirm intent. | Menu button opens/closes; Escape closes; focus is trapped; hover/focus/press share feedback. | Full viewport, 44px minimum targets, touch press parity. | CSS state changes only; forced-colour outlines remain visible. | No continuous loop; body/main inert state and listeners clean up. |
| Opt-in sound | Add quiet tactile confirmation to deliberate controls. | Visitor explicitly turns Sound on; hover/focus/press cues then synthesize locally. | Same control on mobile; disabling stops further cues. | Unsupported Web Audio disables the control; silence is the default and complete experience. | No downloaded audio, autoplay, background loop, or persistent node graph. |

## Timing

- Micro feedback: 120–220ms.
- Menu state: 280–480ms.
- Capability state: 320–620ms.
- Route cover/reveal: approximately 650–900ms total on desktop, shorter on mobile.
- Loader: readiness-driven, skippable, and shorter on repeat visits.
- Spatial scroll: desktop only and bounded to its opening section.

No essential content waits for an animation to finish. Repeated generic fade-up choreography, cursor replacement, mouse trails, particles, decorative WebGL, scroll hijacking, and autoplay audio remain prohibited.

## Verification contract

Each production interaction must retain: visible purpose, route ownership, trigger, reverse/re-target behaviour, resize strategy, mobile strategy, reduced-motion state, no-WebGL state where relevant, keyboard/touch equivalent, cleanup owner, measured bundle impact, and a static semantic result. Playwright covers route changes, Back/Forward, menu keyboard operation, capability selection, language, sound opt-in, reduced motion, no-WebGL, loader states, accessibility, and reviewed visual baselines.
