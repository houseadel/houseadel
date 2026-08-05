# Production decisions

Last updated: 2026-08-04

## Accepted

### Replace the earlier catalogue architecture with three primary pages

The current product brief deliberately narrows the public architecture to Home, Work, and Commissions. This supersedes the earlier primary navigation for Editions, Stories, The House, and Apply without deleting the underlying production research. Work remains an honest empty archive until approved commissions exist. Commissions combines fit, relationship, practical detail, privacy, and the existing Living Brief; legacy commission/application paths remain compatibility aliases only.

No dependency is added for this change. The existing Vite/React/TypeScript, History API router, GSAP, progressive WebGL, React Hook Form, and Zod foundations are retained.

### Use references as behavioural research only

Immersive Garden, Lando Norris, Active Theory, and Bruno Simon informed high-level behavioural qualities: sparse hierarchy, explicit sound state, decisive page changes, responsive micro-feedback, and transparent performance choices. No reference asset, typeface, source code, copy, layout, shader, mark, or distinctive composition is used. House Adel retains its self-hosted Newsreader/Manrope typography, warm ivory/ink/stone/garnet palette, ceremonial aperture, approved public-domain archival material, and original interaction system.

### Make language and sound global visitor controls

English and Indonesian are complete primary-route states, including navigation, commission fields/options/errors/review, and application receipt. The language preference updates `<html lang>` and persists locally. Sound is an optional synthesized feedback layer: it is off by default, has a visible pressed state, downloads no audio file, and never autoplays.

### Ceremonial Spatial Editorialism is the permanent direction

House Adel will use formal architectural composition softened by intimate, human material. Typography, paper-like planes, frames, apertures, lines, controlled depth, and restrained light form one authored system. The multiverse, shattered-fragment nexus, Moving House sequence, research-dashboard language, and unrelated visual worlds are superseded.

The site must distinguish Editions from Private Commissions without presenting either as a template marketplace:

> An Edition begins with a world created by House Adel.  
> A Private Commission begins with the client's world.

All self-initiated project work will be labelled exactly: **House Adel Study — Self-initiated.**

### Archive the superseded implementation before production work

The completed Moving House implementation, generated visual material, and Phase 1 review interface are preserved on branch `phase-1-research` at commit `7ec9c97` (`archive: preserve moving house direction`). `master` is restored to commit `a4a19c5` as the clean Phase 1 baseline. Production implementation must not merge the archived visual direction or its generated assets.

### Keep the production branch production-only

The archival branch is the complete recovery record for the Phase 1 research documents, reference captures, generated masters, isolated prototypes, obsolete review components, visual baselines, and direction-specific skills. Those superseded directories will be removed from `master` as the production architecture replaces them. This prevents prohibited media from entering `dist`, stops stale skills and tests from steering future work back to the discarded direction, and keeps public-branch provenance auditable. Generic asset, performance, and test utilities are retained when they are direction-neutral. The removal is recoverable from `phase-1-research`; it is not a deletion of the archive.

### Retain React, TypeScript, Vite, and npm

The existing React 19, TypeScript, Vite 8, and npm foundation is technically sound for the first production version. It already provides strict type checking through the build, code splitting, a production preview server, test tooling, and isolated WebGL chunks. Migrating to Next.js now would rewrite working infrastructure without an approved server-rendering requirement and would delay the static editorial architecture.

Vite is no longer treated as a disposable review-only choice. It is accepted for version one, subject to route fallback and form-backend deployment requirements below.

### Retain and refactor the History API router

The existing router already handles semantic links, `pushState`, `popstate`, Back/Forward navigation, document titles, scroll restoration, and route-heading focus. It will be refactored into a production route table for the required routes rather than adding a second routing library. Direct-load behavior remains an acceptance test.

The production host must rewrite unknown document requests to `index.html` while preserving real static assets. Hosting is not selected in Phase 0. The application contract is exposed at server-side `POST /api/applications`; the browser never receives provider credentials.

### Preserve progressive enhancement

Semantic HTML is authoritative for content and navigation. WebGL is a lazy-loaded homepage enhancement and must not load on unrelated routes. Native scrolling remains the default. GSAP and ScrollTrigger coordinate only motions that establish hierarchy, change spatial context, reveal material, introduce work, explain process, demonstrate function, or provide feedback. Reduced-motion and no-WebGL states must retain the complete experience.

### Use one framed aperture as the recurring spatial device

The framed aperture is the strongest continuity device for Ceremonial Spatial Editorialism. It can act as entrance, mask, editorial frame, threshold, and registration mark without creating separate visual worlds. The homepage assembles paper-like planes around one aperture and changes the visitor's spatial context through it; Edition and Story systems reuse framing and masking in flatter editorial forms.

The version-one master visual is code-drawn. It uses the static CSS/SVG composition as the immediate first frame and project-owned procedural geometry as the optional enhanced state. No raster master, texture, video, model, generated media, or external visual service is required.

### Load motion and WebGL after the static page

