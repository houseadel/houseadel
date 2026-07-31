---
name: house-adel-accessibility
description: Design, audit, and test accessible House Adel interfaces and immersive experiences. Use when working on semantic DOM equivalents, navigation, WebGL or motion-enhanced UI, keyboard and focus behavior, audio, contrast, touch input, reduced motion, no-WebGL or failed-asset fallbacks, or assistive-technology test results.
---

# House Adel Accessibility

## Map the equivalent experience

1. Read `AGENTS.md` and identify every essential destination, fact, control, status, and error.
2. Provide each essential destination as a real semantic link in the DOM. Treat canvas, shaders, sound, and motion as enhancements rather than the only interface.
3. Use native elements according to intent: links navigate, buttons act, headings form the document outline, and landmarks describe page regions.
4. Give non-text content an accurate text alternative, caption, transcript, adjacent explanation, or empty alt text when it is genuinely decorative.
5. Ensure no important information or action depends only on hover, pointer position, sound, animation, WebGL, custom cursor, color, or spatial location.

## Define input and focus behavior

- Preserve DOM order as the logical reading and focus order; do not use positive `tabindex`.
- Make every action operable by keyboard and touch, including menus, fragments, portals, carousels, media, and dismissible overlays.
- Show a persistent, high-contrast focus indicator and keep it visible above visual layers.
- Use touch targets of at least 44 by 44 CSS pixels and provide non-hover discovery on touch devices.
- Move focus deliberately after route changes, modal opening and closing, errors, and content replacement. Restore it to the invoking control when appropriate.
- Preserve direct routes, browser Back and Forward, interruption, and Escape behavior. Do not trap focus outside a true modal.
- Announce asynchronous status only when it is useful; avoid noisy live regions and duplicate spoken content.

## Provide resilient modes

Implement and test each mode independently:

- **Reduced motion:** honor `prefers-reduced-motion`; remove parallax, camera travel, spatial disorientation, flashing, and decorative loops; use an immediate state change or restrained opacity transition while preserving sequence and meaning.
- **No WebGL:** replace the canvas with a static visual or semantic layout while keeping all destinations and content available.
- **Failed asset or slow network:** show a stable placeholder, useful error state, and accessible path forward without layout or focus loss.
- **Audio off:** start nonessential sound silent, provide a visible persistent control, expose its state, and duplicate all meaning visually or textually.
- **Zoom and reflow:** preserve content and controls at browser zoom and narrow viewports without two-dimensional scrolling except where intrinsically necessary.

Use current WCAG AA criteria for normative judgments and cite the relevant criterion in audit findings. Verify text, large text, controls, focus indicators, and meaningful graphics against their applicable contrast requirements; do not judge contrast by eye.

## Test with multiple methods

Run automated checks, then manually test:

1. keyboard-only navigation from first focus to every destination;
2. reduced-motion and no-WebGL modes;
3. touch at mobile and tablet breakpoints;
4. zoom, reflow, forced colors, and text resizing;
5. at least one desktop screen-reader/browser pairing and one mobile screen reader when the environment permits;
6. loading, error, interrupted transition, direct-route, and Back/Forward flows.

Do not treat an automated scan as proof of accessibility. Record untested browser or assistive-technology combinations as coverage gaps.

## Report and enforce findings

For each issue, record severity, affected user, route and element, reproducible steps, expected behavior, actual behavior, applicable criterion, recommended correction, and retest status. Attach evidence where possible.

Block approval when an essential destination is unreachable, keyboard focus is lost or obscured, reduced motion retains harmful movement, audio cannot be controlled, contrast fails, or the fallback omits essential content. Retest the corrected behavior rather than closing findings from code inspection alone.
