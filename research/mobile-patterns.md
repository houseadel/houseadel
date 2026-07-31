# Mobile patterns

**Status:** Phase 1 research synthesis, not an approved responsive direction  
**Sources accessed:** 2026-07-30

## Reading key

- **Evidence** is supported by a cited primary source.
- **Inference** is a deduction, not a claim about a reference site's internal implementation.
- **Recommendation** is a House Adel hypothesis to test on hardware.

## Principle: reinterpret, do not miniaturize

Mobile is a distinct composition of the same idea. It should preserve:

- the proposition and project hierarchy;
- all destinations and case-study evidence;
- the relationship that gives the visual concept meaning; and
- House Adel's identity.

It may reduce:

- simultaneous project worlds;
- depth, layers, or particles;
- texture and video resolution;
- transition distance/duration;
- background activity; and
- input complexity.

It must replace hover, precision pointer, wide spatial comparison, and large-camera movement with touch-readable controls and deliberate crops.

## Pattern matrix

| Desktop behavior | Mobile reinterpretation | Static / constrained alternative |
| --- | --- | --- |
| Spatial nexus with several selectable objects | One focused project at a time, named previous/next controls, and visible index access | Art-directed poster plus project list |
| Hover preview | First tap/focus exposes the same label or activates a clearly labelled link; do not require a hidden second tap | Visible thumbnail, title, and summary |
| Drag-orbit navigation | Bounded horizontal scrub only if it does not conflict with page scroll; always provide buttons/index | Ordered links |
| Pointer parallax | Reduced amplitude or absent; never conveys information | Stable master frame |
| Full-viewport route transition | Shorter movement or direct cut that keeps the selected title | Immediate content commit |
| Large ambient loop | Poster first; opt-in or viewport-gated muted loop if it earns its cost | Poster and transcript/description as appropriate |
| Dense case-study mosaic | Curated single-column sequence with art-directed crops | Semantic figure/heading sequence |

## Touch and keyboard

House Adel's internal requirement is at least **44 × 44 CSS pixels** for touch targets. WCAG 2.2 AA's normative minimum is 24 × 24 CSS pixels with spacing/inline/essential exceptions; the House Adel rule is intentionally more generous ([W3C, Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)).

- Keep targets separated enough to avoid accidental activation.
- Do not place essential controls only at difficult screen edges.
- Support keyboard and switch access on tablet-sized layouts.
- Avoid custom gestures with no single-pointer equivalent. WCAG requires multipoint or path-based gestures to have a single-pointer alternative unless essential ([W3C, Pointer Gestures](https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures)).
- Do not trigger navigation on touch-down; allow cancellation before activation.

## Responsive imagery and art direction

The HTML responsive image model serves either:

- alternate resolutions of the same composition with `srcset` and `sizes`; or
- deliberately different crops/compositions with `<picture>` ([web.dev, “Responsive images”](https://web.dev/articles/responsive-images), [web.dev, “Learn Responsive Images”](https://web.dev/learn/design/responsive-images)).

For every production image:

- define an art-directed mobile alternative where the desktop focal point would be lost;
- include intrinsic width and height to reserve layout space;
- give content images accurate alternative text and decorative images empty alt text;
- avoid making a text-bearing image the only source of copy;
- generate measured breakpoints/formats through the asset pipeline; and
- keep a baseline format for browsers that do not accept the preferred one.

## Video and motion

- Prefer a poster until playback is requested or the media approaches the viewport.
- Use `muted`, `playsinline`, and no audio autoplay for decorative loops.
- Do not assume autoplay succeeds; render the poster as a complete state.
- Pause offscreen media and nonessential render loops.
- Provide playback controls for informational content and meet caption/audio-description needs.
- Under reduced motion, do not silently replace motion with another intense loop; use the chosen static composition.

Moving content that starts automatically and continues for more than five seconds alongside other content can require pause/stop/hide controls ([W3C, Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide)).

## Viewport, reflow, and safe areas

- Use content-driven breakpoints rather than device model lists.
- Verify 320 CSS-pixel-wide reflow without two-dimensional scrolling for ordinary content. WCAG's reflow understanding document describes the 320 CSS-pixel reference and exceptions for content requiring two-dimensional layout ([W3C, Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow)).
- Treat browser chrome and virtual keyboards as changing available height; avoid placing essential controls behind a fixed `100vh` assumption.
- Add safe-area padding only where full-bleed composition reaches notches/home indicators.
- Test both portrait and landscape, including route transitions while rotating.
- Case-study copy should remain selectable and zoomable.

## Mobile WebGL posture

Do not branch solely on a mobile user-agent string. Start conservatively and adapt from observed performance:

- cap device pixel ratio;
- use one active scene and dispose dormant world resources;
- prefer demand rendering for still states;
- avoid video textures and post-processing on the low tier;
- reduce geometry/material complexity before reducing semantic content;
- react to context loss with a static master frame; and
- never gate a project behind a successful GPU capability check.

`navigator.deviceMemory` is deliberately approximate and not available everywhere, so it is only an optional signal ([MDN, `Navigator.deviceMemory`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory)). Measured frame behavior should be the primary runtime input.

## Network and failure behavior

On a slow or metered connection:

1. HTML, navigation, project title, and a lightweight placeholder arrive first.
2. The selected still image follows.
3. Interaction code and the active world load only if needed.
4. Video, adjacent worlds, and high-quality variants remain optional.
5. A failed asset resolves to a designed fallback and never holds navigation open.

The Save-Data preference, when exposed, can inform a lower-media default but must be feature-detected ([MDN, `NetworkInformation.saveData`](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/saveData)).

## Hardware test set

The exact devices should be recorded with test results, not implied by simulator labels. Minimum classes:

- ordinary recent iPhone, Safari;
- an older supported iPhone class;
- mid-range Android, Chrome;
- low-memory/low-GPU Android if available;
- iPad/tablet in portrait and landscape;
- touch-enabled laptop; and
- desktop browser at a 320 CSS-pixel viewport with zoom.

For each, capture first usable content, input latency, frame pacing during the heaviest interaction, memory/context failures, thermal degradation over several minutes, orientation changes, and reduced-motion behavior.

## Rejection conditions

Reject a mobile direction if it:

- becomes a scaled desktop with illegible targets or crops;
- removes projects or essential case-study material;
- requires hover, device tilt, drag precision, landscape orientation, or autoplay;
- treats the static state as a generic placeholder unrelated to the visual idea;
- renders continuously while visually still;
- traps native vertical scrolling; or
- works only in an emulator.

## Sources

- W3C, Understanding SC 1.4.10 Reflow: https://www.w3.org/WAI/WCAG22/Understanding/reflow
- W3C, Understanding SC 2.5.1 Pointer Gestures: https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures
- W3C, Understanding SC 2.5.8 Target Size (Minimum): https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum
- W3C, Understanding SC 2.2.2 Pause, Stop, Hide: https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide
- web.dev, “Responsive images”: https://web.dev/articles/responsive-images
- web.dev, “Learn Responsive Images”: https://web.dev/learn/design/responsive-images
- MDN, `Navigator.deviceMemory`: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory
- MDN, `NetworkInformation.saveData`: https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/saveData
- React Three Fiber, “Scaling performance”: https://r3f.docs.pmnd.rs/advanced/scaling-performance
