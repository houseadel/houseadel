---
name: house-adel-qa
description: Plan, implement, and run House Adel quality assurance across functional behavior, Playwright end-to-end flows, visual regression, browsers and devices, route interruption and history, loading and WebGL failures, memory leaks, keyboard-only use, and reduced motion. Use when adding or reviewing routes, prototypes, transitions, fallbacks, responsive states, or release candidates.
---

# House Adel QA

## Build the test matrix

- Read `AGENTS.md`, route contracts, approved behavior, prototype notes, accessibility requirements, and performance budgets before writing tests.
- Distinguish disposable Phase 1 prototypes from production candidates while still testing every claim made in review materials.
- Map each essential destination and transition against desktop, tablet, mobile, reduced motion, no WebGL, slow network, failed asset, keyboard, and touch states.
- Record the expected semantic behavior first; treat WebGL, sound, hover, animation, and cursor behavior as enhancement.
- Add a regression test with every verified bug fix.

Cover at minimum:

- Current Chrome, Firefox, Edge, and Safari.
- iPhone Safari and an ordinary Android Chrome device.
- Desktop integrated graphics.
- Reduced-motion mode and low-power mode where practical.

Automate supported desktop engines and emulated breakpoints, then record physical-device checks for Safari, touch, GPU, thermal, and power behavior that emulation cannot prove. Never report an emulation result as a physical-device result.

## Layer the suite

- Use unit tests for pure registries, metadata validation, state reducers, asset selection, budget calculations, and cleanup helpers.
- Use integration tests for route coordinators, loaders, lifecycle ownership, error boundaries, and DOM-WebGL handoffs.
- Use Playwright for real navigation, history, focus, responsive behavior, failure injection, screenshots, and user-visible outcomes.
- Use physical-device sessions for mobile rendering, touch, low power, thermal throttling, and GPU stability.

Keep fixtures deterministic and local where possible. Do not make routine regression tests depend on mutable third-party sites or services.

## Write durable Playwright tests

- Locate elements by role, accessible name, label, or stable test identifier; avoid styling and DOM-structure selectors.
- Navigate through semantic links and assert the URL, meaningful heading, focus destination, and visible fallback or enhancement state.
- Wait for observable application states, responses, or events; never use arbitrary sleeps as correctness.
- Control motion, clock, network, viewport, DPR, locale, fonts, data, and randomness when the assertion requires determinism.
- Save traces, screenshots, videos, console errors, page errors, failed requests, and relevant performance marks on failure.
- Keep animation assertions about meaningful start, handoff, cancellation, and final states rather than exact intermediate frames.

Run visual regression only after fonts and deterministic assets are ready. Freeze or seek motion to named states, mask intentional nondeterminism, and maintain baselines per renderer, viewport, and DPR. Review diffs; do not raise thresholds merely to make noise disappear.

## Test routing and interruption

For every route:

1. Open it directly in a fresh context.
2. Reload it and verify meaningful content without a nexus visit.
3. Reach it through keyboard and pointer navigation.
4. Navigate away and return with Back and Forward.
5. Confirm URL, content, focus, title or metadata, scroll policy, and active world agree.

Interrupt route transitions with rapid repeated selection, a different destination, Back, Forward, resize, visibility change, and asset failure. Assert that:

- The latest valid navigation intent wins.
- History contains only intended entries.
- Stale loads and callbacks cannot reactivate the previous world.
- Overlays, `inert`, focus traps, pointer locks, and scroll locks are released.
- DOM and canvas settle on the same destination.
- The next navigation remains usable.

## Inject loading and rendering failures

- Throttle requests and delay code, images, video, audio, models, textures, and shader inputs independently.
- Abort navigation during preload and verify unnecessary work is canceled.
- Return network errors, invalid payloads, decode failures, and missing files for decorative and critical assets.
- Simulate unavailable WebGL, initialization failure, shader failure, and context loss.
- Verify prompt placeholders, accurate status, bounded waits, local substitutions, static fallbacks, retry behavior, and persistent semantic links.
- Test offline reload behavior only to the extent the application explicitly promises it.

Do not accept a blank canvas, endless loader, hidden route, console-error storm, or fallback that loses essential content.

## Test keyboard and motion preferences

- Traverse the page in logical order with keyboard only.
- Assert visible focus, no traps, usable skip or bypass behavior, and controls at least 44 by 44 CSS pixels.
- Operate every essential action without hover, drag, sound, animation, WebGL, custom cursor, or color alone.
- Verify focus moves intentionally after navigation and returns sensibly after dismissing overlays.
- Run the complete essential route flow with `prefers-reduced-motion: reduce`.
- Assert removal of camera travel, parallax, fracture, rapid scale, and nonessential loops without adding artificial delays.
- Check accessible names, roles, states, headings, landmarks, live status, contrast, zoom, and reflow with the dedicated accessibility workflow.

## Detect leaks

- Capture a stable baseline after initial load.
- Repeat representative enter, interrupt, exit, Back, and Forward cycles enough times to reveal a trend.
- Compare DOM nodes, listeners, observers, timers, animation-frame owners, GSAP timelines, media elements, cache entries, renderer info, render targets, GPU resources, and heap snapshots.
- Force garbage collection only in a controlled diagnostic run and label results that depend on it.
- Look for monotonic growth after the application returns to the same stable state; do not mistake a deliberate bounded cache for a leak.
- Fail the release when route-owned resources continue growing, duplicate render loops remain active, or stale scenes respond to input.

Coordinate byte, frame-time, GPU-memory, and Core Web Vitals thresholds with `house-adel-performance`.

## Report evidence

For each run, record:

- Build or commit, URL, browser, operating system, device, viewport, DPR, input mode, motion preference, network, power state, and date.
- Scenario, expected result, actual result, pass or fail, and whether the result is automated, emulated, or physical.
- Reproduction steps, severity, user impact, screenshot or trace, console or network evidence, and suspected owner for failures.
- Uncovered environments, flaky tests, blocked checks, and unresolved risks.

Treat broken semantic navigation, Back or Forward behavior, keyboard access, fallback availability, transition cleanup, or unbounded resource growth as release blockers. Do not conceal unresolved risks behind visual polish.
