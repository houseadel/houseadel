# Performance patterns

**Status:** Phase 1 measurement framework; no production budgets are approved  
**Sources accessed:** 2026-07-30

## Reading key

- **Evidence** is supported by a cited primary source.
- **Inference** is a technical deduction that must be verified on House Adel's implementation.
- **Recommendation** is a temporary experiment guardrail, not a production promise.

## User outcomes first

Performance work should protect:

1. useful content appears quickly;
2. input responds promptly;
3. layout does not jump;
4. animation remains stable on ordinary hardware;
5. enhanced visuals do not block routes;
6. memory and GPU resources remain bounded across navigation; and
7. the experience degrades deliberately under network, GPU, battery, or asset failure.

## Current web outcome metrics

Google's current Core Web Vitals guidance defines a “good” experience at the 75th percentile of page visits as:

| Metric | Good threshold | What it protects |
| --- | ---: | --- |
| Largest Contentful Paint (LCP) | ≤ 2.5 s | Loading of the main visible content |
| Interaction to Next Paint (INP) | ≤ 200 ms | Responsiveness across interactions |
| Cumulative Layout Shift (CLS) | ≤ 0.1 | Visual stability |

Source: [web.dev, “Defining Core Web Vitals thresholds”](https://web.dev/articles/defining-core-web-vitals-thresholds). These are field percentiles, not a guarantee that a creative interaction feels good.

Report both:

- **field data** when traffic is sufficient, segmented by route/device where possible; and
- **lab traces** on controlled reference devices/networks for regression and diagnosis.

## Budget process

AGENTS.md requires budgets to be established from measurements. Therefore:

1. Measure the current review interface and each isolated prototype.
2. Identify the lowest ordinary target devices and slow-network scenarios.
3. Record what each candidate needs to communicate the idea.
4. Compare transferred bytes, decode cost, main-thread work, GPU frame time, memory/resource counts, and user outcome metrics.
5. Set budgets from the best conceptually successful candidate plus an explicit margin.
6. Enforce route and asset budgets in tests.

Do not retrofit a budget to whichever prototype looks most polished.

## Phase 1 comparison envelope

The following are **recommendation hypotheses for fair prototype comparison**, not standards or approved production budgets:

| Dimension | Initial experiment guardrail | Why it exists |
| --- | --- | --- |
| Critical public route | Meaningful pre-rendered HTML without waiting for WebGL | Protect direct access, SEO, and failure states |
| Initial enhanced code | Lazy-load universe/project modules; inspect compressed route chunks individually | Identify accidental shared-bundle growth |
| Nexus media | Begin with a poster; do not preload all project videos/models | Test the relationship model without hiding cost |
| Pixel ratio | Cap by measured quality tier; begin at 1 on low, 1.5 standard, 2 maximum | Bound fill rate; exact values require visual/device tests |
| Render loop | Stop or demand-render when visually still | Avoid permanent GPU work |
| Main-thread tasks | Investigate work at or above 50 ms and yield/split where possible | Browsers classify tasks over 50 ms as long tasks ([web.dev, “Optimize long tasks”](https://web.dev/articles/optimize-long-tasks)) |
| Route cycling | Stable renderer resource counts after repeated navigation | Detect leaks before aesthetic approval |
| Enhanced asset wait | Bounded; destination shell wins over indefinite loading | Preserve navigation under failure |

No byte ceiling is asserted yet because the asset world, baseline measurements, and representative devices are not approved. The first review report should propose numeric budgets from captured traces.

## Loading sequence

Recommended priority:

```text
HTML + critical CSS + fonts needed for first text
  -> navigation, proposition, route heading, media space
  -> first art-directed still/poster
  -> route interaction code
  -> active WebGL scene (if requested/eligible)
  -> adjacent transition asset
  -> nonessential video/high-quality variants
```

- Preload only assets proven to be required early.
- Reserve media dimensions to prevent layout shift.
- Lazy-load universe-specific code and assets.
- Decode/prepare enhanced media without delaying semantic content.
- Persist only resources that are cheaper and safer than recreating them.

Dynamic `import()` can defer code until needed; web.dev's JavaScript guidance also notes that script evaluation can create long tasks and that splitting has network/runtime tradeoffs ([web.dev, “Script evaluation and long tasks”](https://web.dev/articles/script-evaluation-and-long-tasks)).

## Image and video

- Generate responsive widths and art-directed crops rather than sending a desktop master to every device.
- Set intrinsic image dimensions.
- Choose the actual format/quality winner by visual comparison and encoded size.
- A poster is the successful initial state of a video, not an error placeholder.
- Avoid video textures for critical information.
- Store production masters outside public bundles.
- Stop/pause offscreen video and never preload every project loop.

The browser's `srcset`, `sizes`, and `<picture>` mechanisms support resolution selection and art direction ([web.dev, “Responsive images”](https://web.dev/articles/responsive-images)).

## JavaScript and main thread

- Keep the semantic shell useful before scene code.
- Load route and project-world code on demand.
- Avoid attaching independent scroll/resize/pointer loops for every module.
- Batch layout reads/writes and avoid forced synchronous layout.
- Yield or split long asset preparation and geometry work.
- Prefer CSS for simple states and one coordinated timeline system for complex transitions.
- Abort obsolete fetch/decode work after a newer navigation.

## WebGL and GPU

### Quality manager

Use sustained measured frame behavior rather than a one-time device label. A quality manager may adjust:

- device pixel ratio;
- post-processing;
- material/shadow complexity;
- active layers;
- texture resolution;
- animation frequency; and
- whether WebGL remains active at all.

React Three Fiber documents demand rendering and a performance monitor that can adjust DPR/quality; equivalent policies can be implemented directly in Three.js ([R3F, “Scaling performance”](https://r3f.docs.pmnd.rs/advanced/scaling-performance)).

### Resource lifecycle

Removing a Three.js object from a scene does not release its GPU resources. Geometry, material, texture, and render target ownership must be disposed explicitly ([Three.js, “How to dispose of objects”](https://threejs.org/manual/en/how-to-dispose-of-objects.html)).

For each route-cycle test, log where available:

- renderer `info.memory.geometries`;
- renderer `info.memory.textures`;
- shader program count;
- render calls and triangles;
- active render targets owned by the app;
- decoded video/image resources; and
- browser process memory as directional evidence, not a universal API.

Run at least 20 cycles through the heaviest transition during Phase 1 comparison. Counts may include renderer-managed caches; interpret them with the Three.js documentation rather than demanding literal zero.

### Context loss

Trigger a simulated `webglcontextlost` during loading, idle, and transition states. The site should stop the loop, expose the static state, retain semantic navigation, and attempt bounded restoration if supported ([MDN, `webglcontextlost`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextlost_event)).

## Measurement matrix

| Scenario | Capture |
| --- | --- |
| Cold direct homepage | LCP element/time, bytes by type, request order, JS execution, layout shifts |
| Cold direct case-study route | HTML completeness, first still, route chunking, metadata |
| Nexus first interaction | INP/event timing, frame trace, GPU/main-thread contention |
| Route transition | interruption behavior, frame time, destination shell timing |
| 20-route cycle | resource counts, memory trend, detached/retained objects |
| Slow network | placeholder quality, timeout/failure state, accidental eager assets |
| Integrated-graphics desktop | frame pacing, resolution tier, thermals/power direction |
| Ordinary mobile | first usable content, frame pacing, memory/context stability |
| Reduced motion | no hidden loading dependency, no unnecessary loops |
| WebGL unavailable/lost | complete semantic/static path |

Record browser, OS, hardware, viewport, pixel ratio, connection profile, build commit, and asset manifest hash with every result.

## CI gates to add after baselining

- compressed bundle budget per entry/route;
- asset-manifest maximums by media class and initial-route eligibility;
- Lighthouse or equivalent lab regression thresholds;
- browser assertions for no eager universe downloads;
- visual fallback snapshots;
- reduced-motion and no-WebGL journeys;
- route-cycle resource test;
- broken-asset test; and
- accessibility checks plus manual milestone review.

Automated scores are signals, not the definition of a successful experience.

## Sources

- web.dev, “Web Vitals”: https://web.dev/articles/vitals
- web.dev, “Defining Core Web Vitals thresholds”: https://web.dev/articles/defining-core-web-vitals-thresholds
- web.dev, “Optimize long tasks”: https://web.dev/articles/optimize-long-tasks
- web.dev, “Script evaluation and long tasks”: https://web.dev/articles/script-evaluation-and-long-tasks
- web.dev, “Responsive images”: https://web.dev/articles/responsive-images
- Three.js, “Cleanup”: https://threejs.org/manual/en/cleanup.html
- Three.js, “How to dispose of objects”: https://threejs.org/manual/en/how-to-dispose-of-objects.html
- Three.js, WebGLRenderer: https://threejs.org/docs/pages/WebGLRenderer.html
- React Three Fiber, “Scaling performance”: https://r3f.docs.pmnd.rs/advanced/scaling-performance
- MDN, `webglcontextlost`: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextlost_event
