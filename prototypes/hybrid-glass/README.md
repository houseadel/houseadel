# Prototype B — Hybrid WebGL glass

## Purpose

Test whether real-time refraction, depth, and raycasting add meaningful material presence while DOM links, route state, focus, and failure behavior remain authoritative.

## Reference basis

- persistent and specialist rendering evidence from Active Theory, Lusion, MakeMePulse, 14islands, and Bruno Simon;
- explicit fallback/index patterns from Bruno Simon and Unseen;
- renderer ownership, resource disposal, and quality-tier research in `research/webgl-patterns.md`.

No reference establishes that glass itself is appropriate for House Adel.

## Technologies used

- React Three Fiber with one Three.js canvas;
- three polygon geometries, shader materials, texture distortion, and raycasting;
- canonical DOM navigation mirrored into canvas state;
- GSAP route matte;
- context-loss observer and explicit control activating Prototype A.

## Performance result

Production-preview desktop: 720 KiB encoded resources, 339 KiB route code gzip, 300 KiB imagery, 384 ms local LCP, 50.0 ms p95 frame cadence, a 290 ms maximum long task, and an estimated 31 MiB of texture/canvas GPU memory. Lighthouse mobile simulation: performance 64, accessibility 100, 3,737 ms LCP, and 884 ms total blocking time.

## Mobile result

The fragments recompose vertically and the canvas drawing-buffer DPR is capped at 1 despite a DPR-2 emulated device. Mobile emulation measured 573 KiB total resources, 153 KiB imagery, 16.7 ms p95 cadence after settlement, a 129 ms maximum long task, and an estimated 11.2 MiB GPU footprint. The same DOM links and A fallback remain available.

## Strengths

- clearest test of simultaneous realities occupying one material surface;
- raycasting can enrich pointer exploration without owning navigation;
- actual context loss and forced failure recover at the same URL;
- image assets remain ordinary responsive stills rather than models.

## Weaknesses

- the heaviest reliability and specialist burden;
- near-maximum Phase 1 enhanced-code budget before any production effects;
- desktop headless cadence and start-up tasks miss the standard guardrails;
- simulated-mobile Lighthouse LCP misses the public target;
- literal glass remains the highest cliché risk.

## Recommendation

Do not select B on technical ambition. Keep it only if live visual review shows that refraction creates meaning A and C cannot, then require an integrated-GPU trace, demand/adaptive rendering, start-up profiling, and a quality downshift before production approval.
