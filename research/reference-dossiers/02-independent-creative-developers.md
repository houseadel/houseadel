# Independent creative developers and auteur portfolios

Status: comparative evidence for Phase 1.  
Access date: 2026-07-30.  
Evidence note: `Browser observation` describes public behavior on the access date. `Inference` marks interpretation.

## Bruno Simon

**Classification:** solo auteur and narrow technical reference; not a direct studio-business template.

**Business layer.** [Bruno Simon’s portfolio](https://bruno-simon.com/) presents an individual creative developer through a drivable 3D world. The separate [HTML version](https://bruno-simon.com/html/) exposes a conventional biography, project links, experiments, contact paths, and a link back to the 3D version. The official [source repository](https://github.com/brunosimon/folio-2025) makes the production system unusually transparent.

**Governing concept.** Driving is the single consistent verb. Projects, biography, experiments, and controls become places or objects within one world. Unlike a portal skin, the metaphor governs navigation, physics, pacing, asset creation, sound, and discovery. What survives beyond 30 seconds is a body of work and a clear technical identity, not only an intro.

**Home and navigation.** `Browser observation:` the immersive route offers controls for driving, quality, renderer, map, mute, and respawn. Its accessibility tree exposed only two unlabeled buttons during this pass and did not expose the project destinations as semantic links. The [HTML version](https://bruno-simon.com/html/) exposes headings and direct links for projects, labs, social profiles, and contact. The two routes therefore demonstrate both a strong resilience pattern and a discoverability gap: essential content exists outside the 3D layer, but the semantic route is structurally separate.

**Rendering, motion, audio, and assets.** The [portfolio page](https://bruno-simon.com/) names Three.js, TSL, WebGL/WebGPU, Rapier, and Howler and credits Kounine’s music under CC0. The [repository](https://github.com/brunosimon/folio-2025) documents the Vite setup, game loop, Blender workflow, glTF Transform processing, KTX textures, GPU-friendly ETC1S compression, and WebP interface assets. The [package manifest](https://raw.githubusercontent.com/brunosimon/folio-2025/main/package.json) verifies dependencies including Three.js, Rapier3D, glTF Transform, GSAP, Howler, Sharp, stats-gl, and Vite. `Browser observation:` network traffic included compressed model and texture assets, Draco/Basis decoders, Rapier WASM, and multiple audio files.

**Project presentation and production.** Exploration is the primary presentation; direct case-study explanation is stronger in the HTML index than inside the observed world. The open repository is itself a significant technical case study because it makes source, setup, assets, and optimization inspectable.

**Mobile, accessibility, and resilience.** The separate HTML route is a meaningful no-spatial fallback. It does not by itself prove route parity, focus restoration, reduced-motion support, or an accessible immersive layer. Renderer and quality controls are useful performance affordances; exact mobile tier behavior was not audited.

**House Adel assessment.** Reuse the completeness of the metaphor and the deterministic asset pipeline. Reuse the idea of a dignified semantic route. Do not reuse the driving/game form, hide destinations inside a canvas, or let the fallback become a separate lower-status site. House Adel’s essential links should remain semantic in the main architecture even if a nexus surrounds them.

## Aristide Benoist

**Classification:** realistic independent technical peer.

**Business layer.** The archived [Folio V1](https://aristidebenoist.com/folio-v1) describes Aristide Benoist as an independent developer specializing in motion and interaction, working with companies, agencies, startups, and individuals worldwide. It lists approximately 30 projects with client, role, and type metadata, including House of Gucci, *Mank*, and Capsulin.

**Governing concept and durable value.** The persistent proposition is an individual practice built around interaction craft. The archive is valuable because role metadata survives the visual presentation: visitors can distinguish development, collaboration, and project type.

**Home, navigation, motion, rendering, and assets.** The current [official home](https://aristidebenoist.com/) is JavaScript-dependent. The archive offers a clearer index. One entry names Capsulin as “native WebGL”; this is project-specific evidence only. The sources reviewed do not document the renderer, CMS, shader system, or asset pipeline of the current portfolio.

**Project presentation and production.** The work index makes authorship legible but is concise compared with fuller narrative cases. It demonstrates breadth and collaboration more effectively than business outcome. `Inference:` this suits a sought-after specialist whose audience already understands the role, but House Adel needs more context for clients buying an entire compact experience.

**Mobile and accessibility.** Current keyboard, screen-reader, reduced-motion, mobile, and no-JavaScript behavior were not verified. The archive’s explicit links and metadata are structurally more resilient than a canvas-only work wall, but no conformance claim is made.

**House Adel assessment.** Reuse explicit role/type/client metadata and a durable work archive. Pair that economy with deeper selected cases. Do not infer that motion itself communicates strategic authorship.

## Niccolò Miranda

**Classification:** realistic independent creative peer.

**Business layer.** [Niccolò Miranda’s official portfolio](https://www.niccolomiranda.com/) describes a multidisciplinary freelancer and Amsterdam-based digital art director, interactive designer, and creative developer working with worldwide brands. The offer combines motion, typography, and creative coding rather than separating design and implementation.

**Governing concept and durable value.** The portfolio uses a strong paper/editorial sensibility and horizontal drag as a recognizable authorial language. The durable business message is that one person can combine direction, design, and interactive execution.

**Home, navigation, motion, rendering, and assets.** `Browser observation:` the home presents a horizontally navigable work list with direct project destinations and a conspicuous typographic/editorial frame. The exact framework, CMS, renderer, and asset pipeline are not documented in the reviewed primary sources. No Webflow or WebGL claim is made.

**Project presentation and production.** Individual project destinations support the work list, but the portfolio’s own art direction is often more memorable than process or quantified result. `Inference:` the format is optimized for recognition and commissions based on taste; House Adel additionally needs to explain why an occasion, launch, or cultural story took its particular form.

**Mobile and accessibility.** Current keyboard equivalents for drag, focus order, reduced motion, touch behavior, and no-JavaScript fallback were not audited.

**House Adel assessment.** Reuse the clarity of individual authorship and the integration of typography, pacing, and development. Do not copy the paper metaphor or horizontal-drag signature. House Adel needs its own relational concept and direct vertical reading on constrained devices.

## Dennis Snellenberg

**Classification:** highly relevant realistic business peer.

**Business layer.** [Dennis Snellenberg’s about page](https://dennissnellenberg.com/about) presents a freelance designer and developer offering tailored solutions from concept through implementation. It explicitly names Webflow or Kirby CMS as development options and emphasizes micro-animations, transitions, and interaction. The [work index](https://dennissnellenberg.com/work) separates a current selection from a substantially larger archive.

**Governing concept and durable value.** There is no heavy fictional world. The durable system is business clarity plus consistent craft: role, selected work, archive, and contact remain easy to understand. This is an important counterweight to the assumption that a creative portfolio needs persistent WebGL.

**Home, navigation, motion, rendering, and assets.** Direct semantic project links and conventional page routes carry the essential information. Motion and transitions act as finish rather than the only navigation model. Webflow and Kirby are verified offered platforms; they are not necessarily used for every case or the current home. No current WebGL implementation is claimed.

**Project presentation and production.** The [Damai case](https://www.dennissnellenberg.com/work/the-damai) credits design collaborators while identifying Snellenberg’s design and development role. The [TWICE case](https://dennissnellenberg.com/work/twice) identifies interaction and development and credits the designer. This explicit authorship is a strong model for an independent practice. The archive also shows continuity beyond a few signature pieces.

**Mobile and accessibility.** Direct links and conventional routes are promising structural choices, but current focus behavior, reduced motion, contrast, touch-target sizing, and CMS-generated semantics were not audited.

**House Adel assessment.** Reuse the offer clarity, archive, collaborator credits, and concept-to-delivery framing. House Adel can be more art-directed without sacrificing this legibility. Do not elevate magnetic cursors, page wipes, or micro-interaction tropes into the governing idea; those devices date quickly when detached from content.

## Group conclusion

The independent references show that a compact practice gains credibility through clear authorship and controlled scope. Bruno Simon proves that an immersive world is possible when the metaphor, code, assets, and fallback are treated as one system. Dennis Snellenberg proves that business legibility and conventional routes can be a stronger foundation than spectacle. Aristide Benoist and Niccolò Miranda prove that motion and typography can communicate a distinctive individual practice. House Adel should combine the clarity of the latter group with only as much world-building as it can fully produce and maintain.
