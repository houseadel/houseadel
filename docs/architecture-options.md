# Application architecture options

**Status:** Phase 1 technical options; no final-site framework, WebGL architecture, CMS, or hosting decision is recorded  
**Sources accessed:** 2026-07-30

## Decision boundary

This document compares delivery architectures. It does **not** select the positioning direction, governing concept, experience architecture, nexus interaction, or asset world. The current multiverse and fractured-nexus ideas remain hypotheses.

The review interface and isolated prototypes are disposable evidence. Their dependencies do not automatically become production dependencies.

## Reading key

- **Evidence** is supported by linked official documentation.
- **Inference** is a technical deduction to validate in a House Adel spike.
- **Provisional recommendation** is a leading hypothesis, not an accepted decision.

## Required architectural outcomes

Any final candidate must:

- pre-render meaningful HTML and metadata for every public route;
- keep essential content, links, focus, and history in the semantic DOM;
- permit direct links and reliable Back/Forward navigation;
- support one persistent canvas only if the approved experience needs it;
- lazy-load project/world code and media;
- serve a designed static/no-WebGL state at the same URL;
- support transition cancellation and route cleanup;
- publish from structured content without coupling the visual scene to a CMS SDK;
- run on a static host unless an evidenced server feature is required;
- expose asset provenance and responsive variants through a manifest; and
- remain testable without a live CMS or WebGL context.

## Summary comparison

| Candidate | Static HTML / SEO | Persistent canvas | CMS/content | Operational weight | Principal concern |
| --- | --- | --- | --- | --- | --- |
| **Vite + React + TypeScript SPA** | Vite builds static assets, but Vite alone does not pre-render each application route. A separate SSG/SSR integration is required. | Straightforward: one React root can retain a canvas above route outlets. | Local typed data is simple; remote CMS fetching and preview are application work. | Low build/runtime abstraction. | Easy to ship a client-rendered shell with weak direct-route HTML. |
| **Vite + React Router Framework Mode, `ssr:false` + pre-render** | Can pre-render selected static URLs while retaining an SPA fallback, according to React Router's official guide. | Straightforward through a root layout above route outlets. | Route loaders/content adapters provide a boundary; build-time data must be available for pre-render. | Moderate; adds routing/build conventions without a server requirement. | Dynamic slugs and CMS preview need an explicit route list/build workflow. |
| **Next.js App Router** | Strong static generation and metadata options; `output: 'export'` produces route HTML. | A client canvas in a persistent root layout can survive client navigation. Next documents that layouts preserve state and remain interactive. | Strong build/server data integration and mature headless-CMS patterns. | Highest framework surface in this set. | Static export excludes features including ISR, draft mode, Server Actions, redirects/headers, and the default image optimizer. |
| **Astro + islands** | Static HTML is the default; only selected components hydrate. Excellent content-first baseline. | Possible with a hydrated island and `transition:persist`, but cross-page persistence depends on Astro's client router and matched persisted nodes. | Content collections support typed local and remote loaders. | Low client JS for editorial pages; mixed mental model for a scene-led application. | A persistent interactive canvas becomes a special cross-document island rather than the natural application root. |

## Option 1 — Vite + React + TypeScript SPA

### Evidence

Vite's static deployment guide describes a production build emitted to `dist` and deployable to static hosting ([Vite, “Deploying a Static Site”](https://vite.dev/guide/static-deploy.html)). Vite also exposes SSR APIs, but its own guide describes them as low-level and aimed in part at framework/library authors ([Vite, “Server-Side Rendering”](https://vite.dev/guide/ssr.html)).

### Fit

- Small, explicit dependency graph.
- Natural single React application root and persistent canvas.
- Full control over route-transition coordination.
- Static-host neutral.
- Appropriate for Phase 1 isolated prototypes.

### Gaps

- A plain SPA returns the same application shell for deep routes; route-specific body HTML and metadata require pre-rendering or SSR.
- Data loading, metadata, error boundaries, route manifests, and CMS preview need project conventions.
- A hand-rolled pre-render step risks becoming a private framework.

### House Adel posture

Use plain Vite for disposable prototypes and the review interface. Do not select a plain client-only SPA for the public portfolio while pre-rendered route HTML is a requirement.

## Option 2 — Vite + React Router Framework Mode

This is the justified alternative to a hand-rolled Vite SPA: it keeps the Vite/React/TypeScript base while supplying route modules and a supported pre-render path.

### Evidence

