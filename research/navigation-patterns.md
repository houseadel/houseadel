# Navigation patterns

**Status:** Phase 1 research synthesis, not an approved interaction model  
**Sources accessed:** 2026-07-30

## Reading key

- **Evidence** is directly supported by a cited primary source or an author-attributed case study.
- **Inference** is a deduction, not a claim about an undisclosed implementation.
- **Recommendation** is a provisional House Adel rule to validate in prototypes.

## Navigation contract

The visual navigator may change. The route contract should not:

- every essential destination is a real semantic link with a stable URL;
- direct route access renders meaningful content without entering through the homepage;
- browser Back and Forward reproduce intelligible states;
- keyboard, pointer, and touch reach the same destinations;
- current location is conveyed without relying on color, position, motion, or WebGL;
- interrupted transitions settle on either the prior route or the requested route; and
- a failed canvas, media request, or animation library does not remove navigation.

WCAG 2.2 requires keyboard-operable functionality, a logical focus order, and visible focus ([WCAG 2.2 — Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard), [Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order), [Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible)). House Adel additionally requires touch targets of at least 44 × 44 CSS pixels; this is deliberately stricter than WCAG 2.2 AA's 24 × 24 minimum or spacing exceptions ([W3C, Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)).

## Patterns worth testing

| Pattern | Strength | Failure mode | House Adel use |
| --- | --- | --- | --- |
| **Persistent compact navigation** | Keeps Work, About, and Contact predictable while the project world changes. | Can become an agency-template header if it is visually detached from the governing concept. | Treat it as House Adel identity infrastructure. Its placement may respond to a scene, but its labels and focus order remain stable. |
| **Spatial object plus link list** | Permits an authored nexus without hiding destinations inside canvas picking. | Duplicate interfaces can drift or expose different ordering. | Render both from one route/project data source. The DOM list is not a fallback afterthought; it is a first-class view. |
| **Index / explore toggle** | Supports fast comparison and slower discovery. | May resemble a view-style preference rather than an authored concept. | Preserve the selected project and URL while switching presentation; do not turn projects into “themes.” |
| **Contextual next/previous** | Creates a paced sequence inside a project set. | Relative links become confusing after filtering or direct entry. | Name the destination (“Next: Project title”), preserve a “All work” route, and define order centrally. |
| **Route-aware scene state** | A persistent canvas can acknowledge route changes without remounting the renderer. | Scene state can outrun URL state, particularly during rapid input. | Let the router own destination state. The scene renders route state; it does not invent a parallel navigation history. |
| **Command or menu overlay** | Can expose all destinations from any scene. | Focus traps, scroll leakage, and closing-history errors. | If tested, use a real dialog pattern, return focus to the invoker, close on Escape, and do not add a history entry unless the overlay itself is linkable content. |

## URL and history model

Recommended provisional public routes:

```text
/
/work
/work/:projectSlug
/about
/contact
```

Optional visual state such as `?view=index` may be encoded only when it is useful to share or restore. Camera coordinates, hover state, cursor state, and animation progress should not be URL state.

The emerging Navigation API can intercept and manage navigation, but browser support must be feature-detected; it cannot be the sole routing foundation ([MDN, Navigation API](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API), [MDN, NavigationTransition](https://developer.mozilla.org/en-US/docs/Web/API/NavigationTransition)). Framework routing and native links remain the dependable contract.

### Provisional transition ownership

1. A link expresses the destination URL.
2. The router resolves content and initiates any data or asset request.
3. A transition coordinator may delay the visual commit for a bounded exit.
4. The URL commits once the destination can render a meaningful shell.
5. Entry motion follows; focus and document title reflect the new route.
6. A second navigation aborts obsolete asset work and resolves to the newest valid route.

**Inference:** Making the URL commit depend on a long cinematic sequence increases the probability of stale history and broken interruption handling. This must be tested, not assumed from a reference site.

## Input equivalence

| Visual interaction | Equivalent essential control |
| --- | --- |
| Hover reveals a project | Project label and summary are present or available on focus/tap. |
| Drag rotates or scrubs the nexus | Previous/next controls and an index expose every project. |
| Wheel changes a scene | Native page scrolling still reaches content; buttons or links reproduce discrete changes. |
| Canvas object opens a project | An actual `<a href="/work/...">` is available in the DOM and in keyboard order. |
| Sound signals a change | Visible text/state and, where necessary, haptic-independent feedback. |
| Color identifies the current world | `aria-current`, a heading, label, or other non-color cue. |

## Focus after navigation

For a full document navigation, the browser supplies a new document context. For client-side routing:

- update the document title;
- move focus deliberately to the new page's main heading or main region when that helps orientation;
- do not steal focus when the user is still interacting with a persistent control;
- announce route changes with a tested live-region pattern if the router does not provide one;
- restore focus to the invoking control when a menu/dialog closes; and
- preserve visible focus through transition layers.

Astro's router documentation is useful comparative evidence: its client router includes a route announcer and warns that scripts and persisted elements have lifecycle consequences ([Astro, View Transitions](https://docs.astro.build/en/guides/view-transitions/)). That is evidence for requirements, not a recommendation to select Astro.

## Prototype checks

- Open every route directly with JavaScript disabled or delayed.
- Traverse the entire site using keyboard only; record focus order and current-route communication.
- Trigger three destinations rapidly; the last deliberate request should win without a blank screen.
- Navigate Back and Forward across project, index, overlay, and filtered states.
- Rotate a phone, resize across breakpoints, and repeat with a screen reader.
- Simulate a lost WebGL context and a failed project asset.
- Confirm every pointer-only spatial interaction has a visible non-spatial path.

## Sources

- W3C, WCAG 2.2: https://www.w3.org/TR/WCAG22/
- W3C, Understanding SC 2.1.1 Keyboard: https://www.w3.org/WAI/WCAG22/Understanding/keyboard
- W3C, Understanding SC 2.4.3 Focus Order: https://www.w3.org/WAI/WCAG22/Understanding/focus-order
- W3C, Understanding SC 2.4.7 Focus Visible: https://www.w3.org/WAI/WCAG22/Understanding/focus-visible
- W3C, Understanding SC 2.5.8 Target Size (Minimum): https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum
- MDN, Navigation API: https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API
- MDN, NavigationTransition: https://developer.mozilla.org/en-US/docs/Web/API/NavigationTransition
- Astro, View Transitions: https://docs.astro.build/en/guides/view-transitions/
- Codrops, author case study, “Letting the Creative Process Shape a WebGL Portfolio”: https://tympanus.net/codrops/2025/11/27/letting-the-creative-process-shape-a-webgl-portfolio/
