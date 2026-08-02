# Production decisions

Last updated: 2026-08-02

## Accepted

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

### Keep application delivery server-owned and provider-neutral

The Vite development and preview servers expose `POST /api/applications` through a small Connect middleware. The endpoint enforces a 64 KB body limit, JSON-only input, an explicit honeypot rejection, independent Zod parsing and normalisation, five-attempt sliding-window rate limiting, and optional server-side Turnstile verification. Production infrastructure may run this middleware or reproduce the same handler contract in its serverless runtime.

Delivery is selected only by the server-side `HOUSE_ADEL_APPLICATION_PROVIDER` value. `mock` accepts the application in memory for local testing and deliberately does not persist private data. `email` sends a server-to-server JSON webhook. `google-sheets` signs a Google service-account assertion on the server and appends one row through the Sheets API. A missing or disabled production provider returns an error and never produces a receipt. The in-memory limiter is sufficient for one local process; a public multi-instance deployment needs a shared rate-limit store.

Turnstile remains opt-in. The server verifies tokens only when `HOUSE_ADEL_TURNSTILE_SECRET_KEY` is present. The secret must be enabled only after the public widget is configured with `VITE_TURNSTILE_SITE_KEY`; the two values are documented together in `.env.example`.

Production source maps are disabled by default and can be enabled explicitly with `HOUSE_ADEL_BUILD_SOURCEMAPS=true`. Bundle analysis is written to ignored `output/bundle-report.html`, not to the deployable `dist` directory.

### Prohibit generative production assets

No generative-AI image, video, person, wedding photography, or 3D asset may enter the production branch or build. The previously generated studies are recorded in `docs/ASSET_PROVENANCE.md`, preserved only for historical recovery on the archival branch, and scheduled for removal from `master` before production route integration.

## Dependency decisions

No dependency is installed until its purpose, limitation, and alternative are recorded here. Versions will be resolved once with npm and locked in `package-lock.json`.

| Dependency | Status | Purpose | Why existing code is insufficient | Bundle/performance implication | Alternatives considered |
| --- | --- | --- | --- | --- | --- |
| `react-hook-form` | Installed runtime dependency | Accessible form state, field registration, dirty/completion state, review editing, and efficient updates for the Living Brief | The repository had no production form-state layer; a hand-built controlled form for the required field set would duplicate registration, error, and touched-state logic | Route-loaded only with `/apply`; avoids rerendering the whole form for every keystroke | A custom reducer or controlled inputs would avoid a package but increase implementation and regression risk |
| `zod` | Installed shared dependency | One application schema for client validation, server validation, limits, normalisation, and provider contracts | TypeScript types disappear at runtime and cannot validate untrusted submissions | Route-loaded with `/apply` and reused by the server adapter; no homepage or WebGL cost | Hand-written validators duplicate client/server rules; another schema library would add the same category of dependency without an existing project advantage |
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
- Final open-access objects, photography, and material assets.
- Final performance budgets after the static production architecture is measured.
- Whether the existing Newsreader/Manrope pairing is the final production pairing after browser comparison.