Home, Apply, and the Private Commissions introduction remain in the initial application chunk so their business-critical headings render synchronously. The Apply form and Private Commissions editorial body are lazy content beneath those shells. Other routes remain split; `routePreload.ts` warms only the chunk matching a direct document request.

The homepage canvas and its GSAP/ScrollTrigger timeline are separately lazy and route-local. After the complete ivory fallback renders, pointer/touch/wheel/keyboard intent requests the canvas, while wheel/touch/scroll/keyboard intent requests the timeline; a 12-second grace timer covers a quiet visitor. Reduced motion, forced colours, Save-Data, an explicit local no-WebGL preference, and the browser capability check bypass the canvas. Other route motions use the deferred motion boundary, then scope work with `gsap.context()`/`gsap.matchMedia()` and revert on unmount.

The React Three Fiber canvas uses procedural geometry, `frameloop="demand"`, capped DPR, intersection/visibility pausing, no texture payload, no real-time shadow, and no post-processing. This architecture accepts an approximately 231 KiB gzip Three.js/R3F chunk in exchange for a meaningful, resilient spatial opening. It remains isolated to the homepage and is never required for content or navigation.

### Keep application delivery server-owned and provider-neutral

The Vite development and preview servers expose `POST /api/applications` through a small Connect middleware. The endpoint enforces a 64 KB body limit, JSON-only input, an explicit honeypot rejection, independent Zod parsing and normalisation, five-attempt sliding-window rate limiting, and optional server-side Turnstile verification. Production infrastructure may run this middleware or reproduce the same handler contract in its serverless runtime.

Delivery is selected only by the server-side `HOUSE_ADEL_APPLICATION_PROVIDER` value. `mock` accepts the application in memory for local testing and deliberately does not persist private data. `email` sends a server-to-server JSON webhook. `google-sheets` signs a Google service-account assertion on the server and appends one row through the Sheets API. A missing or disabled production provider returns an error and never produces a receipt. The in-memory limiter is sufficient for one local process; a public multi-instance deployment needs a shared rate-limit store.

Turnstile remains opt-in. The client widget is implemented and loads Cloudflare's script only when `VITE_TURNSTILE_SITE_KEY` is present. The server verifies its token only when `HOUSE_ADEL_TURNSTILE_SECRET_KEY` is present. Both values must be enabled and tested together; the secret remains server-only. The paired variables are documented in `.env.example`.

Production source maps are disabled by default and can be enabled explicitly with `HOUSE_ADEL_BUILD_SOURCEMAPS=true`. Bundle analysis is written to ignored `output/bundle-report.html`, not to the deployable `dist` directory.

### Prohibit generative production assets

No generative-AI image, video, person, wedding photography, or 3D asset may enter the production branch or build. The previously generated studies are recorded in `docs/ASSET_PROVENANCE.md` and preserved only for historical recovery on the archival branch. The production build currently contains no raster image or stored visual-media asset.

### Use approved public-domain archival interiors for the first visual pass

The visual refresh uses two Met Open Access records (objects 389774 and 390163) as restrained architectural material. They are preserved as originals, transformed into AVIF/WebP derivatives, credited in `data/assets.json`, and used only as editorial references on the homepage, Editions, Private Commissions, and Stories. They are not presented as wedding photography or client work. This satisfies the no-generative/no-scraping rule while giving the composition a real material anchor.

### Apply UI UX Pro Max guidance without copying reference sites

The downloaded UI UX Pro Max skill was used to select an exaggerated-minimal editorial system, spacious 4/8/24/32/48/64/96 spacing, restrained 150–300ms interaction timing, visible loading feedback, keyboard-equivalent interactions, and image lazy-loading. Its persisted House Adel master is `design-system/house-adel/MASTER.md`. Font, mark, layout, and motion remain original House Adel work; no Brunello Cucinelli assets or proprietary font files are copied.

### Self-host the selected open-licence typography

Newsreader is the single editorial serif, with its own italic, and Manrope is the supporting neutral grotesk. The final Latin variable WOFF2 files are stored under `public/fonts/`; the SIL Open Font License 1.1 notices are distributed under `public/licenses/`. The former `@fontsource-variable` packages were removed because the site now references the reviewed local binaries directly, reducing dependency and subset ambiguity without changing the browser type system.

The three faces use `font-display: optional` and are not preloaded from the document. This avoids making 144 KiB of typography a prerequisite for first paint; on a cold, constrained visit the compatible system fallback may remain for that page view. Playwright visual comparisons and production captures explicitly warm the local fonts before taking screenshots so baselines remain deterministic.

### Enforce measured release budgets

`docs/PERFORMANCE_BUDGETS.md` fixes the local gates: LCP at or below 2,500 ms in the mobile-simulated runtime gate, CLS at or below 0.10, sampled frame-interval p95 at or below 25 ms desktop/34 ms mobile, route resources at or below 950 KiB, no sampled task over 200 ms, and no material horizontal overflow. INP remains a field target because local navigation cannot produce a real-user distribution.

