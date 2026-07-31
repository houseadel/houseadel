---
name: house-adel-performance
description: Establish, measure, enforce, and report House Adel performance budgets for JavaScript, images, video, models, textures, GPU memory, device pixel ratio, frame time, loading, and Core Web Vitals. Use when profiling prototypes or routes, defining quality tiers, planning lazy loading, investigating regressions, or setting performance gates for desktop and mobile experiences.
---

# House Adel Performance

## Measure before setting budgets

- Read the route, asset, and rendering decisions before profiling.
- Establish budgets from representative measurements; do not invent permanent limits from taste or a fast development machine.
- Record URL, commit, build mode, browser, hardware, viewport, DPR, power state, cache state, network profile, run count, tool version, and date with every result.
- Test production builds on desktop integrated graphics and ordinary mobile-class hardware. Use throttling for repeatability, then confirm critical results on physical devices.
- Measure cold navigation, warm navigation, direct entry, transition peaks, idle scenes, and repeated route changes.
- Separate facts from recommendations and label estimates, especially GPU memory, as `Inference`.

## Maintain a budget ledger

Define per-shell and per-universe limits for:

- Initial and route-specific JavaScript, both compressed transfer and parsed or executed cost.
- Initial images, fonts, audio, video, models, textures, environment maps, and transition assets.
- Largest individual asset, total lazy payload, decode time, and shader compile time.
- Peak GPU memory, texture dimensions, render-target dimensions, sample count, and simultaneous scenes.
- Device pixel ratio by quality tier.
- Median and tail frame time, dropped-frame rate, long tasks, and transition duration.
- Loading-placeholder latency, useful-content latency, and fallback activation time.
- Core Web Vitals and layout stability for semantic content.

Keep experimental and production-candidate budgets separate. Record the measurement that justifies each limit, its owner, and the action taken when the limit is exceeded. Revisit budgets when the governing concept, asset world, architecture, or supported hardware changes.

Use the current official Core Web Vitals definitions and thresholds when creating gates; verify them rather than copying stale values into the repository.

## Control initial work

- Ship only the House Adel shell, requested route, critical typography, loading placeholder, and assets needed for first meaningful content.
- Split universe code at its route or registry boundary.
- Lazy-load WebGL, post-processing, heavy media, case-study galleries, and other worlds.
- Preload on explicit navigation intent or measured idle opportunity; cancel stale preloads and avoid downloading all universes.
- Show a poster or lightweight composition before decoding video, models, or large textures.
- Keep semantic navigation and copy usable while enhancement loads.
- Inspect duplicate dependencies and prevent world modules from entering the shared chunk accidentally.

Treat transferred bytes, main-thread work, decode memory, and GPU upload cost as separate constraints. A small compressed asset can still be expensive after decode.

## Budget assets and GPU memory

- Size images and textures to their maximum displayed or sampled need at each tier; generate responsive variants.
- Cap maximum texture resolution by measured tier and reject hidden oversized maps.
- Provide posters and mobile variants for video; defer playback assets until needed and pause them when invisible.
- Optimize models by measured contribution: remove unseen data, reduce geometry, limit materials, compress meshes and textures, and verify decode cost.
- Avoid simultaneously retaining outgoing and incoming world assets beyond the transition window.

Estimate uncompressed GPU allocations from dimensions, format, mip levels, faces, layers, depth buffers, multisampling, and duplicate render targets. State that the result is an estimate because driver allocation varies. Compare estimates with browser and renderer diagnostics, then measure route-to-route deltas.

Use project-specific DPR ceilings. Until measurements justify tighter values, never exceed `2`; start low or mobile tiers near `1`, medium tiers no higher than `1.5`, and reserve higher density for a proven high tier. Downshift resolution or effects after sustained frame-budget misses.

## Profile frame time

- Measure CPU and GPU contribution where tools permit; do not report frames per second alone.
- Capture median, 95th percentile, worst sustained window, long tasks, and dropped or missed frames during load, interaction, transition, and idle.
- Compare against the display refresh budget: about `16.7ms` at 60 Hz and `33.3ms` at 30 Hz. Leave headroom for browser and input work.
- Inspect JavaScript, style and layout, paint, texture upload, shader compilation, draw calls, triangles, overdraw, render targets, and garbage collection.
- Warm shaders deliberately when appropriate, but include that warm-up in loading cost.
- Pause inactive render loops and media, then verify idle CPU and GPU activity approach the documented baseline.

Use sustained sampling and hysteresis for dynamic quality changes. Avoid quality flapping and do not conceal a structural bottleneck with an aggressive automatic downshift.

## Validate loading and resilience

- Test ordinary and constrained networks, disabled cache, CPU throttling, slow decodes, failed media, failed lazy chunks, and no WebGL.
- Confirm the placeholder appears promptly, conveys accurate status, and never blocks semantic links.
- Set explicit timeouts and switch to a usable fallback instead of waiting indefinitely.
- Confirm aborting navigation cancels unnecessary network, decode, and upload work.
- Check that Back and Forward do not reload already-safe shared assets or leak previous worlds.

## Enforce and report

- Generate deterministic bundle and asset-size reports in continuous integration.
- Fail stable byte and structure budgets automatically.
- Run lab Core Web Vitals and route checks consistently, but track trends before making variable device timing a hard gate.
- Keep physical-device frame-time and GPU-memory evidence in review records when CI cannot reproduce it.
- Compare every result with its prior baseline and explain regressions rather than averaging them away.
- Coordinate functional failure coverage with `house-adel-qa` and rendering-tier changes with `house-adel-webgl`.

Report the visible result, tested environment, median and tail values, budget, delta, bottleneck, recommended action, and remaining uncertainty. Do not approve a visual layer without its placeholder, fallback, measured cost, and cleanup result.