React Router documents Framework Mode as adding type-safe route modules, code splitting, and SPA/SSR/static rendering strategies ([React Router, “Picking a Mode”](https://reactrouter.com/start/modes)). Its pre-rendering guide documents:

- a static pre-render list;
- pre-render plus server rendering;
- `ssr: false` with selected routes pre-rendered; and
- an SPA fallback for URLs not emitted at build time.

Source: [React Router, “Pre-Rendering”](https://reactrouter.com/how-to/pre-rendering).

### Fit

- One persistent React root can own House Adel navigation, transition state, and—if approved—one canvas above the route outlet.
- Public routes can emit meaningful HTML while client routing preserves the interactive shell.
- Route modules give project boundaries for lazy code and error handling.
- It remains deployable as static output when content is available at build time.
- It does not require Next.js server features merely to solve direct-route HTML.

### Gaps

- The build must enumerate project slugs or obtain them from a deterministic content source.
- A dynamic CMS preview cannot be assumed in a purely static deployment.
- Route-transition behavior, title/focus announcements, and asset cancellation still require House Adel implementation and tests.
- React Router's pre-rendered SPA shape must be spiked with the chosen host's rewrite behavior.

### House Adel posture

**Provisional framework recommendation:** carry **Vite + React + TypeScript through React Router Framework Mode**, with `ssr: false`, explicit pre-rendered public routes, and a static SPA fallback, as the leading final-site hypothesis.

Why:

1. it preserves the most direct persistent-shell/canvas model;
2. it produces route HTML rather than accepting a client-only SEO/failure compromise;
3. it remains static-host neutral;
4. its route modules support lazy project worlds and bounded cleanup; and
5. it introduces less server/runtime machinery than Next.js before a server need exists.

This is not an accepted framework decision. Validate the pre-render manifest, direct-route metadata, focus/history behavior, host rewrites, and one route-cycle leak test before recording it.

### Current security gate

The Phase 1 lab does **not** include React Router. Setup trials with the current release and a second recent 7.x release produced high-severity findings in the live npm dependency audit, so both were removed rather than accepted as prototype debt. The lab uses a small native History API router because it is disposable and does not claim to solve production pre-rendering.

React Router Framework Mode remains an architectural hypothesis because its documented rendering model fits the requirements, but it cannot be selected until a clean dependency resolution is available and re-audited. This security gate is stronger than the provisional fit recommendation above.

## Option 3 — Next.js App Router

### Evidence

Next.js documents that App Router layouts preserve state, remain interactive, and do not re-render during navigation ([Next.js, “Layouts and Pages”](https://nextjs.org/docs/app/getting-started/layouts-and-pages)). Its static-export guide documents `output: 'export'`, which emits an HTML file for each route, and lists unsupported features such as cookies, redirects, headers, ISR, default image optimization, draft mode, Server Actions, and intercepting routes ([Next.js, “Static Exports”](https://nextjs.org/docs/app/guides/static-exports)).

### Fit

- Root layout is a suitable lifetime boundary for persistent navigation and a client canvas.
- Strong metadata, static parameters, error/loading boundaries, and image/content ecosystem.
- Best candidate here if later evidence requires server-rendered CMS previews, ISR, authenticated editorial tools, or other server functions.
- Static generation can still support a serverless-free public build.

### Gaps

- Static export and server-rich CMS behavior are different operating modes; House Adel must select one intentionally.
- The client canvas must be isolated behind a client-component boundary while project text can remain server/static content.
- App Router caching, server/client component boundaries, and deployment semantics add concepts that the current compact site does not yet need.
- Using Next solely because it is familiar would not justify its surface area.

### House Adel posture

Keep Next.js as the runner-up and escalation path. Promote it only if the content/preview/hosting decision establishes a real server or ISR requirement, or if a spike shows materially better publishing operations without compromising the persistent scene.

## Option 4 — Astro + islands

### Evidence

Astro describes islands as independently hydrated interactive components inside otherwise static HTML; components render without client JavaScript by default unless given a client directive ([Astro, “Islands architecture”](https://docs.astro.build/en/concepts/islands/)). Astro Content Collections support schema-validated local or remote content through loaders ([Astro, “Content Collections”](https://v6.docs.astro.build/en/guides/content-collections/)).

Astro's view-transition guide documents a client router, `transition:persist` for matching elements/islands, navigation direction handling, fallback behavior, a route announcer, and reduced-motion handling. It also documents lifecycle caveats for scripts and persisted elements ([Astro, “View Transitions”](https://docs.astro.build/en/guides/view-transitions/)).

### Fit

- Strongest default for a mostly editorial portfolio with isolated interactions.
- Excellent static/no-JavaScript result and low hydration on case studies.
- Content Collections create a clean local/CMS adapter boundary.
- A small cinematic module can remain an island without hydrating the whole page.

### Gaps

- **Inference:** If the approved architecture requires one long-lived canvas coordinating every route, Astro's cross-document/island persistence is a more complex ownership model than a single React application root.
- Persistent nodes must match across pages and use the client router; script and island lifecycle need careful testing.
- Shared WebGL state, route transition state, DOM focus, and content-island state can become three overlapping lifecycles.

### House Adel posture

Promote Astro if creative review selects an editorial/index-led architecture and WebGL becomes a bounded enhancement rather than the site's persistent connective layer. Do not reject Astro for visual reasons; reject or select it based on the approved lifecycle.

## No fourth unrelated framework yet

SvelteKit, Nuxt, Remix-style server applications, Eleventy, and custom SSR can satisfy parts of the brief. There is currently no evidenced House Adel need that they solve better enough to justify another prototype or ecosystem. React Router Framework Mode is the useful additional alternative because it directly closes plain Vite's route pre-rendering gap while retaining the likely React scene shell.

## Persistent-canvas application shape

If the creative direction earns a persistent canvas, use one owner above route content:

```text
root application/layout
├── semantic House Adel header/navigation
├── transition coordinator
├── persistent canvas owner
│   ├── renderer + camera
│   ├── adaptive quality manager
│   ├── active scene module
│   └── optional bounded transition compositor
├── route outlet
│   └── semantic page/case-study content
└── live-region/focus manager + static fallback
```

### Ownership rules

- The router owns the canonical destination and history.
- DOM route data owns project title, summary, links, and case-study evidence.
- The canvas receives derived visual state; canvas picking never creates a parallel route system.
- One transition coordinator owns cancellation and settle behavior.
- Each lazy scene registers its geometries, materials, textures, render targets, event listeners, and asynchronous work with an explicit disposal scope.
- Context loss activates the same route's static master frame.
- The persistent canvas is absent from builds/routes that do not need it until creative direction says otherwise.

## Static generation and content strategy

### Phase 1

- Keep project records in version-controlled, schema-validated local data.
- Generate route lists from those records.
- Keep visual exports in an asset manifest with provenance, rights, dimensions, fallbacks, and quality tiers.
- Do not install a CMS to simulate a future publishing need.

### CMS-ready boundary

Use a repository-owned content interface:

```ts
interface ContentSource {
  listProjects(): Promise<ProjectSummary[]>
  getProject(slug: string): Promise<Project | null>
  listPublicRoutes(): Promise<string[]>
}
```

A later local-file, headless-CMS, or remote-loader adapter satisfies the interface. Scene modules receive normalized project/asset records, never vendor SDK objects.

### Build and preview implications

| Need | Static response | Escalation trigger |
| --- | --- | --- |
| Infrequent project updates | Build on content change/webhook | None |
| Draft preview for internal review | Local preview build or protected preview deployment | Consider server framework if editors require instant unpublished preview |
| Scheduled publishing | CI/build scheduler | Server/CMS integration if scheduling cannot tolerate build delay |
| Per-request personalization | Avoid for the public studio site | Server runtime only with an approved, privacy-reviewed need |
| Live search over small portfolio | Static client index | Search service/server only after corpus and usage justify it |

## Direct Three.js versus React Three Fiber

Both use Three.js. The choice is scene ownership and integration, not “quality.”

| Criterion | Direct Three.js | React Three Fiber (R3F) |
| --- | --- | --- |
| Programming model | Imperative renderer/scene graph under complete local control | React renderer for Three.js; scenes expressed as React components |
| Fit with React shell | Requires an imperative bridge and explicit synchronization | Scene modules, suspense/error boundaries, and app state share the React model |
| Lifecycle | House Adel defines creation, invalidation, cancellation, and disposal conventions | Component lifecycle helps define ownership; non-declarative resources still require explicit cleanup |
| Render policy | Custom loop/demand invalidation | `Canvas` supports `always`, `demand`, and `never`; official docs cover demand invalidation |
| Fallback | Application creates and swaps the static state | `Canvas` exposes a fallback prop, but the full DOM fallback contract is still House Adel's responsibility |
| Low-level compositor | Most direct for a small custom render graph | Three objects remain accessible, but advanced render graphs may work against declarative boundaries |
| Ecosystem/scope | Small core; House Adel writes more infrastructure | Useful helpers, but every helper adds version, behavior, and bundle review |
| Performance claim | Baseline Three.js behavior | R3F maintainers state no overhead; treat this as a maintainer claim and measure the actual scene |

Official sources:

- Three.js installation and architecture entry point: https://threejs.org/manual/en/installation.html
- Three.js disposal: https://threejs.org/manual/en/how-to-dispose-of-objects.html
- R3F repository and maintainer performance statement: https://github.com/pmndrs/react-three-fiber
- R3F Canvas API and fallback: https://r3f.docs.pmnd.rs/api/canvas
- R3F demand rendering and adaptive performance: https://r3f.docs.pmnd.rs/advanced/scaling-performance

### Provisional renderer recommendation

Carry **React Three Fiber** as the leading production hypothesis **if** the approved experience uses a React shell plus multiple lazy, reusable project-world scene modules. Its main benefit is coherent ownership with the route/application component tree, not an assumed frame-rate advantage.

Use **direct Three.js** for isolated shader/compositor experiments and promote it to the principal renderer only if the approved visual system is one small, tightly controlled render graph whose React integration is thinner than R3F's abstraction.

Do not mix a direct application renderer and an R3F application renderer in production. A direct-Three spike and an R3F spike may coexist only as isolated Phase 1 evidence.

## Required architecture spike

Use one representative route pair and the same assets:

1. pre-render `/`, `/work`, and one `/work/:slug`;
2. mount one persistent canvas above the route outlet;
3. lazy-load one project scene;
4. navigate by link, keyboard, direct URL, Back, and Forward;
5. interrupt entry/exit three times;
6. switch reduced motion during the session;
7. simulate an asset failure and WebGL context loss;
8. cycle routes at least 20 times and log renderer resources;
9. inspect generated HTML and metadata with JavaScript disabled; and
10. deploy the static output to a temporary host to validate rewrites.

Compare direct Three.js and R3F only on the renderer-owned portion. Record bundle delta, implementation complexity, frame traces, resource disposal, fallback activation, and the amount of custom lifecycle infrastructure.

## Provisional decision statement

> **Leading application hypothesis:** Vite + React + TypeScript using React Router Framework Mode, explicit static pre-render routes, `ssr: false`, and a static SPA fallback.  
> **Leading renderer hypothesis:** one R3F canvas above the route outlet if multiple persistent/lazy React-owned worlds survive creative review.  
> **Escalation path:** Next.js when server/CMS-preview/ISR requirements are evidenced; Astro when the approved experience is content-first with only bounded interactive islands; direct Three.js when the approved scene is a small custom compositor.  
> **Decision status:** pending the architecture spike and creative-direction approval.

Do not add either hypothesis to the accepted section of `docs/decision-log.md` yet.

## Decision record requirements

When the decision is ready, record:

- approved experience architecture and whether a persistent canvas is necessary;
- framework/build mode and hosting assumptions;
- route pre-render strategy and fallback rewrite;
- principal renderer;
- canvas/scene lifetime and cleanup ownership;
- CMS/content adapter and preview workflow;
- transition/focus/history contract;
- no-WebGL and reduced-motion contract;
- measured budgets and representative devices; and
- evidence from the architecture spike.

## Official sources

- Vite, “Deploying a Static Site”: https://vite.dev/guide/static-deploy.html
- Vite, “Server-Side Rendering”: https://vite.dev/guide/ssr.html
- React Router, “Picking a Mode”: https://reactrouter.com/start/modes
- React Router, “Pre-Rendering”: https://reactrouter.com/how-to/pre-rendering
- Next.js, “Layouts and Pages”: https://nextjs.org/docs/app/getting-started/layouts-and-pages
- Next.js, “Static Exports”: https://nextjs.org/docs/app/guides/static-exports
- Next.js, “Single-Page Applications”: https://nextjs.org/docs/app/guides/single-page-applications
- Astro, “Islands architecture”: https://docs.astro.build/en/concepts/islands/
- Astro, “Content Collections”: https://v6.docs.astro.build/en/guides/content-collections/
- Astro, “View Transitions”: https://docs.astro.build/en/guides/view-transitions/
- Three.js, “Installation”: https://threejs.org/manual/en/installation.html
- Three.js, “How to dispose of objects”: https://threejs.org/manual/en/how-to-dispose-of-objects.html
- React Three Fiber, repository: https://github.com/pmndrs/react-three-fiber
- React Three Fiber, Canvas API: https://r3f.docs.pmnd.rs/api/canvas
- React Three Fiber, “Scaling performance”: https://r3f.docs.pmnd.rs/advanced/scaling-performance
