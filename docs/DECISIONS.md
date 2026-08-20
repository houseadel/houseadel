# Production decisions

Last updated: 2026-08-17

## Accepted

### Dissolve routes with a vector contour, not a rasterised page

The page transition is an organic dissolve driven by navigation. A coarse field of layered value noise plus a directional gradient is generated per navigation on the CPU. A GSAP timeline drives one progress value; a threshold sweeps the field; the *document* clips the incoming route to the marching-squares contour of that threshold while the outgoing route stays mounted underneath. Both routes are therefore live DOM for the whole movement — real text, real fonts, real WebGL — and the boundary between them is a vector path with no resolution to lose. A transparent WebGL layer samples the same field as a texture and draws only the fine breakup and a narrow spectral edge along the same contour.

Three alternatives were measured and rejected. Rasterising the DOM to a texture was ruled out by the brief and by its known failures (fonts, cross-origin media, live WebGL). Masking live DOM per pixel with an SVG `feComponentTransfer` filter was built and benchmarked: it ran at 83ms median against a 16.7ms baseline in Chromium — thirteen rendered frames in 1.6 seconds — and hung WebKit outright. A shader veil painted in the ground colour was rejected on the brief's own terms, because a layer between two pages can only ever hide one of them, so the handover collapses back into a curtain over a swap.

The chosen approach measures at parity with doing nothing: on a GPU, idle Home and Home-with-the-clip-applied-every-frame both run at 16.7ms. Contour generation costs 0.4–1.9ms of JavaScript per frame.

Buttermax was to be reviewed again as behavioural reference for the chromatic principle; it renders nothing under automation, so the colour behaviour follows the written brief instead. No reference asset, source code, shader, mark or composition is used. Only one principle is taken: a monochrome world may briefly break into colour while it is moving.

### Build the transition's WebGL context once, not per navigation

The superseded transition constructed a renderer, scene, geometry, material and canvas on every navigation and tore them down a second later. That churn destabilised the page badly enough that the effect shipped disabled behind a constant. There is now one context, created lazily at idle after first load and kept for the life of the document; a navigation sets uniforms and draws. Backing-store size is written together with the CSS size from a capped device pixel ratio — 2 on desktop, 1.5 on narrow screens — and measured from the layer the canvas occupies rather than from `window.innerWidth`, which includes a scrollbar the layer does not have.

The morphing-relief stage, its displaced surface, its depth map and the metaball membrane are removed. That direction put a 3D object into every navigation, which is an object arriving rather than a page changing, and it is the wrong idea for a route change.

### Use Google Apps Script as the only inquiry server layer

The public site remains a static Vite build, deployed on Cloudflare Pages. The visitor-facing enquiry is a custom React form and does not embed or imitate Google Forms. It sends a CORS-safelisted `text/plain` request containing JSON to one Apps Script Web App. ContentService returns the acceptance JSON. If a browser cannot read the cross-origin POST after Apps Script's redirect, the client repeats the same duplicate-safe submission as an opaque request and verifies its exact inquiry ID through a narrowly scoped JSONP status response. The browser never treats the opaque delivery alone as success.

`google-apps-script/Code.gs` creates the private 13-field Google Form and its linked response Sheet, stores their IDs in Script Properties, and reuses them when setup runs again. `doPost` validates and normalizes the public payload, checks a honeypot and minimum completion time, serializes writes with a script lock, suppresses recently repeated inquiry IDs, creates a FormResponse, and submits it. Google owns all credentials. The frontend contains only the public `/exec` routing URL and non-secret source/version labels in `src/config/commissionBackend.ts`.

The former Vite Connect `/api/applications` middleware, server providers, service-account Sheets integration, email webhook, and Turnstile client were removed. They could not run on a static host and introduced a server architecture the selected deployment does not have — true of GitHub Pages, evaluated at the time, and equally true of Cloudflare Pages' plain static deployment, since neither runs server code for a project that does not opt into one.

**Contact** is now the single public inquiry entry point. `/begin-a-project` remains a compatibility alias rendering the same Contact component, and every internal inquiry link points to `/contact`. "Commission Inquiry" is used only for the private Form, Sheet, script, and technical documentation.

### Signal transitions, paint memory and sculptural footer

Buttermax was reviewed as behavioural reference only. Its liquid response, decisive chromatic interruption and object-led closing informed the interaction categories, but no reference asset, source code, shader, mark, layout or distinctive composition is used. House Adel retains its own dark pearl field, ivory type and restrained metallic accent.

Route changes now use one short 2D-canvas signal break. Inverse pixel blocks and displaced spectral edges close briefly to the site ground before the incoming route is revealed. Keeping this effect in Canvas 2D avoids creating another WebGL context during navigation. Reduced-motion and forced-colour states bypass it and navigate immediately.

The background-only version of this was superseded on 2026-08-15; see "Move the liquid response to the final composite" below.

Particle sculptures receive a separate one-shot spectral ripple when the pointer first enters their visible form. The ripple restores local opacity while it passes, then ends; ordinary movement does not continuously retrigger it until the pointer leaves and re-enters. The global footer uses the surface-sampled `work-cloud.bin` derivative of the supplied `3d work.stl`, oriented upright and paused when off screen. No runtime dependency was added.

### Treat Work as a near-camera garden and keep invitation ornament image-only

Immersive Garden was reviewed as behavioural and aesthetic research only. Its use of oversized, viewport-clipped botanical presence, sparse typography, negative space, and continuous WebGL movement informed the direction. No reference asset, layout, source code, shader, copy, or distinctive composition is used.

The Work enhancement is a transparent foreground layer above the project typography. Its planting begins a short autonomous assembly as soon as the chapter becomes active, continues with restrained air and camera drift without requiring scroll, and uses a separate narrow-viewport arrangement. Scroll only adjusts the framing. Direct visits to `/work` are positioned at the Work chapter before passive chapter measurement can rewrite the URL. Reduced motion continues to omit the WebGL layer without hiding any project content.

The invitation uses public-domain artwork, typography, colour fields, imagery, and whitespace as its visual material. Decorative CSS rules, rings, frames, swatches, outlines, gradients, and pseudo-element ornament are excluded. Essential form affordances use quiet colour fills and accessible focus outlines. The site-wide ring loader and cursor companion are not mounted on `/invitation`, so the rule applies from the first frame.

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

