# Awards, showcases, and authored case-study audit

Status: discovery-source audit for Phase 1; not a ranking of creative quality.  
Access date: 2026-07-30.  
Evidence note: award metadata is secondary evidence. Creator-authored cases, official repositories, and live browser inspection take precedence for implementation claims.

## Why these sources are separated

A gallery answers “what did an industry jury notice?” It rarely answers:

- what the client bought;
- what the studio actually delivered;
- how many people produced it;
- whether direct routes and browser history work;
- what happens under reduced motion, touch, slow network, or WebGL failure;
- whether the published technology label was independently verified;
- whether the system remained maintainable after launch.

House Adel can use awards to discover candidates. It should not use awards as architecture or business evidence without a second source.

## Awwwards annual winners

The official [2025 winners list](https://www.awwwards.com/annual-awards/winners) identifies:

| Category | Winner | Relevance to this research |
| --- | --- | --- |
| Site of the Year | Lando Norris | A high-energy personality platform by OFF+BRAND; the [award entry](https://www.awwwards.com/sites/lando-norris) labels 3D, interaction, WebGL, GSAP, and Webflow |
| Developer Site of the Year | Messenger | A [character-navigation](https://www.awwwards.com/sites/messenger) world labeled with NPCs, WebGL, WebSockets, and Three.js |
| Ecommerce of the Year | Scout Motors | Also listed by the official [Locomotive Scroll showcase](https://scroll.locomotive.ca/) |
| Agency of the Year | Immersive Garden | Already evaluated as a future-scale luxury/cultural production reference |
| Studio of the Year | Malvah | The [winner page](https://www.awwwards.com/annual-awards-2025/studio-of-the-year) describes a studio making distinctive brand experiences |
| Independent of the Year | Louis Paquet | A useful discovery lead for independent creative development, but not promoted to the matrix without the same business and resilience evidence as the core references |

The Lando Norris and Messenger entries show why award prominence cannot equal House Adel relevance. Lando Norris has a specific racing subject that can earn velocity, 3D, and high-energy interaction. Messenger is openly game-like. Those signifiers are coherent for their subjects and would become clichés if moved into House Adel’s studio shell.

Awwwards publishes separate juror score groups for design, usability, creativity, and content, and a developer score covering semantics/SEO, animation, accessibility, performance optimization, responsive design, and markup on the [Lando Norris entry](https://www.awwwards.com/sites/lando-norris). These scores are useful signals, not accessibility or performance audits.

## FWA

The current [FWA public site](https://thefwa.com/) presents a legacy/archive launchpad. The official organization’s [2025 People’s Choice finalist announcement](https://www.linkedin.com/posts/the-fwa_the-fwa-peoples-choice-award-pca-2025-activity-7413915935612284928-VCwf) included work associated with Resn, Bruno Simon, and other creative developers and studios; the post is a finalist list, not the final award result.

Locomotive’s [Destigmatize case](https://locomotive.ca/en/work/destigmatize) records both an FWA of the Day and Awwwards Site of the Day. More importantly, it explains that the work was a multi-channel HIV-awareness campaign with a manifesto film, social content, and an interactive microsite organized into educational modules. It credits creative direction, art direction, UX, UI, motion, technical direction, frontend, backend, account direction, and project management.

The reusable lesson is that the production record behind an award is more useful than the award itself. House Adel should record the occasion, audience, roles, modules, and collaborator structure even when no award exists.

## Locomotive Scroll showcase

The official [Locomotive Scroll v5 landing page](https://scroll.locomotive.ca/) names twelve real projects:

- Locomotive;
- Destigmatize;
- Scout Motors;
- Lightship;
- Vooban;
- Construction Desourdy;
- GKC;
- Troa;
- Vazzi;
- 21TSI;
- Eduard Bodak;
- Mindmarket.

The same page documents a 9.4 kB gzipped library built on Lenis, a native scrollbar, keyboard navigation, SPA cleanup, Intersection Observer-based detection, and automatic mobile parallax disabling. This is stronger evidence than third-party “built with” guesses.

The showcase spans product, campaign, studio, construction, and personal-portfolio contexts. It therefore does not support one visual formula. Its relevant pattern is that scroll machinery can be a thin implementation layer beneath many concepts. House Adel should evaluate each experience separately and keep native scroll when smoothing contributes no narrative value.

The [Lightship case](https://locomotive.ca/en/work/lightship-1) is particularly useful because the mandate was to evolve a scroll-heavy experience into a clearer, scalable product platform. Its approach combines progressive disclosure, navigable layers, 3D/interactive explanation, and a design system prepared for expansion. This is evidence that “more scroll choreography” is not automatically the mature direction.

## Codrops author-written case studies

Codrops is an editorial platform, but the selected cases below are written by the creators and expose methods, tradeoffs, and time—details generally absent from award pages.

### Stefan Vitasović portfolio, 2025

[Stefan Vitasović’s case](https://tympanus.net/codrops/2025/03/05/case-study-stefan-vitasovic-portfolio-2025/) documents:

- Next.js pages router, dynamic imports, code splitting, SSR, and static generation;
- Motion for route animation;
- Three.js and React Three Fiber for the WebGL layer;
- Cloudflare R2/CDN-hosted video;
- custom scroll control combining Lethargy and Virtual Scroll;
- video textures, a fragment-shader overlay, displacement transitions, and shared plane geometry;
- a mobile version that removes WebGL and uses native HTML5 video while retaining the interaction and motion principles.

This is a useful persistent-WebGL case because it names the removal strategy. The mobile reinterpretation protects the content relationship rather than forcing the desktop renderer onto the phone.

House Adel lesson: if a persistent desktop canvas is approved, the mobile system must be designed as a related edition from the start. The specific custom scroll controller is not a default recommendation; it increases interruption, accessibility, and maintenance responsibilities.

### Troa 25 Folio

[Troa’s case](https://tympanus.net/codrops/2025/03/28/case-study-troa-25-folio/) says its previous 2021 portfolio no longer fit the studio identity and frames the new work around authenticity, performance, sustainability, and a clean design. Photography of the agency and recent productions became part of the source material.

The durable lesson is renewal through honest content and operating values. A portfolio does not need to become more spatial with each revision. Performance and environmental restraint can themselves be creative constraints.

### Aurel’s Grand Theater

[Aurel’s Grand Theater case](https://tympanus.net/codrops/2025/05/20/behind-the-curtain-building-aurels-grand-theater-from-design-to-code/) documents Three.js, Vue.js, GSAP, TypeScript, and Blender for a solo portfolio where visitors read cases, solve mysteries, unlock secret pages, and explore a theater. The author says the project took about a year to complete once the direction was chosen, after nearly two years spent reaching that direction.

This is strong evidence for both the attraction and the cost of a central metaphor. Theater governs place, navigation, secrets, assets, and pacing, so it is more coherent than an effects collage. It is also an unrealistic schedule and asset baseline for a studio portfolio that must begin selling focused client work.

House Adel lesson: a complete world can be an excellent lab project. It should not delay the canonical work, offer, and contact system for years.

### Newer portfolio process cases

[Roman Jean-Elie’s WebGL portfolio case](https://tympanus.net/codrops/2025/11/27/letting-the-creative-process-shape-a-webgl-portfolio/) describes a process in which the presumed centerpiece became optional and features were removed when they did not fit the emerging direction. [Corentin Bernadou’s 2026 portfolio case](https://tympanus.net/codrops/2026/03/05/inside-corentin-bernadous-portfolio-swiss-inspired-layouts-webgl-geometry-and-thoughtful-motion/) frames a freelancer portfolio as an editorial playground combining WebGL experiments with considered motion.

These are useful process references, not additional business benchmarks. Their strongest shared lesson is subtraction: technical experiments must survive a concept and portfolio-purpose test.

## Selection rule for House Adel

An award/showcase candidate should enter the core reference matrix only if enough evidence exists to classify:

1. the actual business or individual;
2. the content and route model after the hero;
3. the project depth and authorship;
4. the mobile and fallback behavior;
5. the implementation evidence status;
6. the realistic production burden.

This rule kept the matrix at 22 comparable references rather than turning it into an uncritical awards feed.
