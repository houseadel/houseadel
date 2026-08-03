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

## Phase 1 - Architecture (completed)

### Work

- Implement all required routes, persistent navigation, skip link, semantic content hierarchy, and truthful static copy.
- Build the full responsive grey-box structure before complex motion.
- Define typed Edition, Story, theme, and application schemas.
- Implement application provider boundaries and an honest local/mock submission path.
- Preserve direct navigation, Back/Forward, focus behaviour, and a useful 404.

### Gate

Every route is readable and usable at all four target viewports with WebGL unavailable or motion disabled. Navigation, application schema, server validation boundary, and mock result states have automated coverage.

### Completion record

- Implemented the complete required route tree, production shell, truthful static content, and responsive layouts.
- Added typed Edition and Story systems, a working Edition demonstration, atelier table, Stories stage, drawn House line, Living Brief, and honest confirmation state.
- Added independent client/server validation and mock/email/Sheets provider boundaries.
- Removed the archived direction and all generated media from the production path while preserving recovery on `phase-1-research`.
- Passed lint, typecheck, unit, build, provenance, API behavior, and the Chromium static route/interaction gate.

## Phase 2 - Design system (completed)

### Work

- Establish palette, typography, spacing, grid, frame, layer, focus, form, image, and responsive tokens.
- Build restrained editorial primitives and page-composition components.
- Resolve desktop and mobile typography/cropping before animation.

### Gate

All routes share one coherent system, meet contrast and touch-target requirements, have no horizontal overflow, and pass visual review at the four target viewports.

### Completion record

- Established warm ivory, ink, stone, scarce garnet, and muted metallic tokens; one Newsreader display family and one Manrope sans family; spacing, frame, focus, form, and responsive-grid tokens.
- Self-hosted the reviewed Latin variable font files with their OFL notices and removed the superseded Fontsource runtime packages.
- Applied the aperture, paper-plane, register-line, and editorial-plate system across every route without introducing a component-library visual language.
- Added automated contrast, focus, touch-target, and horizontal-overflow checks plus four-viewport screenshot coverage.

## Phase 3 - Motion prototypes (completed)

### Work

Build and evaluate isolated prototypes for:

1. homepage spatial assembly and aperture;
2. Edition SVG marker-mask reveal;
3. Stories focus/hover visual stage;
4. The House continuous path draw;
5. Apply live brief composition.

### Gate

Each prototype has a narrative purpose, viewport-specific behaviour, reduced-motion equivalent, cleanup verification, and measured performance. Reject any prototype that merely decorates the page.

### Completion record

- Accepted a short static-first homepage assembly and aperture passage driven by one reversible ScrollTrigger timeline.
- Accepted project-owned SVG reveal masks for Edition plates, the focus/hover Story stage, one continuous House path, and the six-state Living Brief assembly.
- Added the atelier-table fragment-to-register sequence as the Private Commission process demonstration.
- Rejected texture, image-sequence, decorative particle, sound, and unrelated WebGL work because the code-native system carries the current narrative without unapproved media.

## Phase 4 - Integration (completed)

### Work

- Integrate accepted motion route by route, beginning with the static experience.
- Lazy-load homepage WebGL only; use procedural, simple geometry and DOM typography.
- Add Edition live demonstration, Private Commissions atelier table, Stories stage, House line, and living brief.
- Test rapid scrolling, resizing, keyboard/touch operation, route changes, hidden-tab behaviour, and cleanup after each integration.

### Gate

All core content survives no WebGL and reduced motion. No unrelated route loads homepage WebGL. Animations remain reversible/interruption-safe, and navigation is always immediately available.

### Completion record

- Integrated route motion through deferred GSAP imports, scoped contexts, viewport media queries, and explicit cleanup.
- Lazy-loaded the route-local homepage canvas after the complete static composition; capped DPR, used demand rendering, and paused by stage/document visibility.
- Preserved reduced-motion, forced-colour, Save-Data, failed-WebGL, explicit no-WebGL, and slow-load fallbacks.
- Added browser coverage for reverse scrub, route cleanup, rapid scroll/resize, slow WebGL, and proof that editorial routes do not request the WebGL chunk.

## Phase 5 - Application backend (completed)

