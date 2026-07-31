# Accessibility patterns

**Status:** Phase 1 research synthesis and test contract  
**Sources accessed:** 2026-07-30

## Baseline

Target WCAG 2.2 Level AA for the final public experience, while applying the stricter House Adel 44 × 44 CSS-pixel touch-target rule. Accessibility is part of each visual-world brief, master frame, transition test, and asset record; it is not a later overlay.

Primary standard: [W3C Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/).

## Essential-equivalence matrix

| If information/action appears through… | The experience also provides… |
| --- | --- |
| WebGL object or camera position | Semantic DOM heading, description, and link/action |
| Hover | The same information on focus and an understandable touch state |
| Drag/scrub/orbit | Named previous/next controls or an ordered index |
| Motion or transformation | Stable labels and state; reduced-motion version without spatial travel |
| Sound | Visible state; captions/transcript or textual equivalent when the sound carries meaning |
| Color/material/lighting | Text, icon shape, pattern, or programmatic state |
| Custom cursor | Ordinary pointer behavior and visible focus |
| Video | Poster/fallback; captions and other media alternatives as required by its content |

The equivalent should be part of the same experience and URL, not an undermaintained “accessible version.”

## Semantic foundation

- Use real landmarks, headings, lists, buttons, and links for their intended roles.
- Keep one clear page title and main heading per route.
- Preserve meaningful reading order without CSS positioning or canvas.
- Give each project a direct URL and descriptive link text.
- Use `aria-current` or visible text for current location.
- Use ARIA only when native HTML cannot express the control.
- Decorative canvases and images stay out of the accessibility tree; informative visuals receive a concise accessible name plus adjacent explanation.

## Keyboard, focus, and route changes

WCAG requires keyboard-operable functionality, logical focus order, and visible focus ([Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard), [Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order), [Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible)).

House Adel implementation rules:

- all essential actions work without pointer coordinates or timed gestures;
- focus indicators remain visible over video, canvas, masks, and transitions;
- opening a modal/menu moves focus into it; closing returns focus to its invoker;
- client-side route changes update the document title and provide tested orientation, usually by focusing the destination heading/main region or announcing the new page;
- transitions never place `inert`, `aria-hidden`, opacity, or a blocking layer on the wrong settled route;
- a skip link reaches main content; and
- keyboard users can bypass a spatial nexus and repeated navigation.

## Motion

`prefers-reduced-motion: reduce` should:

- remove parallax, camera travel, depth zoom, cursor-following motion, and nonessential loops;
- replace long route sequences with a direct cut or brief non-spatial change;
- keep state and content changes perceptible;
- stop scrub-to-read interactions from being required; and
- apply on initial load and when the preference changes.

WCAG 2.2 includes guidance for disabling nonessential interaction-triggered motion ([W3C, Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)). Automatically moving content may also need pause, stop, or hide controls ([W3C, Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide)).

Reduced motion is not synonymous with no animation; it is a content-preserving alternative that avoids motion triggers and forced spatial travel.

## Audio

- Do not autoplay audible sound.
- Make ambient sound opt-in, visibly state its status, and persist the user's choice only as a convenience.
- Give mute/pause controls accessible names and at least 44 × 44 CSS-pixel targets.
- If audio plays automatically for more than three seconds, WCAG requires a mechanism to pause/stop it or control volume independently ([W3C, Audio Control](https://www.w3.org/WAI/WCAG22/Understanding/audio-control)).
- Provide captions for synchronized speech and meaningful sound as applicable, and a transcript where it provides equivalent access.
- Never make an audio cue the only sign that navigation or loading completed.

## Color, contrast, and imagery

- Normal text meets 4.5:1 and large text 3:1 under WCAG AA conditions.
- UI components, state indicators, and meaningful graphical objects meet 3:1 against adjacent colors where SC 1.4.11 applies ([W3C, Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast)).
- Validate contrast in every moving frame or provide a stable backing surface; a compliant still frame is not enough if live media passes behind text.
- Do not bake essential copy into raster/video assets.
- Alternative text describes purpose in context, not visual style inventories.
- Complex visual systems receive nearby explanation or structured case-study content.

## Target size and gestures

WCAG 2.2 AA specifies a 24 × 24 CSS-pixel minimum with defined exceptions. House Adel adopts **44 × 44 CSS pixels** as the internal floor for interactive targets ([W3C, Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)).

Path-based or multipoint gestures need a single-pointer alternative unless essential ([W3C, Pointer Gestures](https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures)). Therefore every drag, orbit, or scrub used by a nexus prototype needs discrete controls or an index.

## Resilience states

Every route/world must specify:

| Condition | Required state |
| --- | --- |
| No WebGL | Static master frame or poster plus full semantic content/navigation |
| Lost WebGL context | Stop rendering, reveal the static state, attempt bounded recovery without removing content |
| Reduced motion | No essential spatial travel or scrub-to-read dependency |
| Slow network | Meaningful HTML shell, reserved media space, honest loading status |
| Failed image/video/model | Designed fallback with relevant text and working links |
| CSS disabled/delayed | Source order and native elements remain understandable |
| JavaScript failed/delayed | Public routes expose meaningful pre-rendered/static content |
| High zoom / narrow viewport | Reflow without loss of content or ordinary two-dimensional scrolling |
| Sound unavailable/muted | No missing state or instruction |

## Testing protocol

Automated checks find only a subset of issues. Use both automated and human testing.

### Every prototype iteration

- semantic/ARIA audit;
- keyboard-only full journey;
- 200% and 400% zoom/reflow checks;
- reduced-motion, forced-colors/high-contrast where supported, and color-contrast checks;
- no-WebGL, failed-media, and slow-network states;
- focus behavior under rapid navigation and transition cancellation; and
- touch-target measurement.

### Milestone review

- current VoiceOver/Safari on iOS and macOS;
- current TalkBack/Chrome on Android;
- current NVDA/Firefox or Chrome on Windows;
- real keyboard and touch devices;
- captions/transcripts and alternative-text editorial review;
- user testing with disabled participants when scope permits; and
- manual WCAG 2.2 AA conformance record with known exceptions and owners.

Browser/assistive-technology versions and device models must be recorded with the result because behavior changes over time.

## Prototype rejection conditions

Reject or revise a direction if:

- DOM content is merely a hidden dump unrelated to canvas state;
- a destination exists only as a canvas hit target;
- reduced motion removes context or project access;
- focus disappears under transition media;
- auto-playing sound or motion cannot be stopped;
- the design depends on color, hover, cursor, or drag alone;
- a “fallback” uses a generic image unrelated to the governing concept; or
- accessibility depends on a separate route that is not kept equivalent.

## Sources

- W3C, WCAG 2.2: https://www.w3.org/TR/WCAG22/
- W3C, Understanding WCAG 2.2: https://www.w3.org/WAI/WCAG22/Understanding/
- W3C, Keyboard: https://www.w3.org/WAI/WCAG22/Understanding/keyboard
- W3C, Focus Order: https://www.w3.org/WAI/WCAG22/Understanding/focus-order
- W3C, Focus Visible: https://www.w3.org/WAI/WCAG22/Understanding/focus-visible
- W3C, Animation from Interactions: https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions
- W3C, Pause, Stop, Hide: https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide
- W3C, Audio Control: https://www.w3.org/WAI/WCAG22/Understanding/audio-control
- W3C, Non-text Contrast: https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast
- W3C, Target Size (Minimum): https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum
- W3C, Pointer Gestures: https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures
- W3C, Reflow: https://www.w3.org/WAI/WCAG22/Understanding/reflow
- MDN, `webglcontextlost`: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextlost_event
