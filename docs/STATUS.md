# Production status

Last updated: 2026-08-02

## Current milestone

**Phase 0 — Audit: completed with baseline failures recorded.**

The superseded site was inspected and run before production changes. Its framework, routes, components, styling, dependencies, assets, hosting assumptions, and duplicated/obsolete direction code were inventoried. Production implementation has **not** started; the current `master` remains the Phase 1 direction-lab baseline while the documented removal gate is completed.

The Moving House work is preserved on branch `phase-1-research` at commit `7ec9c97`. `master` is at `a4a19c5`. This is the recovery boundary for the prohibited generated assets and superseded interaction direction.

## Audit artifacts and files changed

- `phase-1-research` / `7ec9c97` — archival branch and commit containing the Moving House implementation and its generated source/derivative assets.
- `output/playwright/audit-current/` — 44 local audit screenshots: 11 routes or route states at `1440 × 900`, `1024 × 768`, `430 × 932`, and `390 × 844`.
- `docs/ASSET_PROVENANCE.md` — production eligibility, Phase 0 asset inventory, and safe generated-asset removal plan.
- `AGENTS.md` and `PLANS.md` — production operating contract and phased acceptance plan.
- `docs/CREATIVE_DIRECTION.md` — permanent Ceremonial Spatial Editorialism system.
- `docs/INFORMATION_ARCHITECTURE.md` — production route and content contract.
- `docs/MOTION_SPEC.md` — purposeful motion grammar, fallbacks, and verification rules.
- `docs/DECISIONS.md` — governing direction, archive, stack/router/hosting, enhancement, and dependency decisions.
- `docs/STATUS.md` — this milestone record.
- `skills/house-adel-design-guardian/` — repository-local visual, motion, accessibility, and provenance guardrails with a deterministic asset audit.

The screenshot set covers the then-current homepage, Phase 1 review route, three prototype routes, three study routes, two Moving House work routes, and not-found state. It is internal audit evidence and must not be deployed or shown as public reference imagery.

## Verification performed

| Command | Exit | Result |
| --- | ---: | --- |
| `npm.cmd test` | 0 | 1 file / 2 tests passed |
| `npm.cmd run audit:structure` | 0 | 14 required entries found |
| `npm.cmd run build` | 0 | `tsc --noEmit` passed; Vite processed 61 modules in 2.95 s; WebGL chunk warning: 881.22 kB minified / 234.03 kB gzip |
| `npm.cmd run test:e2e` | 1 | 217 total: 125 passed, 58 skipped, 34 failed in 3.2 minutes |
| `npm.cmd run test:a11y` | 1 | 70 total: 55 passed, 4 skipped, 11 failed in 1.5 minutes |

No `lint` or standalone `typecheck` script exists. Type checking currently runs only as the first part of `npm.cmd run build`.

The browser-suite failures are not concealed:

- all 31 Firefox cases failed during browser startup;
- route-heading focus failed on direct loads in Edge and mobile Chromium;
- WebKit route-heading focus was intermittent;
- arrival visual readiness was intermittent.

These are baseline failures. A green production test suite has not yet been achieved.

## Phase 0 findings

- Stack: React 19, TypeScript, Vite 8, npm, GSAP/ScrollTrigger, Three.js, and React Three Fiber.
- Routing: a custom History API router with lazy prototype routes; no production information architecture exists yet.
- Styling: one approximately 2,895-line global stylesheet in the Phase 1 baseline; the archived Moving House addition adds another large page stylesheet and a 441-line component. Both are poor production component boundaries.
- Assets: generated Phase 1 masters and public derivatives remain on `master`; generated Moving House assets are isolated on the archival branch. Neither set is eligible for production.
- Hosting: no deployment configuration or provider is selected. Vite produces a static SPA and therefore requires a host rewrite for direct routes. Real application submission additionally requires a server-side or serverless endpoint.
- Tests: unit, structural audit, typecheck, and build pass; the existing cross-browser and accessibility suites do not pass.

## Unresolved issues

- Remove every generated master, derivative, capture, baseline, and import from the production branch after the provenance decision is committed and before public-route integration.
- Replace the Phase 1 route switch, research interface, generated studies, global CSS concentration, and superseded test expectations with the production architecture.
- Diagnose or provision the Firefox runtime rather than marking its 31 startup failures as application passes.
- Fix deterministic route-heading focus across Edge, mobile Chromium, and WebKit.
- Make visual readiness deterministic and replace obsolete Phase 1 visual baselines.
- Add and pass an ESLint command; retain build-based type checking or add a standalone alias.
- Select a production host and serverless runtime before real submissions can be enabled.
- Obtain email and/or Google Sheets credentials only when a provider is selected. Mock mode must report itself honestly and must not imply external delivery.
- Build `data/assets.json`, the open-access acquisition script, and the unrecorded-image report before adding production imagery.
- Establish production performance measurements after the semantic grey-box is integrated; the current WebGL warning is a baseline, not an accepted budget.

## Next milestone

**Phase 1 — Architecture.**

Create the complete semantic route structure, persistent navigation, static content hierarchy, responsive grey-box layouts, application schema/provider boundaries, honest mock submission path, not-found state, and no-WebGL/reduced-motion content fallbacks. Remove prohibited generated assets from the production path. Do not begin complex motion until this milestone is reviewable in the browser and its navigation, focus, direct loads, Back/Forward behavior, mobile menu, and static form flow pass.