### Work

- Add React Hook Form and Zod only after their dependency decision is recorded.
- Implement client and server validation, sanitisation, limits, honeypot, rate-limit interface, and optional Turnstile boundary.
- Implement mock/local, email, and Google Sheets provider interfaces without exposing credentials.
- Add editable review, local non-sensitive autosave, confirmation, privacy, and error states.

### Gate

Mock mode passes validation/submission tests without deceptive success. Missing provider credentials produce an explicit unavailable/error result. Sensitive data is not persisted client-side.

### Completion record

- Implemented the five-section React Hook Form/Zod application, non-sensitive autosave, progress rail, live brief, editable review, and guarded receipt route.
- Added independent server parsing, normalisation, sanitisation, a 64 KiB JSON limit, honeypot, rate limiter interface, and clear method/provider errors.
- Added in-memory mock, server-to-server email webhook, and server-owned Google Sheets adapters.
- Added the optional client widget and server verification boundaries for paired Turnstile environment keys.

## Phase 6 - Asset system (completed for the image-free version one)

### Work

- Create the open-access acquisition script and complete asset manifest/provenance records.
- Permit only project-owned, verified public-domain/CC0, or manually approved licensed material.
- Preserve originals, create deterministic derivatives, credit public-domain sources, and prevent silent overwrites.
- Remove prohibited generative production assets only after the decision and removal scope are documented.

### Gate

The provenance checker reports no unrecorded production image. No generative, unclear-rights, scraped, or fabricated asset or claim is present in the public build.

### Completion record

- Implemented the fail-closed Met, Rijksmuseum, and Smithsonian acquisition script, derivative pipeline, provenance manifest, and design-guardian audit.
- Chose no acquired image for version one. `data/assets.json` remains empty and the public visual system is CSS, SVG, typography, and procedural geometry.
- Stored only the local OFL-licensed Manrope/Newsreader WOFF2 files and their licence notices under `public/`.
- Kept prohibited Phase 1 generated media on the archival branch and out of the production build.

## Phase 7 - Final quality pass (completed for local production)

### Work

- Remove duplicate/dead production code and unused dependencies with reasons recorded.
- Inspect console output, slow network, failed assets, no WebGL, reduced motion, forced colours, mobile interaction, and route transitions.
- Run lint, typecheck, unit, Playwright, accessibility, visual regression, production build, asset audit, bundle analysis, and Lighthouse.
- Save required screenshots for every route plus open navigation, Edition preview, application validation/review, reduced-motion home, and no-WebGL home.
- Update `docs/STATUS.md` with launch requirements and known limitations.

### Gate

All required commands pass; the acceptance targets are evaluated without concealment; screenshots and provenance are saved; all stopping conditions in `AGENTS.md` are met; and the final checkpoint contains no secrets or prohibited assets.

### Completion record

- Passed the final lint, typecheck, unit, production-build, structure, provenance, asset, dependency, bundle, runtime-budget, and Lighthouse gates.
- Passed the production cross-engine suite with 133 passed, 35 skipped, and 0 failed; accessibility with 93 passed, 5 skipped, and 0 failed; visual regression with 26 passed, 52 configured skips, and 0 failed.
- Generated the final complete 80-screenshot production manifest at 2026-08-03T03:47:37.926Z, covering every route at all four required viewports plus navigation, Edition preview, application validation/review, reduced motion, no WebGL, and desktop/mobile master/spatial states.
- Passed all seven runtime budgets. Final Lighthouse performance is 97 Home, 97 Editions, 98 Private Commissions, and 96 Apply; every measured route has LCP below 2.5 seconds, accessibility 100, best practices 100, and CLS 0.
- Confirmed the final build has no production image, video, model, generative media, secret, or unrelated-route WebGL request.
- Qualified the Windows Playwright WebKit keyboard-harness skips and preserved physical Safari/VoiceOver, physical mobile/integrated-GPU testing, field Core Web Vitals, hosting/API deployment, real provider credentials, shared rate limiting, and human legal/business review as public-launch requirements rather than unfinished local implementation.

### Gate result

Met on 2026-08-03 for local production. Public launch requirements are tracked in `docs/STATUS.md`.
