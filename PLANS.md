# House Adel Production Plan

The permanent direction is **Ceremonial Spatial Editorialism**. Work advances only when the acceptance gate for the current phase is met. Git checkpoints follow each accepted phase.

## Phase 0 - Audit (completed)

### Work

- Inventory the framework, package manager, routes, components, styling, dependencies, assets, hosting assumptions, duplication, and broken code.
- Run the current site and capture every existing route at 1440 x 900, 1024 x 768, 430 x 932, and 390 x 844.
- Run all currently available lint, typecheck, unit, browser, and production-build checks; record missing commands separately from failures.
- Identify public generative assets and discarded Moving House/Phase 1 presentation code without deleting it during the audit.
- Establish governance, decision, direction, information-architecture, motion, provenance, and status records.

### Completion record

- Confirmed baseline: npm, Vite 8, React 19, TypeScript, GSAP/ScrollTrigger, Three.js, and React Three Fiber.
- Preserved the superseded Moving House direction on `phase-1-research` at commit `7ec9c97`.
- Captured 44 baseline screenshots across the four required viewports and inspected every existing route/state.
- Recorded passing unit, structure, typecheck, and build checks together with all browser-suite failures.
- Classified every existing public visual as prohibited generative material and documented its recoverable removal sequence.
- Established the production governance files and repository-local design-guardian skill.

### Gate

Met on 2026-08-02. Production implementation may begin after the governance checkpoint is committed and the prohibited production assets are removed from `master`.

## Phase 1 - Architecture

### Work

- Implement all required routes, persistent navigation, skip link, semantic content hierarchy, and truthful static copy.
- Build the full responsive grey-box structure before complex motion.
- Define typed Edition, Story, theme, and application schemas.
- Implement application provider boundaries and an honest local/mock submission path.
- Preserve direct navigation, Back/Forward, focus behaviour, and a useful 404.

### Gate

Every route is readable and usable at all four target viewports with JavaScript enhancement absent or motion disabled. Navigation, application schema, server validation boundary, and mock result states have automated coverage.

## Phase 2 - Design system

### Work

- Establish palette, typography, spacing, grid, frame, layer, focus, form, image, and responsive tokens.
- Build restrained editorial primitives and page-composition components.
- Resolve desktop and mobile typography/cropping before animation.

### Gate

All routes share one coherent system, meet contrast and touch-target requirements, have no horizontal overflow, and pass visual review at the four target viewports.

## Phase 3 - Motion prototypes

### Work

Build and evaluate isolated prototypes for:

1. homepage spatial assembly and aperture;
2. Edition SVG marker-mask reveal;
3. Stories focus/hover visual stage;
4. The House continuous path draw;
5. Apply live brief composition.

### Gate

Each prototype has a narrative purpose, viewport-specific behaviour, reduced-motion equivalent, cleanup verification, and measured performance. Reject any prototype that merely decorates the page.

## Phase 4 - Integration

### Work

- Integrate accepted motion route by route, beginning with the static experience.
- Lazy-load homepage WebGL only; use procedural, simple geometry and DOM typography.
- Add Edition live demonstration, Private Commissions atelier table, Stories stage, House line, and living brief.
- Test rapid scrolling, resizing, keyboard/touch operation, route changes, hidden-tab behaviour, and cleanup after each integration.

### Gate

All core content survives no WebGL and reduced motion. No unrelated route loads homepage WebGL. Animations remain reversible/interruption-safe, and navigation is always immediately available.

## Phase 5 - Application backend

### Work

- Add React Hook Form and Zod only after their dependency decision is recorded.
- Implement client and server validation, sanitisation, limits, honeypot, rate-limit interface, and optional Turnstile boundary.
- Implement mock/local, email, and Google Sheets provider interfaces without exposing credentials.
- Add editable review, local non-sensitive autosave, confirmation, privacy, and error states.

### Gate

Mock mode passes validation/submission tests without deceptive success. Missing provider credentials produce an explicit unavailable/error result. Sensitive data is not persisted client-side.

## Phase 6 - Asset system

### Work

- Create the open-access acquisition script and complete asset manifest/provenance records.
- Permit only project-owned, verified public-domain/CC0, or manually approved licensed material.
- Preserve originals, create deterministic derivatives, credit public-domain sources, and prevent silent overwrites.
- Remove prohibited generative production assets only after the decision and removal scope are documented.

### Gate

The provenance checker reports no unrecorded production image. No generative, unclear-rights, scraped, or fabricated asset or claim is present in the public build.

## Phase 7 - Final quality pass

### Work

- Remove duplicate/dead production code and unused dependencies with reasons recorded.
- Inspect console output, slow network, failed assets, no WebGL, reduced motion, forced colours, mobile interaction, and route transitions.
- Run lint, typecheck, unit, Playwright, accessibility, visual regression, production build, asset audit, bundle analysis, and Lighthouse.
- Save required screenshots for every route plus open navigation, Edition preview, application validation/review, reduced-motion home, and no-WebGL home.
- Update `docs/STATUS.md` with launch requirements and known limitations.

### Gate

All required commands pass; the acceptance targets are evaluated without concealment; screenshots and provenance are saved; all stopping conditions in `AGENTS.md` are met; and the final checkpoint contains no secrets or prohibited assets.