Cloudflare Pages builds and deploys the static `dist` artifact directly from this repository; the former GitHub Actions workflow that deployed to GitHub Pages has been removed. `public/_redirects` sends every route to `index.html` with a 200 (not a 404-copy trick) so direct application routes enter the History API app at the address the visitor actually requested, while real assets continue to resolve first. Inquiry submission posts to the configured Apps Script Web App; the browser receives no Google credentials.

### Preserve progressive enhancement

Semantic HTML is authoritative for content and navigation. WebGL is a lazy-loaded homepage enhancement and must not load on unrelated routes. Native scrolling remains the default. GSAP and ScrollTrigger coordinate only motions that establish hierarchy, change spatial context, reveal material, introduce work, explain process, demonstrate function, or provide feedback. Reduced-motion and no-WebGL states must retain the complete experience.

### Use one framed aperture as the recurring spatial device

The framed aperture is the strongest continuity device for Ceremonial Spatial Editorialism. It can act as entrance, mask, editorial frame, threshold, and registration mark without creating separate visual worlds. The homepage assembles paper-like planes around one aperture and changes the visitor's spatial context through it; Edition and Story systems reuse framing and masking in flatter editorial forms.

The version-one master visual is code-drawn. It uses the static CSS/SVG composition as the immediate first frame and project-owned procedural geometry as the optional enhanced state. No raster master, texture, video, model, generated media, or external visual service is required.

### Load motion and WebGL after the static page

Home, Apply, and the Private Commissions introduction remain in the initial application chunk so their business-critical headings render synchronously. The Apply form and Private Commissions editorial body are lazy content beneath those shells. Other routes remain split; `routePreload.ts` warms only the chunk matching a direct document request.

The homepage canvas and its GSAP/ScrollTrigger timeline are separately lazy and route-local. After the complete ivory fallback renders, pointer/touch/wheel/keyboard intent requests the canvas, while wheel/touch/scroll/keyboard intent requests the timeline; a 12-second grace timer covers a quiet visitor. Reduced motion, forced colours, Save-Data, an explicit local no-WebGL preference, and the browser capability check bypass the canvas. Other route motions use the deferred motion boundary, then scope work with `gsap.context()`/`gsap.matchMedia()` and revert on unmount.

The React Three Fiber canvas uses procedural geometry, `frameloop="demand"`, capped DPR, intersection/visibility pausing, no texture payload, no real-time shadow, and no post-processing. This architecture accepts an approximately 231 KiB gzip Three.js/R3F chunk in exchange for a meaningful, resilient spatial opening. It remains isolated to the homepage and is never required for content or navigation.

### Keep the static inquiry contract narrow

The browser validates the custom form with Zod, generates a non-identifying inquiry ID, adds submission time, source, frontend version, and a form-start timestamp, then sends one request directly to Apps Script. The endpoint URL is not a credential. Hidden metadata and inquiry IDs are organizational signals, not authentication.

The form uses progressive disclosure for one optional freeform answer. Collapsing it preserves the answer. Reference material is accepted only as links at this stage. There is no capability grid, qualification category, file upload, budget, or pricing question.

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

### Extend Ceremonial Spatial Editorialism with a bolder interaction layer

The 2026-08-06 direction review raised the studio's motion and interaction ambition toward the complexity of leading creative-technology practices while keeping House Adel's own restrained material system, editorial voice discipline, and accessibility contract. This is treated as an intensification of the existing grammar (assembly, uncovering, framing, depth change, typographic masking), not a new direction: the name Ceremonial Spatial Editorialism, the palette, the aperture device, and the no-fabrication/provenance rules are unchanged. `AGENTS.md`, `docs/CREATIVE_DIRECTION.md`, `docs/MOTION_SPEC.md`, and the `house-adel-motion`/`house-adel-art-direction` skills were updated in the same pass to distinguish decorative/spectacle effects (still banned: particle fields, rotating chrome, literal cursor trails, preset animation packs, decorative WebGL) from restrained, purpose-carrying versions of the same idea (now permitted: a cursor companion that supplements rather than hides the OS cursor, magnetic hover on primary actions, a content-bearing marquee with a static accessible-technology equivalent, and bounded parallax). `docs/VOICE.md` was added as the operational copy rulebook for the accompanying voice rewrite, kept separate from `docs/CREATIVE_DIRECTION.md`'s philosophical "Editorial character" section so page-level work has one concrete file to follow.

### Adopt GSAP SplitText; reaffirm the no-Lenis, no-ScrollSmoother position

GSAP's former Club GreenSock plugins, including `SplitText` and `ScrollSmoother`, became free with the installed `gsap@3.15.0` after Webflow's acquisition of GreenSock. `SplitText` is adopted for scroll- and route-transition text reveal (line/word masking) because it directly serves the motion grammar's existing "typographic masking" idea and requires no new dependency — it registers alongside the existing `ScrollTrigger` registration in `src/lib/motion.ts`.

`ScrollSmoother` was evaluated and not adopted. Its required `#smooth-wrapper > #smooth-content` structure would need to wrap the router outlet permanently; `src/components/layout/SiteLayout.tsx` re-keys its content root by `pathname` per route, and `src/components/motion/PageTransition.tsx` drives a fixed-position cover/reveal overlay against normal document scroll. Wrapping both in a transformed smooth-scroll container is a structural change disproportionate to a cosmetic smoothness gain, and conflicts with the standing "no Lenis, native scrolling required" position recorded above. Native scrolling plus `ScrollTrigger`-driven parallax/reveal remains the architecture.

### Replace the wedding-Edition product framing with the real MARVELL 20 project

A 2026-08-06 verbatim copy-and-structure brief superseded the "wedding invitation Editions / Private Commissions" product framing and its self-initiated "House Adel Study" placeholder system entirely. House Adel is now presented plainly as an independent web studio led by Marshall Phan, working across weddings, birthdays, dinners, launches and private events, with one real published project: MARVELL 20, a digital experience created for Marvell Florist's twentieth anniversary. Marvell Florist's general branding is explicitly excluded from ever being presented as House Adel work — only the MARVELL 20 project is shown. `docs/COPY_APPROVED.md` records the brief's copy verbatim as the new canonical source; `docs/VOICE.md` was rewritten to the brief's literal writing rules (no em dashes, no fashion-luxury vocabulary, no "commission"/"investment," no budget or price mentions anywhere on the site).