The final stored runtime report (`docs/performance-results.json`, measured 2026-08-03 at 03:16 UTC) passes all seven route/viewport budgets. Home desktop is 490 KiB with LCP 184 ms and frame p95 16.8 ms; Home mobile is 490 KiB with LCP 172 ms and frame p95 16.8 ms. No measured route reports image bytes or CLS.

The final Lighthouse snapshot is lab evidence, not a field claim. Home scores 97 with LCP 2,111 ms; Editions 97 with 2,130 ms; Private Commissions 98 with 2,005 ms; Apply 96 with 2,299 ms. All measured routes score 100 for accessibility and best practices and report CLS 0. Field INP and physical integrated-GPU/mobile traces remain launch requirements.

### Accept the local production QA gate

The final cross-engine production suite passes 133 tests with 35 intentional skips and 0 failures. The accessibility suite passes 93 with 5 skips and 0 failures; visual regression passes 26 with 52 configured skips and 0 failures. The production capture manifest is complete with 80 screenshots, including the four target viewports, interaction/fallback states, and desktop/mobile master/spatial states.

Windows Playwright WebKit cannot reliably drive a small set of keyboard-specific harness cases, so those are skipped rather than converted into false failures. Equivalent keyboard flows pass in Chromium, Firefox, and Edge, and remaining WebKit coverage passes. This qualification does not replace physical Safari and VoiceOver testing.

## Dependency decisions

No dependency is installed until its purpose, limitation, and alternative are recorded here. Versions will be resolved once with npm and locked in `package-lock.json`.

| Dependency | Status | Purpose | Why existing code is insufficient | Bundle/performance implication | Alternatives considered |
| --- | --- | --- | --- | --- | --- |
| `react-hook-form` | Installed runtime dependency | Accessible form state, field registration, dirty/completion state, review editing, and efficient updates for the Living Brief | The repository had no production form-state layer; a hand-built controlled form for the required field set would duplicate registration, error, and touched-state logic | Route-loaded with the form on `/commissions`; avoids rerendering the whole form for every keystroke | A custom reducer or controlled inputs would avoid a package but increase implementation and regression risk |
| `zod` | Installed shared dependency | One application schema for client validation, server validation, limits, normalisation, and provider contracts | TypeScript types disappear at runtime and cannot validate untrusted submissions | Route-loaded with the form on `/commissions` and reused by the server adapter; no homepage or WebGL cost | Hand-written validators duplicate client/server rules; another schema library would add the same category of dependency without an existing project advantage |
| `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals` | Installed development-only toolchain | Lint TypeScript, React hooks, browser globals, server code, scripts, and Vite boundaries | `tsc --noEmit` catches type errors but not hook dependency errors, unsafe patterns, or maintainability rules | Zero production-bundle cost; adds install size and CI time only | Type checking alone does not meet the acceptance gate; a custom regex/script lint would be weaker and harder to maintain. `eslint-plugin-react` is unnecessary with the modern JSX runtime and TypeScript |
| `prettier` | Deferred; not currently justified | Automated formatting only | Existing formatting is consistent enough for the architecture phase and ESLint addresses correctness | Would have zero runtime cost but add another development dependency and command | Use editor formatting and focused ESLint rules; revisit only if formatting drift becomes measurable |

### TypeScript and lint compatibility

The first lint installation attempt exposed a real peer-dependency conflict: `typescript-eslint@8.65.0` supports TypeScript versions below `6.1`, while the Phase 1 baseline had already moved to TypeScript `7.0.2`. The install was stopped without forcing an unsupported tree. Version one will pin TypeScript to `6.0.3`, the latest TypeScript 6 release, and use ESLint 9 with the documented lint plugins. This is a development-tool compatibility choice with no browser-bundle effect. TypeScript 7 can return only after the TypeScript-aware parser declares support and the full typecheck/lint/test suite passes.

### Dependencies deliberately not proposed

- No router dependency: the existing History API layer is adequate after refactoring.
- No Framer Motion: GSAP already owns coordinated motion.
- No Lenis: native scrolling is required unless measured synchronization proves inadequate.
- No `@react-three/drei`: current procedural geometry does not need helper abstractions.
- No component library, ReactBits, Vanta, cursor package, particle package, or generic animation preset.
- No `@gsap/react` until the existing `gsap.context()` cleanup pattern proves insufficient; one lifecycle approach is preferable to overlapping wrappers.

## Deferred decisions

- Production host and serverless runtime.
- Production selection and credentialing of either the email webhook or Google Sheets provider.
- Turnstile activation and a shared production rate-limit store if the application runs on multiple instances.
- Whether human-approved project-owned or open-access photography, scans, or archival material should supplement the deliberately image-free version-one system.
- Field Core Web Vitals and physical integrated-GPU/mobile validation after a production host is selected.
- Final legal review of the Privacy and Terms copy.
- Verification that `studio@houseadel.com` is active and monitored before public launch.
