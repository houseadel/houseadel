# Motion Specification

## Purpose

Motion expresses Ceremonial Spatial Editorialism through composed changes of structure and material. It is permitted only when it:

1. establishes hierarchy;
2. changes spatial context;
3. reveals material;
4. introduces a project;
5. explains a process;
6. demonstrates product function; or
7. provides meaningful feedback.

If an animation serves none of these purposes, remove it. Layout, typography, content, and static responsive states are resolved first.

## Grammar

The shared verbs are:

- **Assembly / disassembly:** separate parts form or release a legible whole.
- **Uncovering:** masks or layers reveal material as though paper, vellum, or an aperture moved.
- **Framing:** a line or edge establishes context before content enters.
- **Folding:** one plane changes state around a clear hinge; it is not ornamental origami.
- **Depth change:** restrained camera or layer movement changes the visitor's relationship to a composition.
- **Light movement:** a quiet shift reveals surface or hierarchy without glow effects.
- **Typographic masking:** type is disclosed by structure, never by a repeated generic fade-up.

The grammar remains consistent across routes. Each project may vary material and one configured microinteraction, not invent a new site-wide motion language.

## Timing and easing

- Feedback: approximately 120-220 ms.
- Navigation and local state changes: approximately 220-420 ms.
- Editorial reveals and material transitions: approximately 450-900 ms.
- Major spatial transitions: approximately 900-1600 ms only when the visitor controls progress or the movement establishes a new context.
- Stagger only related items, keep intervals restrained, and avoid delaying access to controls.
- Use a limited set of named eases shared through tokens. Prefer controlled acceleration/deceleration; reserve linear easing for scrubbed progress.

Durations are starting ranges, not permission to make the interface sluggish. A user action receives immediate visible feedback even when a larger transition continues.

## Implementation contract

- GSAP and ScrollTrigger coordinate timelines; CSS handles simple hover, focus, and local state changes.
- Every React animation uses a scoped GSAP context and reverts it on cleanup. Kill observers, animation frames, and route-specific triggers when their owner unmounts.
- Use native scrolling. Avoid smooth-scroll machinery unless a measured synchronization problem proves it necessary and the decision is documented.
- Create viewport-specific setups with `gsap.matchMedia()` or an equivalent owned abstraction.
- Scroll-scrubbed states are reversible, interruption-safe, and correct after rapid scrolling and resizing.
- Essential text, links, and controls remain semantic DOM overlays or siblings. Canvas never owns core information.
- Do not autoplay audio. Future sound requires an explicit entry choice and persistent mute control.

## Route choreography

### Home - spatial assembly

1. Render an ivory static composition immediately.
2. Lazy-load simple procedural planes, thin frames, translucent surfaces, restrained light, and only provenance-approved textures.
3. Replace the static visual only after the scene reports ready; keep DOM type and navigation stable.
4. Scroll aligns scattered elements and completes the House Adel mark.
5. The camera passes through one aperture, then the scene flattens into the editorial homepage.
6. Limit pinning to the distance needed to understand the transformation. Navigation remains available throughout.
7. Reduce movement substantially after the opening.

The canvas caps DPR by quality tier, pauses when offscreen or when the document is hidden, and avoids real-time shadows/post-processing on mobile. It is not loaded on unrelated routes.

### Editions - marker-mask reveal

Each editorial plate uses its own authored SVG path. ScrollTrigger advances path/mask progress to reveal a provenance-approved image or project-owned composition. Text remains static semantic HTML and never becomes illegible while the mask draws. Reduced motion shows the complete plate immediately.

### Edition detail - live demonstration

Motion responds to actual preview controls: device switch, personalisation, navigation, RSVP, language, and the Edition's single optional microinteraction. Feedback is immediate, focus is retained, and the preview does not trap keyboard or touch input.

### Private Commissions - atelier table

DOM, CSS transforms, and SVG reorganise the photograph fragment, map, date, handwritten line, paper sample, drawing, type, and measurement marks from source material into a coherent identity. The movement explains commissioning rather than simulating a decorative desktop. Limited WebGL is allowed only after a measured, documented need.

### Stories - fixed visual stage

Hover and keyboard focus on a row select the same visual and metadata state. The image may make one subtle depth movement. Focus does not move unexpectedly. Mobile uses tap and normal-flow visuals rather than a hover emulation or fixed obstruction.

### Story detail

Each Story receives at most one interaction selected through configuration: map path, print stack, light timeline, handwriting-to-type, invitation fold, or branching guest journey. All other sections use the shared editorial grammar.

### The House - drawn line

One continuous SVG path becomes underline, frame, connector, simplified plan, and part of the House Adel mark as the visitor moves through the page. Path progress follows scroll without obscuring text. Reduced motion renders the relevant complete line state in each section.

### Apply - living brief

Form completion assembles a live typographic brief card and advances a fixed progress rail. Motion connects an answer to its summary and provides validation/submission feedback; it does not turn the form into full-screen questions. Review remains directly editable.

## Responsive and reduced-motion behaviour

- Desktop may use restrained depth and short pinned context changes.
- Tablet reduces layer travel, overlap, and pin distance.
- Mobile receives a separately composed sequence with fewer planes, simpler masks, normal-flow project visuals, and no expensive post-processing.
- `prefers-reduced-motion: reduce` removes camera travel, prolonged scrub, parallax, and pinned sequences. Use complete static states, instant changes, or short crossfades while preserving all content and navigation.
- Reduced transparency and forced-colour modes prioritise legibility over material effects.
- A no-WebGL or failed-WebGL state uses the opening static composition and proceeds directly into editorial content without an error-shaped gap.

## Performance and verification

- First meaningful content renders before WebGL.
- Target LCP <= 2.5 seconds, INP <= 200 ms, CLS <= 0.1, at least 30 FPS on an ordinary mobile device, and 60 FPS on capable desktop.
- Pause inactive scenes and hidden-document rendering; cap DPR; load scene code and later assets progressively.
- Test keyboard, touch, rapid scroll, resize, Back/Forward, direct route entry, slow network, failed assets, reduced motion, and no WebGL.
- Inspect for orphaned ScrollTriggers, animation frames, canvases, and listeners after route changes.
- An interaction is accepted only when its purpose is identifiable, its static state is complete, its mobile and reduced-motion behaviour are designed, and it does not delay access to content.

## Prohibited patterns

No generic particle background, glowing grid, mouse trail, liquid or replacement cursor, rotating chrome object, decorative WebGL, constant ambient motion, repeated fade-up text, scroll hijacking, excessive glassmorphism, or unrelated collection of GSAP effects.