The public route set narrowed from Home/Work/Commissions to Home, Work, the MARVELL 20 project page (`/marvell-20`), Contact, Begin a Project, and Privacy. `EditionsPage`, `EditionPage`, `StoriesPage`, `StoryPage`, `TheHousePage`, `ApplyPage`, `PrivateCommissionsPage`, `CommissionsPage`, and `TermsPage` — along with `src/data/editions.ts`, `src/data/stories.ts`, and the `src/features/editions/`, `src/features/stories/`, `src/features/house/`, `src/features/commissions/` directories — were deleted outright; none were reachable from the router after the 2026-08-04 pivot recorded above, so this was dead-code removal, not a live-route change, except for `CommissionsPage` and the homepage's `CapabilityInstrument`, which were actively wired in and removed deliberately. Terms of Use is removed from the public site per the brief's explicit footer/structure exclusions; Privacy remains, rewritten to the brief's short exact text.

The earlier application/enquiry system was rewritten from a 20-plus-field wizard to the approved concise enquiry page. Its first delivery implementation used local server providers. That delivery decision is superseded by the 2026-08-15 Apps Script decision above. The `/enquiry-received` route keeps its `confirmed=1` anti-deception gate, so opening it directly never implies a successful submission.

The production loader's first-visit signature sequence was changed from a purely automatic entrance to one that ends in an explicit choice — `Enter with sound` / `Continue without sound` / `Skip` — per the brief's "Loading and sound entry" section; `AudioContext` gained an explicit `enable()` alongside the existing `toggle()` so the loader can turn sound on directly. All descriptive loader copy (a masthead subtitle and two rings of orbiting text) was removed, since the brief prohibits descriptive copy on the loader; the decorative seal ring became a plain stroke-draw circle instead of text-on-a-path, preserving the visual signature moment without carrying banned copy.

Bilingual EN/ID was deliberately kept (a project decision, not part of the brief, which is English-only) and the new copy was translated into Indonesian following the same plainness rules, per `docs/VOICE.md`.

### 2026-08-09 — Chapters, and Work as its own place

The site became one continuous document divided into chapters, each with a real path. `src/lib/chapters.ts` is the registry — one entry per chapter — and `src/lib/useChapters.ts` rewrites the address bar as a chapter takes the middle of the viewport, with the document title following.

`replaceState`, not `pushState`: scrolling should not fill the back button, so going back leaves the site rather than crawling up the page. It also does not fire `popstate`, which matters more than it sounds — waking the router would re-run its route effects, and one of those scrolls the document to the top, which would fight the scroll that got the reader there. For the same reason the active chapter is broadcast on its own event, `house-adel:chapter`, so the navigation can mark itself current without the router being involved at all. `/` and `/work` render the same document, and a direct visit to a chapter path lands in that chapter, so the URL the scroll writes is a URL that works when it is shared. Adding a chapter is a registry line plus a `data-chapter` attribute.

Work is a different place, not Home underwater. A first version submerged the relief itself and made the environment a single fixed stage spanning both chapters; that was the wrong reading and was replaced. The particles belong to Home and scroll away with it. Work has its own scene on its own canvas: `src/features/water/`.

The water is one fragment shader on one full-screen plane, doing three things. The fluid is domain-warped value noise, where one noise field displaces the sampling position of the next — a plain sum of octaves gives clouds, warping gives folds. The light is caustics: ridged noise, taking distance from a ridge rather than the noise value, which turns soft blobs into the thin bright filaments water actually throws. The rainbow is real dispersion rather than a painted gradient: red, green and blue are sampled from the caustic field at slightly different offsets, exactly as wavelengths separate when they refract, so colour appears only where the light bends hardest and nowhere else. Painting a rainbow in would have put colour where there is no reason for any. The ground stays black; nothing tints the water blue, and the colour lives only in the light.

The cursor's wake displaces the sampling position along the offset vector itself rather than along its normalised direction. Normalising is undefined at a mark's centre and swings wildly near it, which drew a hard starburst wherever the pointer came to rest.

There is no seam between the chapters. The water's field is absolutely positioned and begins a full screen above the chapter it belongs to, so by the time Work arrives the water has already been fading up through the viewport. Anchored at the chapter boundary instead, it drew a hard horizontal edge rising up the screen — the cut this was meant to avoid.

Two WebGL contexts now exist on the document. Each parks its frameloop when off screen, so only the one being looked at draws.

The score is muffled rather than swapped. It is routed through `createMediaElementSource` into a lowpass, a high shelf and a dry/wet convolver, with the cutoff swept exponentially because pitch is heard logarithmically — a linear sweep spends most of its travel in a range the ear barely registers. The reverb is a generated decaying-noise impulse rather than a shipped response file, since the ear reads it as "room" rather than as a specific room. Verified in a browser: playback ran 3.17s to 8.69s across the transition without pausing or restarting. One source, one playback position, filtered in place, and scrolling back opens the filter again. The score element is now attached to the document (hidden) rather than floating, so it can be inspected and asserted against.

Particle contrast was the "it looks like noise" problem: every particle arrived at roughly the same brightness, so nothing described a form. Height now drives a crushed curve across colour, alpha and point size together, so low relief sits near the ground colour and nearly transparent while raised surface comes up bright.

### 2026-08-08 — Serif display, brushable type, one page

Display type returned to Newsreader. The grotesk was tried for a day and read as generic; the serif carries the register the studio actually wants. Body copy is serif too, with the grotesk kept only for tracked uppercase micro-labels, where a serif at 0.6rem and 0.2em tracking loses its letterforms. The Newsreader files deleted the previous day were restored from git history.

The scroll-section dissolve built the previous day was removed. The tear is now reserved for route changes and the mark, which is what makes it read as a change of place; running it on every section boundary spent the effect on ordinary scrolling. `src/lib/dissolveMask.ts` stays, since `PageDissolve` still uses it.

The home page opening is no longer pinned. It scrolls away like every other screen, with the relief held back to 28 per cent of the scroll rate, so the slowness comes from parallax rather than from taking the scroll away from the reader.

Work is no longer a route. The index is a section of the home page at `/#work`, because this is one page with one narrative and a second URL for the same content split it in two. `/work` is kept as a replace-state redirect so existing links do not break, and `WorkPage` was deleted.

