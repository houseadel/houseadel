# Production status

Last updated: 2026-08-02

## Current milestone

**Phase 1 — Architecture: complete. Phase 2/3 visual and motion integration is next.**

The production information architecture is live in the local Vite build. Every required route has semantic content, persistent navigation, a responsive static composition, deep-link handling, Back/Forward behavior, and a truthful not-found state. The Edition catalogue, live invitation demonstration, Private Commissions atelier table, Stories system, drawn-line House page, and Living Brief application are all usable before complex motion.

The Moving House implementation remains recoverable from branch `phase-1-research` at commit `7ec9c97`. Its generated masters, public derivatives, review captures, and obsolete visual baselines have been removed from `master`. The current production build contains no raster image or generative asset.

## Completed in this milestone

- Created all required routes: `/`, `/editions`, `/editions/:slug`, `/private-commissions`, `/stories`, `/stories/:slug`, `/the-house`, `/apply`, `/application-received`, `/privacy`, `/terms`, and a 404 state.
- Rebuilt the shell with a skip link, persistent mark and navigation, mobile menu, semantic footer, route announcements, titles, focus restoration, and direct-route support.
- Added typed Edition and Story data with three Edition studies and four Story studies. Every study is labelled `House Adel Study — Self-initiated.` and no client, wedding, result, award, location, testimonial, or team member is fabricated.
- Built the interactive Edition preview, desktop/mobile switch, sample personalisation, EN/FR navigation, and local-only RSVP demonstration.
- Built the Private Commissions atelier table, process, disciplines, availability, and minimum investment structure.
- Built the Stories focus/hover stage and reusable eleven-part story detail architecture.
- Built The House drawn-line structure and factual founder language for Marshall Phan.
- Built the five-part application, fixed progress rail, live brief, non-sensitive autosave, validation, editable review state, and honest confirmation route.
- Added server-side validation, a 64 KB request limit, honeypot rejection, in-memory rate-limit interface, optional Turnstile boundary, and mock/email/Google Sheets provider adapters.
- Added the fail-closed Met, Rijksmuseum, and Smithsonian acquisition pipeline plus `data/assets.json`; no media has been downloaded.
- Established tokens, typography, responsive grids, editorial components, CSS Modules, ESLint, standalone type checking, and bundle reporting.

## Verification performed

| Check | Result |
| --- | --- |
| `npm run lint` | Passed with zero warnings |
| `npm run typecheck` | Passed |
| `npm test` | 1 file, 6 tests passed |
| `npm run build` | Passed; 162 modules; no source maps; bundle report written outside `dist` |
| Chromium production route/interaction gate | Required static routes, Back/Forward, 404, Edition demo, fallback, and resize checks passed |
| Application API checks | Mock `202`; disabled provider `503`; honeypot `400`; invalid JSON `400`; unsupported method `405` |
| `npm run audit:provenance` | Passed; zero production image files and zero unrecorded files |
| Browser review | Root at 1440 × 900 and 390 × 844; all distinct page types at 1440 × 900 |

## Files changed

- `src/App.tsx`, `src/lib/router.tsx`, `src/components/layout/`, `src/pages/`, `src/features/`, `src/data/`, and `src/styles/` — production route, content, component, form, and visual architecture.
- `server/applications/` and `vite.config.ts` — local/preview application endpoint and provider boundary.
- `data/assets.json`, `scripts/fetch-open-access-assets.ts`, and `docs/ASSET_PROVENANCE.md` — rights-gated asset workflow.
- `package.json`, `package-lock.json`, `eslint.config.js`, and `tsconfig.json` — approved dependencies, lint/typecheck, scripts, and server scope.
- `tests/` — production unit and browser expectations replacing the obsolete research interface.
- `public/assets/worlds/`, `references/captures/phase-1/`, `references/masters/prototype-worlds/`, `src/assets/review-captures/`, and obsolete Phase 1 visual baselines — generated media removed from `master`, recoverable on the archive branch.

## Unresolved before public launch

- Integrate and visually approve the procedural homepage scene and purpose-led GSAP interactions; static fallbacks already exist.
- Complete all four-viewport screenshots, special-state visual baselines, full cross-browser, accessibility, slow-network, performance, and Lighthouse gates after motion integration.
- Confirm that `studio@houseadel.com` is an active receiving address.
- Select the production host and reproduce the `/api/applications` contract in its server/serverless runtime.
- Configure and test an external email or Google Sheets provider. Mock mode is intentionally non-persistent.
- Add a Turnstile client widget before enabling its server secret.
- Replace or supplement code-native material studies only with project-owned or human-approved public-domain/CC0 assets if the creative review calls for imagery.

## Next milestone

**Phase 2/3 — refine the production design system and evaluate the five isolated motion prototypes.** Integrate only the motions that materially establish hierarchy, change spatial context, reveal material, introduce a project, explain process, demonstrate function, or provide feedback.
