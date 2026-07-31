# Decision log

## 2026-07-30 — Establish a Phase 1 direction lab

**Status:** Accepted  
**Decision:** Treat the current work as research, strategic exploration, isolated prototyping, and review tooling. Do not build the production portfolio before creative-direction approval.  
**Reason:** The governing metaphor, positioning, information architecture, and asset direction are hypotheses.

## 2026-07-30 — Preserve the legacy static concept

**Status:** Accepted  
**Decision:** Move the original nested static files intact to `references/legacy-v0/`.  
**Reason:** They are useful evidence of prior thinking but should not silently become the foundation or be destroyed.

## 2026-07-30 — Use npm for repository tooling

**Status:** Accepted  
**Decision:** Use npm with one lockfile.  
**Reason:** npm ships with the installed Node version; adding pnpm, Yarn, or Bun would not add Phase 1 value.

## 2026-07-30 — Use Vite only as the Phase 1 evidence shell

**Status:** Accepted for Phase 1 only  
**Decision:** Use a small React/Vite application to make the research, three isolated prototypes, fallbacks, and measurements reviewable at one local URL. Keep the final-site framework decision open.  
**Reason:** The direction lab needs fast, inspectable evidence without pre-committing the production portfolio to this stack.

## 2026-07-30 — Gate immersive directions behind measured budgets

**Status:** Accepted  
**Decision:** Treat SVG/DOM fracture as the current implementation-safe reference. Keep the hybrid and cinematic directions as evidence only until physical-device and integrated-GPU validation closes their measured performance gaps.  
**Reason:** Production-preview measurements show strong accessibility across all three directions, but the WebGL directions miss the current mobile performance threshold.

## 2026-07-30 — Make progressive enhancement contractual

**Status:** Accepted  
**Decision:** Preserve semantic DOM links as the authority for navigation, honor reduced-motion and graphics preferences, and provide static or SVG fallbacks for every canvas-led experience.  
**Reason:** The fictional-world concept must remain understandable and operable when animation, images, or WebGL are unavailable.

## Pending decisions

- Review-interface and final-site framework
- Principal WebGL architecture
- Hosting provider
- CMS strategy
- Positioning direction
- Governing concept and nexus model
- First asset world
