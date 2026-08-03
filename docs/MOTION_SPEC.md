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

- GSAP and ScrollTrigger coordinate timelines; CSS handles simple hover, focus, and local state changes. Editorial-route motion is dynamically imported through `src/lib/deferredMotion.ts`; the homepage timeline is requested only after scroll, wheel, touch, or keyboard intent, with a 12-second quiet fallback. Neither path puts GSAP in a route's critical static render.
- Every React animation uses a scoped GSAP context and reverts it on cleanup. Viewport-specific route motions also use `gsap.matchMedia()`. Observers, animation frames, pointer listeners, media listeners, and route-specific triggers are removed when their owner unmounts.
- Use native scrolling. Avoid smooth-scroll machinery unless a measured synchronization problem proves it necessary and the decision is documented.
- Create viewport-specific setups with `gsap.matchMedia()` or an equivalent owned abstraction.
- Scroll-scrubbed states are reversible, interruption-safe, and correct after rapid scrolling and resizing.
- Essential text, links, and controls remain semantic DOM overlays or siblings. Canvas never owns core information.
- Do not autoplay audio. Future sound requires an explicit entry choice and persistent mute control.

## Route choreography

### Home - spatial assembly

1. Render the complete ivory CSS/SVG master composition immediately.
2. Keep the stage sticky for a short 142svh desktop/126svh mobile passage while native scroll remains in control.
3. Request the route-local WebGL enhancement after pointer, touch, wheel, or keyboard intent, with a 12-second quiet fallback. The scene contains simple procedural planes, thin frames, translucent surfaces, and restrained light; version one has no texture, image, video, or model payload.
4. Replace only the spatial layer after the scene reports ready; keep DOM type, navigation, and layout stable.
5. Scroll aligns the planes and expands one garnet aperture. The same progress value drives the DOM fallback and procedural scene, so the motion reverses when the visitor scrolls upward.
6. Let the camera impression pass through the aperture, then flatten into the editorial homepage. Navigation remains available throughout.
7. Reduce movement substantially after the opening.

The canvas uses `frameloop="demand"`, caps DPR at 1.5 desktop/1.15 mobile, pauses when offscreen or when the document is hidden, and uses no real-time shadows or post-processing. Its approximately 231 KiB gzip runtime is not loaded on unrelated routes. Reduced motion, forced colours, Save-Data, an explicit fallback preference, failed WebGL, or an unavailable graphics context retains the complete static composition and creates no dependent reading state.

### Editions - marker-mask reveal

Each editorial plate uses its own project-owned SVG drawing and authored reveal path. ScrollTrigger advances the wide path inside an SVG mask while the drawing settles into register. Text remains static semantic HTML and never becomes illegible while the mask draws. Reduced motion and forced colours show the complete plate immediately.

### Edition detail - live demonstration

Motion responds to actual preview controls: device switch, personalisation, navigation, RSVP, language, and the Edition's single optional microinteraction. Feedback is immediate, focus is retained, and the preview does not trap keyboard or touch input.

### Private Commissions - atelier table

DOM, CSS transforms, and project-owned SVG reorganise an abstract light field, unlocated map, unspecified date, handwriting line, paper sample, plan, type fragment, and measurement marks from source material into a coherent identity. The route and measurement line draw as the parts settle. The movement explains commissioning rather than simulating a decorative desktop, and no WebGL or acquired image is used.

### Stories - fixed visual stage

Hover and keyboard focus on a row select the same project-owned visual plate and metadata state. A short, deferred depth/register transition introduces the selected Story without moving focus. Mobile renders every plate in normal flow rather than emulating hover or keeping a fixed obstruction.

### Story detail

Each Story receives one configured code-native interaction plate selected from the approved registry: aperture sequence, letter fold, map path, or light register. The configuration selects semantic labels and authored geometry; it cannot execute arbitrary CMS code. All other sections use the shared editorial grammar.

### The House - drawn line

One continuous project-owned SVG path moves between underline, frame, connector, simplified plan, and the House Adel mark as the visitor moves through the page. Stroke progress follows scroll without obscuring text. Reduced motion renders the complete line immediately.

### Apply - living brief

Form completion assembles the six-part typographic brief card and advances the fixed progress rail. The brief rule and corner respond only when the completion state changes; they do not animate on every keystroke. Validation, review, edit, provider error, and accepted-submission feedback remain semantic and directly operable.

## Responsive and reduced-motion behaviour

- Desktop may use restrained depth and short pinned context changes.
- Tablet reduces layer travel, overlap, and pin distance.
- Mobile receives fewer planes, shorter travel, simpler masks, normal-flow Story visuals, an initially selected mobile Edition preview, and no post-processing.
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

Final local evidence: all seven runtime budgets pass; Home desktop/mobile measure 490 KiB with LCP 184/172 ms and frame p95 16.8/16.8 ms. Lighthouse LCP is 2,111 ms Home, 2,130 ms Editions, 2,005 ms Private Commissions, and 2,299 ms Apply, with accessibility 100, best practices 100, and CLS 0 on every measured route. The cross-engine production suite passes 133 tests with no failure, and the accessibility suite passes 93 with no failure.

Local fonts use `font-display: optional` without preload so motion and first paint do not wait for typography. The visual-regression and screenshot harnesses explicitly warm the local font faces before comparison. Windows Playwright WebKit skips a small set of unreliable keyboard-harness cases; equivalent keyboard flows pass in Chromium, Firefox, and Edge, while physical Safari/VoiceOver remains a launch check.

## Prohibited patterns

No generic particle background, glowing grid, mouse trail, liquid or replacement cursor, rotating chrome object, decorative WebGL, constant ambient motion, repeated fade-up text, scroll hijacking, excessive glassmorphism, or unrelated collection of GSAP effects.
