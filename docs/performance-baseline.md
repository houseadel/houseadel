# Phase 1 performance baseline and budgets

**Status:** Measured prototype evidence and provisional Phase 1 guardrails; not production approval  
**Raw results:** [`performance-results.json`](performance-results.json)  
**Method:** cold isolated Chromium context per route against a Vite production preview, 1440 × 900 desktop and 390 × 844 mobile emulation, after responsive asset integration

## What was measured

- encoded resource bytes by type;
- compressed JS/CSS loaded by the route;
- FCP, LCP, and CLS in the local lab;
- long tasks;
- requestAnimationFrame cadence after route settlement;
- canvas CSS and drawing-buffer dimensions;
- decoded DOM-image memory;
- an estimate of texture plus canvas-buffer GPU memory;
- WebGL/fallback state; and
- desktop and mobile emulation separately.

The GPU number is an **estimate**, not driver telemetry. It includes loaded RGBA texture/mipmap storage and approximate double color/depth canvas buffers, but not browser, driver, shader, or renderer overhead. Frame cadence is headless Chromium evidence, not a physical-device GPU trace. INP requires real trusted interactions and eventually field data; it is a gate below, not a fabricated Phase 1 number.

## Route results

| Route / case | Encoded resources | Route code gzip* | Images | Local LCP | CLS | Frame median / p95 | Long-task max | GPU estimate |
| --- | ---:| ---:| ---:| ---:| ---:| ---:| ---:| ---:|
| Review home / desktop | 162 KiB | 81 KiB | 0 above fold | 236 ms | 0.0108 | 16.7 / 16.7 ms | 0 ms | 0 |
| A fracture / desktop | 293 KiB | 109 KiB | 102 KiB | 428 ms | 0.0001 | 16.7 / 16.8 ms | 0 ms | 0 |
| B hybrid / desktop | 720 KiB | 339 KiB | 300 KiB | 384 ms | 0.0002 | 33.3 / 50.0 ms | 290 ms | 31.0 MiB |
| C cinematic / desktop | 741 KiB | 337 KiB | 323 KiB | 976 ms | 0.0008 | 16.7 / 16.8 ms | 119 ms | 31.0 MiB |
| A fracture / mobile emulation | 293 KiB | 109 KiB | 102 KiB | 388 ms | 0 | 16.7 / 16.8 ms | 0 ms | 0 |
| B hybrid / mobile emulation | 573 KiB | 339 KiB | 153 KiB | 376 ms | 0 | 16.7 / 16.7 ms | 129 ms | 11.2 MiB |
| C cinematic / mobile emulation | 584 KiB | 337 KiB | 166 KiB | 400 ms | 0 | 16.7 / 16.7 ms | 0 ms | 11.2 MiB |

\* `Route code gzip` is the sum of loaded JS and CSS files after gzip, including the shared shell. It is not the uncompressed browser parse size.

No route loads initial video or models. The review home deliberately loads no above-the-fold image; its prototype and capture imagery is lazy.

## Lighthouse mobile simulation

Lighthouse 13.4.1 ran against the same production preview using its mobile simulation. The compact routes separate sharply once throttling and main-thread cost are introduced.

| Route | Performance | Accessibility | LCP | Total blocking time | CLS |
| --- | ---:| ---:| ---:| ---:| ---:|
| Review home | 98 | 100 | 1,970 ms | 0 ms | 0.0161 |
| A fracture | 95 | 100 | 2,508 ms | 0 ms | 0 |
| B hybrid | 64 | 100 | 3,737 ms | 884 ms | 0.0020 |
| C cinematic | 58 | 100 | 3,729 ms | 1,757 ms | 0.0006 |

Raw audit outputs remain under ignored `test-results/lighthouse/`; the compact tracked record is [`lighthouse-summary.json`](lighthouse-summary.json). These scores are diagnostic lab results, not guarantees. They reinforce the runtime trace: B and C currently miss the public LCP target under simulation, while C has the largest blocking burden.

## Interpretation

### Prototype A

A is the only candidate that currently clears every automated frame and long-task guardrail. Its three desktop images total about 102 KiB because the browser selects the 960-pixel AVIF variants. It has no GPU allocation beyond normal page compositing.

### Prototype B

B now renders its actual R3F scene in headless Chromium and retains a tested DOM/SVG failure mode. The shader textures and one canvas remain within the provisional memory envelope, but desktop headless cadence had a 33.3 ms median and 50.0 ms p95, renderer start-up produced a 290 ms long task, and simulated-mobile Lighthouse LCP reached 3.74 seconds with 884 ms of blocking time. It therefore **does not earn a production recommendation yet**. It needs a representative integrated-GPU trace, demand/adaptive rendering, start-up profiling, and a quality downshift before selection.