Type is brushable. `InkText` splits into characters grouped inside non-breaking word spans, and each character carries its own CSS blur driven by its distance to the pointer: fast under the hand, slow behind it. The scroll reveal continues to run on the whole element through the SVG ink filter, and the two compose. The reveal window narrowed to `top 80%` / `top 54%` on the way in and `bottom 46%` / `bottom 16%` on the way out, so a line resolves as it is about to be read and dissolves once it is done, rather than arriving early and lingering.

Splitting into characters destroys the accessible name: engines join the spans, so a heading is announced letter by letter. The sentence is therefore rendered once more in a visually hidden span and the split copy carries `aria-hidden`. The unit suite caught this, not inspection.

The relief brushes itself when left alone. After 2.4 seconds without pointer movement a brush fades up over 1.8 seconds and wanders the frieze on two incommensurable frequencies per axis, so the path never repeats a stroke exactly. Idle strength sits below hover strength, and the pointer takes the brush back the moment it moves.

A second project, Enrico and Virly, was added as a wedding invitation. It is a placeholder built by House Adel, not commissioned work, so `Project` gained a `status` field and the index prints "Placeholder" against it. The invitation page states in plain text, above everything else, that its names, dates and places are invented. Nothing on this site may imply a client relationship that does not exist.

The relief model was replaced with a new scan under the same filename, and `scripts/bake-relief-depth.mjs` now exists so re-baking is a command rather than a memory. It detects the carved axis instead of assuming Z, since the new export is carved along Y; it crops to where the surface sampled densely, which removes the loose fragments the export carries around the slab; and it detects depth polarity from the histogram mode, because the new model's depth axis points away from the viewer and left uncorrected the figures render as holes. The aspect changed from 2.46 to 1.27. The home page now loads the 1024 map rather than the 2048: the particle cloud samples around 190,000 points, far fewer than that image holds, and the loader was already waiting on that exact file, so it is one download instead of two.

### 2026-08-07 — Active Theory structure, spectral navigation, one statement per screen

The site was pulled closer to Active Theory's shape than Immersive Garden's. The public surface is now Work and Contact only, and no individual is named anywhere: the homepage's "independent web studio led by …" line and the founder's name were removed from the page, from `AGENTS.md`, and from `docs/CREATIVE_DIRECTION.md`. `docs/COPY_APPROVED.md` still records the original brief verbatim, including the founder line, as the historical source; where the two disagree, this entry governs.

Display type moved from Newsreader to Manrope. The editorial serif carried a heritage-print register that no longer matched a dark, particle-lit page, and one grotesk across display and interface removes a whole typeface from the critical path. Both Newsreader WOFF2 files, their licence notice, and their provenance rows were deleted; they are recoverable from git history if a serif is ever wanted back.

Every statement now owns a screen. The homepage opening is a sticky relief over 230svh of travel whose dispersal is scrubbed by scroll position, and each following statement sits in a 118svh section, so no two paragraphs share a viewport. `WorkPage` follows the same rhythm: one project per screen, its frame drifting against the scroll under a title that stays still.

Navigation hover became a spectral particle glow (`SpectralText`) instead of an underline. Particles are drawn on a small per-item 2D canvas using `src/lib/spectrum.ts`, a TypeScript port of the exact cosine palette the relief's point shader uses, so the nav and the relief share one colour family by construction rather than by matched hexes. The type carries no transform, tracking or weight transition — only brightness — because moving words under a cursor was explicitly rejected. The loop runs only while particles are alive, and the header's `mix-blend-mode: difference` was dropped, since difference blending would have inverted the glow it now sits behind.

Text dissolve is handled by `InkText` in both directions, replacing `FadeIn`, `InkResolve` and `InkResolveFilter`: a line resolves out of blur as it arrives and dissolves back into it as it leaves, scrubbed to scroll rather than fired once.

The literal noise-torn dissolve now also runs between scroll sections, not only between routes. It was initially left out on cost grounds and then explicitly asked for again, so it was built: the mask moved into `src/lib/dissolveMask.ts` and is shared, so a route change and a section change tear the page from the same noise field. `SectionDissolve` scrubs it against the seam between consecutive `[data-dissolve-section]` elements as that seam crosses the middle of the viewport. It reuses the one 2D canvas rather than adding WebGL, redraws only on quantised change, and is finer and less downward-biased than the route variant, which plays in half a second where this one is held under the reader's hand.

The peak coverage is 0.55, measured rather than chosen: the noise field clusters around its midpoint, so threshold and covered area are far from linear. 0.74 covered 92 per cent of the screen. Because a scrubbed effect holds wherever the reader stops, full coverage would mean a reader could park on a blank screen, so the tear deliberately never closes over the page.

The cursor halo's follow was re-damped against elapsed time instead of a fixed fraction per frame. The old form followed at different speeds on 60Hz and 120Hz displays and jerked to catch up after a dropped frame, which is what read as unsmooth.

The production loader was brought onto the current system: dark ground, the mark alone, no wordmark, and plain type for the sound choice and skip controls in place of bordered buttons. It had been left on the ivory, framed, garnet-accented treatment from before the palette change, and since `--color-garnet` no longer exists the ring and rule were resolving to invalid values and drawing wrong. A related fix: `button` now resets its background in `global.css` rather than relying on every button also carrying `.action`, which had left the language toggle painting the user agent's grey box in the header.

### 2026-08-13 — Reframe `/invitation` as a photographic editorial sequence

The invitation's procedural tonal studies, faux film-frame marks, ornamental circles, and painted CSS backgrounds were removed after they made the experience feel decorated rather than authored. `/invitation` now uses real responsive photography as its primary material. Wedding-specific image paths, source sets, focal positions, honest alternative text, and final commission requirements are centralized in `src/data/invitation.ts`.

Behavioural research covered Awwwards' Marie's Wedding gallery, OBSESD Wedding Photography, Lago's immersive gallery, and current editorial wedding-photography site roundups. The shared lesson was not a specific layout to copy. It was to let one strong image own a scene, keep interface chrome quiet, use type as a compositional counterweight, and make transitions change the spatial reading of the same material. No reference assets, code, marks, or distinctive compositions were copied.

