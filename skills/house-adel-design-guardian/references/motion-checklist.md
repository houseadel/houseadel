# Motion checklist

Approve motion only when it establishes hierarchy, changes spatial context, reveals material, introduces a project, explains a process, demonstrates a function, or provides meaningful feedback.

## Before integration

- Complete and review the static editorial layout first.
- Prototype one behavior in isolation and test it at desktop and mobile sizes.
- Define its purpose, trigger, duration, easing, interruption behavior, and static end state.
- Use the existing motion system; do not add overlapping animation libraries.

## Implementation

- Prefer the House Adel grammar: assembly, disassembly, uncovering, framing, folding, depth change, light movement, and typographic masking.
- Use GSAP contexts and clean up timelines, ScrollTriggers, listeners, and render loops.
- Use viewport-specific setups where composition or input changes.
- Keep native scrolling available and direct navigation immediately usable.
- Avoid excessive pin distances, chained reveal delays, and animation on every text block.
- Pause inactive render loops and rendering while the document is hidden.
- Cap canvas DPR and avoid mobile shadows or post-processing without measured benefit.
- Use WebGL only to change narrative or spatial understanding; keep content and navigation in semantic HTML.

## Resilience

- Under `prefers-reduced-motion`, remove camera travel and pinned scrubbing; use static states, instant changes, or brief crossfades.
- Provide a no-WebGL composition before the canvas loads and when it fails.
- Confirm rapid scrolling, resize, Back/Forward, route teardown, touch, keyboard, and tab visibility changes do not leave stale state.
- Never autoplay sound. If sound is added later, require an explicit choice and persistent mute control.
