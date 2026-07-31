# Prototype-to-production cost model

Status: comparative estimate, not a quote  
Assumption: one independent creative director working with Codex, licensed/generated assets, and specialist help only where noted.

## Comparison

| Dimension | A — SVG / DOM fracture | B — Hybrid WebGL glass | C — Cinematic compositing |
|---|---|---|---|
| Phase 1 implementation difficulty | Medium | High | Medium–high |
| Production refinement estimate | 2–3 weeks | 4–6 weeks | 3–5 weeks |
| Ongoing per-universe implementation | Low | Medium | Low–medium |
| Ongoing per-universe asset direction | Medium | Medium–high | High |
| Specialist need | Optional motion/type review | Shader/real-time specialist recommended for a signature finish | Image/motion compositor or editor helpful |
| Initial visual assets | 3–5 master frames plus crops | Same frames, textures, masks, optional environment/depth data | 3–5 master frames, isolated planes, matte/depth maps, optional loops |
| Initial code weight | Low | Highest | Medium |
| GPU/memory burden | Lowest | Highest | Medium |
| Accessibility effort | Lowest | Highest despite DOM parity | Medium |
| Mobile reinterpretation effort | Medium | High | Medium–high |
| Expansion risk | Layout density | Scene composition and GPU budget | Recurring asset-production load |

The week ranges describe focused production effort after a direction, copy, and master frames are approved. They exclude client feedback cycles, full case-study writing, commissioned photography/CGI, complex sound, and legal review.

## Asset minimums per universe

### A — SVG / DOM fracture

- one approved master frame;
- desktop, tablet, and mobile crops;
- one lightweight placeholder;
- one fallback color/type treatment;
- optional one short loop or foreground cutout.

### B — Hybrid WebGL glass

- everything in A;
- bounded portal textures by quality tier;
- glass normal/noise or authored distortion data;
- optional depth map and environment reflection;
- static no-WebGL composition;
- test captures for integrated graphics and mobile.

### C — Cinematic compositing

- approved master frame;
- clean background plate;
- one to three separated foreground/midground elements or authored mattes;
- depth or transition matte;
- optional 3–6 second seamless motion loop;
- desktop and mobile compositions, not only crops;
- poster, reduced-motion still, and failure fallback.

## What Codex can absorb

- app architecture and route contracts;
- DOM/SVG composition;
- routine Three.js scene setup and shader prototyping;
- GSAP timelines, interruption, and reverse behavior;
- asset manifests, image/video/model optimization scripts;
- responsive implementation;
- Playwright, accessibility, visual, and performance tests;
- repeatable universe scaffolding and cleanup checks;
- documentation and evidence capture.

## What remains asset- or specialist-sensitive

- distinctive master-frame art direction and final curation;
- convincing signature glass/refraction beyond a prototype;
- complex character or product consistency across generated assets;
- high-end sound design and mastering;
- commissioned photography, CGI, or 3D art;
- advanced color finishing and seamless image-to-video loops;
- rights assessment for high-value client campaigns;
- Safari/iOS device testing on physical hardware.

## Decision implication

Choose B only if direct side-by-side review shows that real-time glass creates meaning or material presence unavailable to A and C. Choose C only with a repeatable master-frame and layer-production pipeline. A is not automatically the conservative answer: exceptional graphic composition and typography are still demanding, but its risks are easier to measure and maintain.