Five manually selected Unsplash images create the demonstration arc: touch, chapel atmosphere, landscape, table, and dusk. The subjects are not identified as Amara and Daniel, and the chapel image is not claimed as documentary photography of Chapel of Saint Anne. The site continues to require couple-owned replacements for a commissioned version. No generative image system or new runtime dependency was added.

### 2026-08-13 — Reconstruct `/invitation` as a living invitation suite

The second reconstruction treats the route as a physical invitation coming alive. Its chapter order is Touch, Place, Anticipation, Before This Day, The Day, Before You Come, Your Reply, and Until Then. Navigation, progress, entry, RSVP and closing belong only to this microsite. The House Adel return is a small utility at the end rather than inherited portfolio chrome.

Reference research was behavioural. Veley and Ross demonstrated how whitespace, a long scroll and quiet navigation can carry a wedding story. Zane and Zoe demonstrated the value of personal narrative and direct guest utility. Willardson demonstrated restrained one-page parallax. Bliss & Bone and Vogue's stationery guidance reinforced that richness comes from paper layers, tactile relief and coherent suite hierarchy. Riley & Grey reinforced mobile RSVP clarity. Active Theory reinforced that scene changes must serve a narrative state. No reference asset, layout, copy, mark or distinctive composition was reproduced.

Three local type systems were tested against `AMARA & DANIEL`, `CHAPEL OF SAINT ANNE`, `BEFORE THIS DAY`, `THE DAY, IN ORDER`, and the RSVP questions. Newsreader with Manrope was selected because its low-contrast warmth remains readable in long practical copy and its italic is expressive without turning every heading into a fashion gesture. EB Garamond with Manrope felt too historical for the architectural photography. Cormorant with Manrope felt too high-contrast and ceremonial at the required mobile sizes. No font package or runtime dependency was added.

The three short relationship memories are explicitly fictional demonstration copy and are centralized in `src/data/invitation.ts`. They are not represented as sourced biography. Photography remains licensed atmosphere and does not identify the people pictured as Amara or Daniel or the chapel as the named venue. The RSVP remains an honest local demonstration: it shows a completion state while stating that no response was transmitted or stored.

### 2026-08-14 - Compact inverse interaction and pale closing field

The background paint gesture was reduced from a broad coloured smear to a small, fast-drying inversion. Colour is confined to a narrow spectral edge and the trail is deposited only while the pointer is moving. Project-media hover uses the same order: an inverse core appears first, three small colour taps touch its edge, and both disappear within a fraction of a second.

The global footer is now a pale paper field with ink typography. It replaces the duplicate Home contact chapter and holds the surface-sampled `work.stl` derivative as a fixed particle sculpture. The model no longer rotates or bobs. Its hover response is a single travelling spectral ripple, and the canvas renders on demand. Contact and the invitation RSVP use the same pale-field, dark-type relationship.

Pointer hits on particle sculptures now come from a ray intersecting a screen-parallel plane through the object. The previous camera-distance projection was only exact near the centre of the screen and displaced the halo off the cursor toward the viewport edges.

On compact Work layouts, planting is intentionally reduced to two canopies and one floor fern. The left canopy is moved inward so at least half of its crown remains inside the visible frame.

### 2026-08-15 - Use Times New Roman for the House Adel serif system

The global display/body serif token now begins with `Times New Roman`, with `Times` and the generic serif family as platform fallbacks. The former Newsreader font faces were removed from the global stylesheet so they are no longer requested by House Adel pages. The invitation retains its isolated commissioned typography because it deliberately does not inherit the parent studio visual system.

### 2026-08-17 — Publish the Terms, reversing the brief's exclusion

The 2026-08-06 brief excluded Terms of Use from the public site, and the earlier `TermsPage` was deleted with the rest of the catalogue architecture. That exclusion is reversed here at the studio's instruction: the studio has written a full set of Terms and supplied them for publication, so the reason for the exclusion — that there was no approved Terms copy and the brief's footer did not carry one — no longer holds.

`/terms` renders that document at 29 numbered clauses in English and Indonesian, and is linked from the footer and the mobile menu beside Privacy. The wording is the studio's own and is reproduced verbatim rather than rewritten into house voice; `docs/VOICE.md` governs editorial copy, and applying it to a clause about refunds or liability would change what the clause means. The two placeholders in the supplied text are filled from the code: the date from this publication, the address from `studioContacts.email`.

Privacy and Terms now share `src/pages/LegalDocument.module.css`. They are the same object — a numbered document read for a specific clause — and two stylesheets would mean one drifting out of step with the other.

The Terms are general website terms and say so: clause 02 states that an inquiry creates no client relationship, and the preamble states that a project-specific quotation or agreement governs where it conflicts. The enquiry form was deliberately not changed to require acceptance of them; it acknowledges the Privacy Policy only, which remains the correct scope for a form that collects personal information and nothing else.

Final legal review of the Terms copy remains open, as recorded under deferred decisions.

## Dependency decisions

No dependency is installed until its purpose, limitation, and alternative are recorded here. Versions will be resolved once with npm and locked in `package-lock.json`.

