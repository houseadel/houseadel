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

### Retain React, TypeScript, Vite, and npm

The existing React 19, TypeScript, Vite 8, and npm foundation is technically sound for the first production version. It already provides strict type checking through the build, code splitting, a production preview server, test tooling, and isolated WebGL chunks. Migrating to Next.js now would rewrite working infrastructure without an approved server-rendering requirement and would delay the static editorial architecture.

Vite is no longer treated as a disposable review-only choice. It is accepted for version one, subject to route fallback and form-backend deployment requirements below.

### Retain and refactor the History API router

The existing router already handles semantic links, `pushState`, `popstate`, Back/Forward navigation, document titles, scroll restoration, and route-heading focus. It will be refactored into a production route table for the required routes rather than adding a second routing library. Direct-load behavior remains an acceptance test.

The production host must rewrite unknown document requests to `index.html` while preserving real static assets. Hosting is not selected in Phase 0. A public launch also requires a server-side `/api/apply` implementation or equivalent serverless function; the browser must never receive provider credentials.

### Preserve progressive enhancement

Semantic HTML is authoritative for content and navigation. WebGL is a lazy-loaded homepage enhancement and must not load on unrelated routes. Native scrolling remains the default. GSAP and ScrollTrigger coordinate only motions that establish hierarchy, change spatial context, reveal material, introduce work, explain process, demonstrate function, or provide feedback. Reduced-motion and no-WebGL states must retain the complete experience.

### Prohibit generative production assets

No generative-AI image, video, person, wedding photography, or 3D asset may enter the production branch or build. The previously generated studies are recorded in `docs/ASSET_PROVENANCE.md`, preserved only for historical recovery on the archival branch, and scheduled for removal from `master` before production route integration.

## Dependency decisions

No dependency is installed until its purpose, limitation, and alternative are recorded here. Versions will be resolved once with npm and locked in `package-lock.json`.

| Dependency | Status | Purpose | Why existing code is insufficient | Bundle/performance implication | Alternatives considered |
| --- | --- | --- | --- | --- | --- |
| `react-hook-form` | Proposed runtime dependency | Accessible form state, field registration, dirty/completion state, review editing, and efficient updates for the Living Brief | The repository has no production form-state layer; a hand-built controlled form for the required field set would duplicate registration, error, and touched-state logic | Client code is limited to `/apply` through route-level loading; avoids rerendering the whole form for every keystroke | A custom reducer or controlled inputs would avoid a package but increase implementation and regression risk |
| `zod` | Proposed shared dependency | One application schema for client validation, server validation, limits, normalisation, and provider contracts | TypeScript types disappear at runtime and cannot validate untrusted submissions | Loaded with `/apply` on the client and with the server adapter; no effect on homepage or WebGL chunks | Hand-written validators duplicate client/server rules; another schema library would add the same category of dependency without an existing project advantage |
| `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals` | Proposed development-only lint toolchain | Establish the missing `lint` command for TypeScript, React hooks, browser globals, and Vite refresh boundaries | `tsc --noEmit` catches type errors but not hook dependency errors, unsafe patterns, or maintainability rules; no lint script/config currently exists | Zero production-bundle cost; adds install size and CI time only | Type checking alone does not meet the acceptance gate; a custom regex/script lint would be weaker and harder to maintain. `eslint-plugin-react` is unnecessary with the modern JSX runtime and TypeScript |
| `prettier` | Deferred; not currently justified | Automated formatting only | Existing formatting is consistent enough for the architecture phase and ESLint addresses correctness | Would have zero runtime cost but add another development dependency and command | Use editor formatting and focused ESLint rules; revisit only if formatting drift becomes measurable |

### Dependencies deliberately not proposed

- No router dependency: the existing History API layer is adequate after refactoring.
- No Framer Motion: GSAP already owns coordinated motion.
- No Lenis: native scrolling is required unless measured synchronization proves inadequate.
- No `@react-three/drei`: current procedural geometry does not need helper abstractions.
- No component library, ReactBits, Vanta, cursor package, particle package, or generic animation preset.
- No `@gsap/react` until the existing `gsap.context()` cleanup pattern proves insufficient; one lifecycle approach is preferable to overlapping wrappers.

## Deferred decisions

- Production host and serverless runtime.
- Email delivery and Google Sheets providers; mock mode must work first.
- Turnstile activation and environment-specific rate-limit store.
- Final open-access objects, photography, and material assets.
- Final performance budgets after the static production architecture is measured.
- Whether the existing Newsreader/Manrope pairing is the final production pairing after browser comparison.
