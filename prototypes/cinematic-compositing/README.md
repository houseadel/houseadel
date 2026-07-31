# Prototype C — Cinematic compositing

## Purpose

Test whether directed master frames and a minimal image compositor can deliver greater perceived fidelity than real-time glass with less geometry and a stronger still fallback.

## Reference basis

- asset-led project presentation across Immersive Garden, Hello Monday, Locomotive, and high-finish launch work;
- Shopify Editions' changing creative covers over a stable content grammar;
- image-led transition and asset-production findings in `research/transition-patterns.md` and `research/asset-production-patterns.md`.

## Technologies used

- one R3F/Three shader plane blending responsive WebP textures;
- an always-present responsive DOM image layer and semantic project links;
- GSAP for copy, matte, and route coordination;
- demand rendering so an idle composition stops drawing;
- static no-WebGL mode through the shared review controls.

## Performance result

Production-preview desktop: 741 KiB encoded resources, 337 KiB route code gzip, 323 KiB imagery, 976 ms local LCP, 16.8 ms p95 frame cadence, a 119 ms maximum long task, and an estimated 31 MiB GPU footprint. Lighthouse mobile simulation: performance 58, accessibility 100, 3,729 ms LCP, and 1,757 ms total blocking time.

## Mobile result

The active world becomes a tall editorial composition with large type and three tactile project controls. Canvas DPR is capped at 1. Mobile emulation measured 584 KiB resources, 166 KiB imagery, 400 ms local LCP, 16.7 ms p95 cadence after settlement, no sampled long tasks, and an estimated 11.2 MiB GPU footprint.

## Strengths

- highest perceived image fidelity from a compact scene graph;
- the “world” can be art-directed primarily through approved frames and layers;
- demand rendering avoids permanent idle GPU work;
- a still poster already expresses the concept if WebGL is absent;
- well suited to an Editions or authored-cover architecture.

## Weaknesses

- largest recurring art-direction and asset-separation burden;
- same heavy Three/R3F runtime as B in the disposable comparison implementation;
- simulated-mobile Lighthouse blocking and LCP currently fail the target;
- generative source material will look generic without strong visual bibles and finishing;
- layer/matte/loop production may require compositing or motion specialists.

## Recommendation

Carry C as the strongest image-led challenger, not as a performance winner. If selected visually, spike a smaller direct-Three or CSS/DOM compositor, preserve demand rendering, and prove the master-frame-to-layer workflow on one complete world before multiplying it.
