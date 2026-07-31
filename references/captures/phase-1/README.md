# Phase 1 review captures

Captured locally with Playwright 1.62 and Chromium on 2026-07-30.

| Capture | Route | Emulation | Note |
| --- | --- | --- | --- |
| `fracture-desktop.png` | `/prototypes/fracture` | 1440 × 900 | Prototype A semantic fracture |
| `hybrid-fallback-desktop.png` | `/prototypes/hybrid` | 1440 × 900 | Headless Chromium lost its WebGL context; the designed A fallback is the evidence shown |
| `hybrid-desktop.png` | `/prototypes/hybrid` | 1440 × 900 | Live R3F/WebGL fragments after fallback-initialization logic was corrected |
| `cinematic-desktop.png` | `/prototypes/cinematic` | 1440 × 900 | Prototype C shader/still composition |
| `fracture-mobile.png` | `/prototypes/fracture` | Playwright iPhone 14 emulation | Mobile vertical re-composition |
| `hybrid-fallback-mobile.png` | `/prototypes/hybrid` | Playwright iPhone 14 emulation | Mobile fallback state |
| `hybrid-mobile.png` | `/prototypes/hybrid` | Playwright iPhone 14 emulation | Mobile R3F/WebGL re-composition |
| `cinematic-mobile.png` | `/prototypes/cinematic` | Playwright iPhone 14 emulation | Mobile cinematic composition |

These are inspection evidence, not brand assets or final visual direction. The optimized WebP derivatives used in the review UI are under `src/assets/review-captures/`.