| Dependency | Status | Purpose | Why existing code is insufficient | Bundle/performance implication | Alternatives considered |
| --- | --- | --- | --- | --- | --- |
| `react-hook-form` | Installed runtime dependency | Accessible form state, field registration, dirty/completion state, review editing, and efficient updates for the Living Brief | The repository had no production form-state layer; a hand-built controlled form for the required field set would duplicate registration, error, and touched-state logic | Route-loaded with the form on `/commissions`; avoids rerendering the whole form for every keystroke | A custom reducer or controlled inputs would avoid a package but increase implementation and regression risk |
| `zod` | Installed shared dependency | One application schema for client validation, server validation, limits, normalisation, and provider contracts | TypeScript types disappear at runtime and cannot validate untrusted submissions | Route-loaded with the form on `/commissions` and reused by the server adapter; no homepage or WebGL cost | Hand-written validators duplicate client/server rules; another schema library would add the same category of dependency without an existing project advantage |
| `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals` | Installed development-only toolchain | Lint TypeScript, React hooks, browser globals, server code, scripts, and Vite boundaries | `tsc --noEmit` catches type errors but not hook dependency errors, unsafe patterns, or maintainability rules | Zero production-bundle cost; adds install size and CI time only | Type checking alone does not meet the acceptance gate; a custom regex/script lint would be weaker and harder to maintain. `eslint-plugin-react` is unnecessary with the modern JSX runtime and TypeScript |
| `prettier` | Deferred; not currently justified | Automated formatting only | Existing formatting is consistent enough for the architecture phase and ESLint addresses correctness | Would have zero runtime cost but add another development dependency and command | Use editor formatting and focused ESLint rules; revisit only if formatting drift becomes measurable |
| `gsap/SplitText` | Newly used; already installed with `gsap@3.15.0`, no package added | Line/word text-mask reveals for scroll entrance and route-transition typography | The hand-rolled reveal patterns cannot split text into independently animatable lines/words without reimplementing what the plugin already does correctly for line-wrap and resize | Route-local, imported only where a split reveal is used; reverted via `gsap.context().revert()` on cleanup so no persistent DOM restructuring remains | A manual `<span>`-per-word markup approach was considered and rejected: it pollutes source markup and breaks on resize/reflow without reimplementing SplitText's own recalculation |
| `gsap/ScrollSmoother` | Evaluated, not adopted | N/A | See "Adopt GSAP SplitText; reaffirm the no-Lenis, no-ScrollSmoother position" above | N/A | Native scrolling plus `ScrollTrigger` scrub, consistent with the standing no-Lenis decision below |
| `libphonenumber-js@1.13.11` | Approved runtime dependency | Parse and validate WhatsApp numbers against current international numbering metadata, expose country calling codes, and normalize accepted numbers to E.164 before mapping them into the existing backend `Contact` field | A handwritten regex can enforce a digit count but cannot distinguish valid national numbering plans, prefixes, or shared calling codes; maintaining a country-code table locally would also go stale | Loaded only with the route-split Contact form. The `max` metadata build is used because this interaction explicitly requires stronger numbering-plan validation; it does not affect Home or Work entry bundles | An E.164-only regex was rejected as too permissive. Google's Closure-based JavaScript build is substantially larger and less natural in the existing Vite/TypeScript stack. Server-side verification or OTP would require a new service and is outside this inquiry flow |
| `trimesh` + `fast-simplification` | Offline conversion tool only; not added to `package.json` | Reduce the project-owned 174 MB `love.stl` into a browser-safe solid GLB for the homepage | The existing baked `.bin` contains point samples only and cannot render a continuous surface; shipping the source STL would violate the route asset budget | Zero runtime library cost; only the reduced GLB ships | The depth-map mesh looked visibly faceted, while retaining the baked cloud would preserve the particle effect the user asked to remove |

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
- Whether human-approved project-owned or open-access photography, scans, or archival material should supplement the deliberately image-free version-one system.
- Field Core Web Vitals and physical integrated-GPU/mobile validation after a production host is selected.
- Final legal review of the Privacy and Terms copy.
- Verification that `hello@houseadel.com` delivers into the studio's underlying inbox and is monitored before public launch. The public address is the only one the site renders; the inbox behind it is infrastructure.

### 2026-08-15 — Move the liquid response to the final composite

The paint memory above was a plane inside each React Three Fiber scene, sitting at `z = -0.86` behind everything the scene drew and, necessarily, behind every piece of DOM on top of that scene. Four failures followed from that one placement, and none of them was a tuning problem.

Nothing was affected but the backdrop. Type, photographs, the relief and the planting all painted over the effect, so the only thing it could disturb was empty air. The trail did not sit under the pointer: the plane's own UV space is not the viewport — a 12-unit quad under a 40° perspective camera, inside a `position: sticky` element that is only viewport-aligned for part of its chapter — so a pointer normalised against the window landed somewhere else on the plane, scaled and offset. Individual splats were visible because each pointer sample stamped a Gaussian dot rather than covering the path between samples. And the colour was a radial spectrum keyed to velocity angle, painted into the middle of the mark, which is a rainbow by construction rather than a fringe produced by anything optical.

The replacement is one fixed layer above the whole site. A GPU fluid field — capsule splats along the pointer's actual path, self-advecting velocity, vorticity, separate dissipation for velocity and dye — produces a mask, and that mask is composited over the finished page with `mix-blend-mode: difference`. White inverts what is beneath, black leaves it exactly as it was, and "what is beneath" means the real final composite: DOM type, images, both particle stages, the header, the sound companion and the page ground alike. The three channels sample that mask a pixel or two apart along the boundary normal, so the interior is a neutral inversion and the spectrum exists only in the width of the edge. Dye merges by `max` rather than by sum, so overlapping passes become one body at one density instead of stacked colour.

Because a canvas cannot displace the pixels beneath it, a second layer carries the bend: a small box tracking the pointer with `backdrop-filter: url(...)` running an SVG displacement over what the browser has already composited. That genuinely warps DOM glyphs and canvas pixels rather than blurring them. It is kept smaller than the fluid's own splat so the bend is only ever where the liquid is, and it is progressive — where SVG filters in `backdrop-filter` are unsupported the inversion and the fringe remain and only the warp is absent.

Three earlier answers to the same gesture were removed rather than layered with this one: the background paint plane, the `ChromaticBrush` spectral smear over project entries, and `InkText`'s per-character pointer blur. The last of these is the one worth naming — it defocused the words under the hand, and text that goes soft is the opposite of text that refracts.

### 2026-08-15 — Five corrections to the liquid lens, the wood and the footer

**The fringe is spectral because the dispersion changes sign, not because a hue was picked.** Three samples across a boundary that only rises one way can only ramp one way, so a fixed channel order gives the entire outline a single hue — first amber, then, with the order reversed, blue. What varies around a real body of liquid is the surface, not the channel order: the leading edge is compressed by the flow and the trailing edge rarefied, and those refract oppositely. Taking the sign of the dispersion from the flow's angle of incidence on the boundary gives warm, magenta and cool around one perimeter, all of it still produced by displaced sample points.

**Modelled forms keep their shading.** A flat inversion is right over type and over ground; over a sculpture it replaces the lighting with the negative of the lighting, which reads as a sticker cut to the silhouette and undoes the volume the particles exist to describe. Stages that own a subject now publish its screen-space ellipse and the lens eases the inversion off inside it while leaving the boundary fringe intact and increasing the backdrop displacement — glass in front of a solid rather than paint over it. Regions are published as readers rather than values because every one of them sits in a sticky element whose box moves for the length of a chapter.

