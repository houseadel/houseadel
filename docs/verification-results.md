# Phase 1 verification results

**Status:** Automated Phase 1 verification complete  
**Run:** 2026-07-31, Asia/Jakarta  
**Target:** Fresh Vite production build and production preview

## Automated result

| Check | Result |
| --- | --- |
| TypeScript and production build | Pass |
| Unit tests | 2 passed |
| Functional, resilience, accessibility, and responsive browser matrix | 118 passed, 0 failed, 22 intentional project-gated skips |
| Visual regression | 7 passed, 7 intentional cross-project skips |
| Back and Forward history verification | 7 of 7 browser projects passed |
| Renderer lifecycle | Stable Three.js resource counts through 20 route cycles in canonical Chromium |
| Dependency audit | 0 known vulnerabilities |
| Repository structure | Pass |
| Asset manifest | 0 errors, 0 warnings |
| Asset references | No missing or orphaned files |
| Duplicate asset scan | No duplicates |

The non-visual matrix covered bundled Chromium, Firefox, WebKit, installed Microsoft Edge, Pixel 7 emulation, iPhone 14 emulation, and an explicit reduced-motion project. It exercised deep links, Back/Forward, cold lazy-route focus, interrupted transitions, slow imagery, failed imagery, WebGL failure, semantic fallbacks, keyboard focus, axe checks, 44 × 44 touch targets, mobile recomposition, and renderer cleanup.

The 22 skips are intentional project gates: the 20-cycle renderer trace runs only in canonical Chromium; the mobile composition and touch-target checks run only in mobile projects; the reduced-motion timing check runs only in the reduced-motion project.

## Visual evidence

Seven Windows/Chromium baselines are tracked under `tests/visual.spec.ts-snapshots/`: the review hero, three desktop prototype states, and three mobile prototype states. B and C use explicit no-WebGL mode for deterministic regression images. Separate live-WebGL desktop/mobile captures are retained under `references/captures/phase-1/`, while functional and renderer tests exercise the actual canvases.

## Performance result

The current measured records are:

- `docs/performance-results.json` — cold production-preview runtime traces;
- `docs/lighthouse-summary.json` — Lighthouse 13.4.1 mobile simulation; and
- `docs/performance-baseline.md` — interpretation and provisional budgets.

Latest Lighthouse performance/accessibility scores are:

| Route | Performance | Accessibility |
| --- | ---:| ---:|
| Review home | 98 | 100 |
| A — SVG/DOM fracture | 95 | 100 |
| B — Hybrid WebGL | 64 | 100 |
| C — Cinematic compositing | 58 | 100 |

A is the only prototype that clears every current automated performance guardrail. B and C remain visual/technical hypotheses and are not production recommendations.

## Required physical validation

Automation and emulation do not close these production gates:

- current Google Chrome on a separate installation;
- physical iPhone Safari;
- ordinary physical Android Chrome;
- visible-browser profiling on integrated graphics;
- low-power/battery mode;
- assistive-technology spot checks; and
- field Core Web Vitals, especially INP.

Those checks belong to the selected production candidate. Their absence is stated here rather than converted into a fabricated pass.