### Prototype C

C has a comparable code/GPU cost to B because both currently share the same R3F/Three runtime, but it concentrates visual work in one shader plane. Demand rendering stops idle compositor work. Mobile emulation held 60 Hz cadence after settlement; the desktop sample had a 16.8 ms p95, a 33.4 ms maximum interval, and a 119 ms start-up long task. Lighthouse exposed a larger simulated-mobile blocking burden—1,757 ms—and a 3.73-second LCP. It remains a stronger visual-fidelity hypothesis than a performance winner.

### Core Web Vitals

Every local LCP sample is below 1.1 seconds and every CLS sample is below 0.011. These are fast localhost lab observations, not 75th-percentile field results. The public-site targets remain:

- LCP ≤ 2.5 seconds at the 75th percentile;
- INP ≤ 200 ms at the 75th percentile; and
- CLS ≤ 0.1 at the 75th percentile.

No field INP exists for a local prototype. Do not claim it passes.

## Provisional budgets

These limits are based on the measured Phase 1 set plus explicit headroom. They are comparison gates for the next candidate, not permission to fill every allowance.

| Dimension | Provisional budget | Current result / action |
| --- | ---:| --- |
| Canonical initial JS | ≤ 80 KiB compressed | Review home ≈ 72 KiB encoded JS; passes |
| Initial CSS | ≤ 12 KiB compressed | Build output 8.9 KiB gzip; passes |
| Initial fonts | ≤ 90 KiB | 81 KiB; passes, but final identity should subset again |
| Lazy enhanced route code | ≤ 280 KiB additional gzip over the shell | A ≈ 29 KiB; B/C ≈ 264 KiB; all fit, B/C leave little margin |
| Above-fold home image | ≤ 150 KiB | Current review home 0; final candidate may spend this on one approved poster |
| Desktop nexus imagery | ≤ 350 KiB encoded | A 102, B 300, C 323 KiB; pass |
| Mobile nexus imagery | ≤ 180 KiB encoded | A 102, B 153, C 166 KiB; pass |
| Initial video | 0 by default | No video. Any proposal must justify and separately approve a ≤ 1.2 MiB first loop |
| Initial models | 0 by default | No model. Any proposal must justify and separately approve a ≤ 1.5 MiB first model |
| Portal texture | 1440 × 810 desktop target; 960 × 540 mobile target; 2048 px hard maximum | Current tiers comply |
| Canvas DPR | 1 mobile/low; ≤ 1.5 standard desktop; 2 hard maximum | Current prototype buffers use DPR 1 in measured cases |
| Steady GPU estimate | ≤ 48 MiB standard; ≤ 64 MiB only during bounded transition | B/C ≈ 31 MiB desktop and 11.2 MiB mobile; estimated pass |
| Settled frame time | median ≤ 16.7 ms and p95 ≤ 24 ms standard; p95 ≤ 33.3 ms low tier | A and C pass the sampled p95 gate; B desktop fails even the low tier |
| Long tasks | investigate every task ≥ 50 ms; no accepted candidate may retain a ≥ 100 ms start-up task without mitigation | B and desktop C fail; profiling required |
| Local cold-preview LCP | ≤ 1.5 s | All pass |
| Field LCP / INP / CLS | ≤ 2.5 s / 200 ms / 0.1 at p75 | Unmeasured until a public candidate has traffic |
| Route shell readiness | semantic heading and links before enhancement; no indefinite loader | Automated functional tests pass |

## Required production follow-up

1. Run B and C on the audited Intel integrated GPU in a visible browser with a performance trace.
2. Test real iPhone Safari and ordinary Android Chrome hardware; emulation is not a substitute.
3. Profile the B/C start-up long tasks and texture uploads.
4. Measure trusted pointer/keyboard interactions and collect field INP only after a preview receives real use.
5. Re-run Lighthouse and runtime measurement on the selected architecture, direct routes, slow 4G, reduced motion, and static/no-WebGL states.
6. Tighten—not loosen—budgets once the first approved world and lowest supported device are known.

The production-preview browser suite now also records stable Three.js renderer resource counts over 20 route cycles. That structural cleanup check passed; it does not replace browser-process memory or physical-GPU profiling.

Run:

```powershell
npm.cmd run build
npm.cmd run measure:runtime
```