**Scrolling is silent.** The reveal cue on every line that arrived and the cue on every route change made moving through the document a sequence of chimes. Both are gone, along with the score's submerge on the Home-to-Work crossing. Sound now answers what the visitor does — pressing something — and nothing else.

**The wood is one object.** Each cloud used to raycast the pointer onto its own plane and test the hit against its own bounding sphere, so a fern a hand's width from the cursor stayed still while the one under it moved, and each began its ripple at a different moment. There is now one disturbance per scene — position, strength, wavefront age — measured after projection, so distance to the hand means the same thing on the near fern and the far canopy. Every particle takes a share of it at the same instant and the falloff decides only how much more the near ones take, which is what makes the whole wood lift together instead of one model at a time.

**The footer is built out of the signature.** Buttermax has no scrolling footer to copy — their pages are fixed-viewport — so what was taken is the end-of-page grammar from `/contact`: a running notice in a pill, the name at a size no viewport can hold bleeding off both edges, the object cutting through those letters rather than standing beside them, a pill action, and a hard tonal flip to a near-black bar at the very bottom. The palette is not taken; this is that structure in House Adel's paper and ink. Two things the grammar forced out: the grid columns have to be `minmax(0, 1fr)` or the `nowrap` wordmark sizes the whole layout to its own intrinsic width, and the paper panel has to announce itself on the root element so the header, the scroll rail and the cursor companion — all set in paper on a near-black site — take ink while it is under them.

### 2026-08-15 — One spectrum, stacked; and the wipe stops being pixels

**The fringe is a stack of displaced silhouettes, not a hue.** Reading three channels a pixel or two apart across the boundary produces a ramp, and a ramp averages into one colour however the stops are ordered — it gave amber, then blue, then a two-tone edge, but never the layered separation a dispersing surface actually shows. The trail's outline is now read four times at increasing offsets along the boundary normal, and the ring between each copy and the one inside it takes the next stop of the spectrum. Two details make it read as a stack rather than a blur: the silhouette for the bands is thresholded much harder than the body, so each copy has an edge of its own, and the pitch has to be around four pixels — below that consecutive copies overlap inside the width of their own antialiasing and average straight back into a single line.

**Over a sculpture the lens stands down completely.** Easing the inversion partway still left a grey wash over a lit form and still competed with the dispersal the particles were already doing. Inside a published subject the whole composite now goes to nothing — fringe, inversion and backdrop displacement alike — and the object's own response carries the gesture instead. That response was strengthened to suit: a wider brush, particles pushed out along their own surface normal rather than only loosened along it, and a firmer parting in the clouds.

**There is one spectrum.** `spectrum.ts` holds four stops as a GLSL chunk and as CSS-ready hexes, and the lens's fringe, the relief's dispersal, the pearl clouds' lift and the routed wipe's leading edge all read from it. The alternative — each surface carrying its own cosine palette, as they did — meant a hand crossing from the type onto the sculpture crossed between two different-looking effects.

**The routed transition is traced, not stamped.** It was seventy-odd columns of inverse cells drawn into a canvas held at `image-rendering: pixelated`, which read as broadcast static and was the one place the site showed a pixel grid. It is now a single wavefront — three sines, so it undulates without repeating — swept across and inverting what it passes through `difference`, with the same four-stop stack drawn ahead of it as displaced copies of the same front. The canvas is sized to device pixels, because a path-traced edge resampled up from CSS pixels is a soft edge, which is the other way to make a wipe look cheap.

One thing left alone and worth naming: during the reveal leg the incoming route's Suspense fallback is briefly visible through the wipe. It was equally visible through the gaps between the old cells; the wipe is not what makes it show.

### 2026-08-15 — The opening opens, the finger points, and the ending gets quiet

Six changes, and three of them supersede copy this repository had previously fixed. Those three are named first, because a fixed-copy block being overridden is the kind of thing that should never be discovered by reading a diff.

**`docs/COPY_APPROVED.md` is superseded in three places, on request.** The loader's "Enter with sound / Continue without sound / Skip" block is gone with the gate it belonged to. The global footer block gains the closing invitation — which is not new copy: it is the "Contact ending" block from the Home page section of the same document, moved to where the ending actually is. And the Privacy page's two sentences are replaced by a full policy. Everything else in that document stands, including every button label, and the two sentences the old Privacy page carried survive inside the new one.

**There is no door.** A visitor arrived at a choice — enter with sound, continue without, or skip — before they had seen anything to have an opinion about. The opening now resolves itself: assets settle, the mark and its ring draw, the overlay fades and recedes, and the site is interactive in about a second and a half. Autoplay rules are not bent to do it. Audio still requires a real gesture, and it is now offered where a gesture is already happening: the cursor companion carries it on a desktop, and the mobile menu carries it on a phone, which is the first time a phone has had any way to turn sound on at all.

**A finger is a pointer.** Every interactive layer — the wireframe backdrop, the forest ripple, the relief's brush, its pointer uniform — kept its own `pointermove` listener behind its own `pointer: fine` check, so on a phone none of them ran. There is now one pointer signal in `src/lib/pointerSignal.ts` that a mouse and a finger both feed, and the layers downstream cannot tell which. Nothing calls `preventDefault`, every touch listener is passive, and no gesture layer sits over the page: a swipe scrolls exactly as it always did and is read on the way past. Two parts of that are worth naming. *Presence* — a mouse is always somewhere, a finger exists only while it is down, so lifting one fades the reaction over about half a second instead of deleting it. And DOM hit-testing is rationed twice, by distance moved and by interval, so `elementFromPoint` runs a handful of times across a flick rather than once per `touchmove`; what it finds is marked `[data-touch-hover]`, and every rule that answers `:hover` answers that in the same selector.

**Mobile scrolling was already native and now cannot accidentally stop being.** The desktop authority attaches to the wheel only, so there is no touch interpolation to disable. On desktop it was retuned against what Buttermax actually does — Lenis at its default lerp, which is a time constant near a sixth of a second, at full wheel gain. Two of the three numbers here were working against the feel being asked for: the damping settled in about fifty milliseconds, which is fast enough to have no curve at all, and the lead was capped at 210px, which throws away a flick's surplus — and that surplus *is* the coast. Deceleration is spending it. Both are fixed; the cap is now over a screen, which bounds the absurd without braking the glide. Velocity is published once, in `src/lib/scrollSignal.ts`, and the 3D and media layers lean on it while the typography does not: the atmosphere trails, the words do not.

