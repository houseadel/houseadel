---
name: house-adel-motion
description: Design, implement, or review House Adel's motion grammar and GSAP timelines, including easing and duration conventions, route and universe transitions, interruption, reverse navigation, reduced-motion behavior, and mobile adaptation. Use for nexus motion, project transitions, animated interface states, scroll choreography, or motion-system audits.
---

# House Adel Motion

## Establish the motion contract

- Read the approved concept, route contract, world brief, and `docs/decision-log.md` before animating.
- Treat unapproved Phase 1 motion as a labeled experiment, not a production convention.
- Give every motion a narrative or usability purpose: orient, reveal, connect, emphasize, confirm, or hand off.
- Preserve a shared House Adel grammar while letting each approved world express that grammar through its own material, space, typography, imagery, and rhythm.
- Avoid default spectacle: perpetual drift, gratuitous parallax, glitch, cursor trails, particle fields, and transitions that merely hide loading.
- A cursor companion is not a cursor trail: it is a single overlay that tracks the pointer 1:1 and changes state on hover intent, never leaves a decaying path, and never hides the native cursor. Parallax is not gratuitous when its depth is bounded, tied to real content layers, and flattened under reduced motion and on mobile per the adaptation rules below — treat unbounded or purely decorative depth as the thing being avoided, not depth itself.
- The liquid lens is not a cursor trail either, and the test for that is what it draws. A trail draws its own colour over the page and accumulates. The lens draws nothing of its own: it is a mask that says which pixels of the finished site invert, so the interior is House Adel in its other tonal state, the spectrum exists only in the pixel or two where the mask boundary separates per channel, and overlapping passes merge into one body. If the effect is legible with the site removed from underneath it, it has become a trail and is wrong.

Specify each sequence before implementation:

- Trigger, source state, destination state, and completion condition.
- What the viewer should understand and what remains operable during motion.
- Duration band, easing token, staging labels, and interrupt behavior.
- Desktop, touch, reduced-motion, slow-load, and failed-asset behavior.
- Focus, scroll, sound, WebGL, and semantic-DOM handoff.

## Use a compact timing grammar

Start with these bands, then adjust only from recorded interaction tests:

- `80-160ms`: press, hover, focus, and immediate acknowledgement.
- `160-280ms`: small interface state changes and local reveals.
- `280-600ms`: navigation, layout changes, and spatial reorientation.
- `600-1200ms`: authored route or world handoffs.
- `>1200ms` (signature only): reserved for the first-visit production loader's authored sequence. Must remain readiness-driven rather than fixed-duration, must be interruptible via a visible Skip control at any frame, must never block navigation or gate content behind itself, and must not repeat on a return visit.

Keep essential feedback immediate. Let destination content become readable before decorative settling finishes. Exceed 1200ms only when the approved concept earns the delay and interruption remains safe.

Use a small named easing set:

- Use an ease-out curve such as `power2.out` for arrival and direct manipulation release.
- Use a symmetric curve such as `power2.inOut` for spatial handoffs.
- Use an ease-in curve such as `power2.in` only for elements clearly leaving.
- Reserve custom curves, overshoot, spring, or elastic behavior for a documented world-specific material rule.

Do not use playful overshoot on focus, error, loading, or other essential states. Keep easing names centralized rather than scattering raw curves.

## Structure GSAP work

- Use GSAP for coordinated timelines and CSS transitions for simple independent state changes.
- Build paused timeline factories with explicit inputs and return cleanup controls.
- Add semantic labels such as `prepare`, `depart`, `handoff`, `reveal`, and `settle`; coordinate by labels instead of anonymous delays.
- Scope animations with `gsap.context()` or an equivalent owner and revert that context during cleanup.
- Animate compositor-friendly `transform` and `opacity` by default. Measure layout before a timeline and batch unavoidable reads and writes.
- Set initial states deliberately; do not depend on a previous route having run.
- Use `gsap.matchMedia()` or the application's central preference layer for motion and breakpoint variants.
- Kill tweens, timelines, delayed calls, observers, and callbacks when their owner exits.
- Keep visual timelines out of routing and business logic. Expose lifecycle promises or callbacks to the transition coordinator.

Do not add another animation library without an accepted decision explaining the need and cleanup model.

## Handle interruption and reverse navigation

- Model a transition as state, not as an uninterruptible clip.
- Accept an `AbortSignal` or equivalent cancellation channel for every route-level sequence.
- On a new intent, stop stale loads and callbacks, capture or normalize the current visual state, and continue toward the latest valid target.
- Commit the URL through the router exactly once; never derive browser history from timeline progress.
- Release overlays, `inert`, focus traps, pointer locks, and scroll locks in completion, cancellation, and error paths.
- Keep DOM and WebGL states synchronized through named handoff points rather than frame-by-frame coupling.

Reverse a timeline only when its state, focus, scroll, media, and asset lifecycle are genuinely symmetrical. Otherwise, implement a separate return sequence that shares the same state contract. Treat browser Back and Forward as authoritative navigation intents, not requests to play a decorative animation backward.

## Adapt motion accessibly

For `prefers-reduced-motion: reduce`:

- Remove camera travel, simulated depth, parallax, fracture, rapid scaling, looping ambience, and nonessential autoplay.
- Replace spatial transitions with an immediate state change or a short opacity transition.
- Preserve hierarchy, route context, loading status, completion signals, and focus movement.
- Avoid making users wait for a timeline whose visuals were removed.
- Keep the semantic destination available even if GSAP or WebGL fails.

For touch and mobile:

- Replace hover-only previews with focus, press, or visible controls.
- Shorten travel distances and reduce simultaneous layers before merely shortening duration.
- Avoid gestures that conflict with native scrolling or browser navigation.
- Respect safe areas, orientation changes, low-power conditions, and 44 by 44 CSS-pixel targets.
- Recompose cinematic motion for the smaller frame rather than cropping the desktop sequence.

Keep sound optional, user-controllable, and nonessential. Never autoplay audible media without consent; provide visible mute and state controls.

## Validate every sequence

- Test completion, cancellation, repeated rapid input, Back and Forward, reload, direct entry, resize, tab suspension, and asset failure.
- Test keyboard-only, touch, reduced-motion, and no-WebGL paths.
- Measure frame time and long tasks on integrated graphics and an ordinary mobile device.
- Confirm focus lands predictably, live content is not hidden from assistive technology, and no overlay survives failure.
- Document the sequence's purpose, timing tokens, variants, performance result, strengths, weaknesses, and prototype or approved status.
