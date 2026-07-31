# House Adel — Phase 1 Direction Lab

This repository is the evidence and prototyping environment for House Adel, an independent studio for focused, art-directed digital experiences.

Phase 1 does **not** produce the final portfolio. It produces:

- cited portfolio and market research;
- positioning and experience-architecture options;
- an objective multiverse evaluation;
- three distinct nexus prototypes;
- mobile, reduced-motion, and no-WebGL behavior;
- a local visual review interface;
- capability, asset, performance, and accessibility systems;
- a clear set of decisions for the creative director.

The previous static concept is preserved in `references/legacy-v0/`.

## Status

Phase 1 is ready for creative-direction review. See [docs/execution-plan.md](docs/execution-plan.md), [research/conclusions.md](research/conclusions.md), [docs/performance-baseline.md](docs/performance-baseline.md), and [docs/verification-results.md](docs/verification-results.md). No production direction has been approved.

## Development

Node.js 22 or newer is required; the audited machine currently uses Node.js 24.

```powershell
npm.cmd install
npm.cmd run dev
```

Open <http://127.0.0.1:5173/>. The final handoff preview uses port `4173`:

```powershell
npm.cmd run build
npm.cmd run preview
```

## Verification

```powershell
npm.cmd test
npm.cmd run test:e2e
npm.cmd run audit:structure
npm.cmd run audit:dependencies
npm.cmd run audit:assets
npm.cmd run measure:runtime
npm.cmd run audit:lighthouse
```

Playwright browser binaries must be installed once with `npx.cmd playwright install`. Asset command help is available from every script under `scripts/`.

Playwright builds and serves a fresh production preview before browser runs. Visual baselines intentionally use the deterministic no-WebGL states for B and C; separate live-canvas captures and renderer lifecycle tests preserve WebGL evidence.

The prototype routes are:

- `/prototypes/fracture`
- `/prototypes/hybrid`
- `/prototypes/cinematic`

Use the visible review controls to compare system/full/reduced motion and WebGL/no-WebGL modes.

## Phase gate

No final production site should be built until the creative director approves the strategic direction, governing concept, experience architecture, nexus model, and initial asset world.