**The transition stopped being one wipe applied to everything.** A bright edge crossing the screen belonged to no particular pair of pages. There are three related moves now, all made of depth and the atmosphere the site already sits in: *recede* for the general case, *carry* into a project — where the image the reader pressed is lifted out of the index and flown to its landing rectangle on the project page — and *return*, which is the same move with its depth inverted, so Back undoes the movement that got you there. All three arrive through the router's interceptors rather than a link's click handler, so the navbar, the cards, the CTAs, programmatic navigation and the browser's own Back and Forward all reach the same code. History direction comes from a monotonic index stamped into `history.state`, because `popstate` does not say which way it went.

**The ending exhales instead of announcing itself.** The footer was a second hero: a ticker in a pill, the name at nineteen viewport widths bleeding off both edges, a particle sculpture cutting through it, an action, a navigation, a social row and a copyright bar, arriving against the dark site along a hard tonal edge. It is one invitation now, in the studio's own approved words, with everything else set as the administrative matter it is — and on the contact routes even the invitation is dropped, because asking someone to get in touch while they are filling in the contact form is the footer talking over the page. The tonal change is a ramp over more than a screen of travel rather than a flip, so there is no line anywhere at which one ground becomes the other. Immersive Garden was reviewed as behavioural reference only: what was taken is the principle that an ending should get quieter as it resolves, not any part of its appearance.

**Two smaller ones.** Active Theory was consulted for exactly one thing and one thing was taken: a dark viewport should have tonal structure rather than being a flat black rectangle. `ViewportAtmosphere` is two off-axis vignette ellipses, a trace of cool grey at the extreme edges under `screen` blending, and a little fixed noise to keep very shallow gradients from banding — no colour, no glow, no implied light source, and it should only be obvious next to a before. And the mobile forest is now its own arrangement rather than the desktop one with plants removed: a single legible tree standing on the ground left of centre, a much dimmer one far behind it for separation, and undergrowth scattered across four depths with a deliberate gap in the middle distance, because what was there read as a row of landscaping.

### 2026-08-17 — A third chapter, and the invitation leaves the work index

**The name is Studies.** It was chosen over Experiments, Sketches and Labs. "Lab" is the reference's word and reads as a technology department; "experiments" says the same thing in a register this studio does not use; "sketches" understates a finished wedding invitation. A study is the art-historical word for a piece made to work something out before it is needed, which is exactly what the page holds, and it survives translation without becoming fashion vocabulary. Indonesian takes "Studi". Changing it means editing one line in `src/lib/chapters.ts` and one in `src/data/navigation.ts`.

**It is a page, not a chapter.** It was built first as a third chapter of the continuous document, below Work, and that was wrong for a reason worth recording: an index is read by scanning, and the document is one long movement — relief releasing into forest, the reader descending — so ending it in a list made the movement stop rather than arrive. Held as a chapter the index also had to be paced like one, which meant a viewport and a half of air around four entries a reader wanted to compare side by side. It is now a route of its own, entered the way Contact is entered, with its own dissolve, its own top edge and no chapter machinery at all. The same content is a third shorter on the page than it was in the document, and nothing was cut.

Two changes from the chapter attempt were kept because they were right independently. `HomePage` no longer tests for `/work` by name when deciding where a direct visit lands; it asks the chapter table, so any chapter can be deep-linked. And the header's current-entry test reads the chapter rather than the path whenever the reader is inside the document, because scrolling rewrites the address without waking the router — the path in that prop is only where the reader came in. The arrival observer that fades entries in as they reach the middle of the screen also came out of `HomePage` into `hooks/useArrivals`, because the work index and the studies index are now two trees wanting one decision about when something has arrived.

**The wedding invitation moved out of `data/work.ts`.** It was the one entry there carrying `status: "placeholder"`, a label no component rendered, in an index whose entire job is to be truthful about client relationships. It is a piece the studio built for itself, so it now lives in `data/studies.ts` and Work is delivered work only — which is what `docs/VOICE.md` already required of that index. The `placeholder` status stays in the `Project` type because the situation it describes can recur.

**`docs/COPY_APPROVED.md` is superseded in one place, on request.** That document fixes the main navigation as Work, Contact and Sound. It is now Work, Studies, Contact and the language control, and the footer's administrative row gains Studies with it. Nothing else in that document is touched; every button label still comes from it, and the invitation's own sentence is reused verbatim rather than rewritten for its new home.

**The reference was read for structure and gave three things.** `atlab.io` renders nothing without a browser, so it was driven under automation and read: it is a framing block of bracketed notes over a dense tagged index of forty-odd entries, each one a title, a single terse line and a thumbnail, with no years and no clients. What was taken is the framing — a stated reason the page exists, an explicit statement of what these pieces are *not*, and a short list of what the studio is working out at the moment — because a studies index without those leaves a reader guessing whether they are looking at work. What was not taken is anything visible: their register is bracketed capitals and a filterable grid, and this is a ruled sheet in the studio's own quiet type. The filter is deliberately absent until there are enough entries for filtering to do something. `activetheory.net/labs` no longer exists as a labs page — it resolves to their work index — so the current site was read only to confirm that.

**The page has no scene of its own.** Home holds a relief and Contact holds Cupid; a third live context would have been decoration, and the graphics budget is already spent. Studies is set on a faint ruled sheet drawn in CSS, held for the length of the page and feathered at its foot so it clears before the ending's ramp rises. The composition is asymmetric and left-set against the centred, ceremonial front of the site, so a reader knows they have moved to the back of the house before reading a word. It takes Contact's frame — the same top edge and gutter — so the two standalone pages sit under the header identically. There is no STUDIES eyebrow above the heading, for the reason Contact has none: the navigation says where the reader is, the tab says it, and the heading says it in words.

**The opening is offered again rather than described.** The loader records that it has run, which is what makes a second arrival quiet, and also the only thing preventing a visitor from seeing it twice. That record moved out of the loader component into `src/labs/loader/visitRecord.ts` so the studies index can clear it and load a fresh document. `/labs-loader` is a review harness with replay controls and is not linked from here.
