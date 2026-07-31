# WebGL patterns

**Status:** Phase 1 research synthesis, not an approval to use WebGL  
**Sources accessed:** 2026-07-30

## Reading key

- **Evidence** is supported by a cited primary source or clearly attributed author case study.
- **Inference** is a deduction, not a claim about an undisclosed renderer or shader.
- **Recommendation** is a House Adel prototype hypothesis.

## First decision: does the idea require a real-time canvas?

Use WebGL only when at least one tested requirement needs:

- continuous spatial relationships that cannot be communicated by an art-directed static/composited frame;
- scene-dependent lighting, geometry, or camera response;
- a material transformation that remains coherent across routes; or
- interaction whose meaning depends on real-time depth.

A filmed loop, image sequence, CSS mask, SVG, or still master frame is preferable when it communicates the idea with lower failure risk. “Looks dimensional” is not enough.

## Principal architecture hypothesis

If approved later, use one principal renderer and one canvas rooted above route content. Project worlds become lazy scene modules; semantic page content and destination links remain in the DOM. Do not run independent renderers per route.

```text
application shell
├── House Adel identity + semantic navigation (DOM)
├── route content / case study (DOM)
├── persistent canvas
│   ├── shared camera, renderer, quality manager
│   ├── nexus scene (lazy)
│   ├── project-world scene (lazy, at most adjacent/active)
│   └── transition compositor (only if concept requires it)
└── static poster / no-WebGL path
```

This is a technical option, not approval of the multiverse or shattered-fragment concept. Framework and renderer choices remain provisional in [Architecture options](../docs/architecture-options.md).

## Patterns and constraints

### 1. DOM owns meaning; canvas owns enhancement

- Project title, summary, credits, route links, contact details, and current location stay semantic.
- A canvas object may mirror a link but does not replace it.
- Decorative canvas is hidden from the accessibility tree; an informational canvas receives a concise accessible name plus a DOM equivalent.
- Hit areas have visible focus/touch equivalents outside the canvas.

### 2. Persist the renderer, replace bounded scene modules

A persistent renderer can avoid repeated context creation and preserve a transition surface, but it also makes leaks survive across the entire visit. Scene activation needs a strict lifecycle:

```text
load -> prepare -> activate -> suspend -> dispose
```

Three.js documents that removing an object from a scene does not free geometry, material, texture, or render-target GPU resources; applications must call the relevant `dispose()` methods ([Three.js, “How to dispose of objects”](https://threejs.org/manual/en/how-to-dispose-of-objects.html)). The renderer's `info` property can help inspect resource counts, with caveats about internal caches ([Three.js, WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html)).

### 3. Render on demand when the scene is quiet

Static or event-driven scenes should stop drawing when nothing changes. React Three Fiber documents a `frameloop="demand"` mode and explicit invalidation; its performance monitor can step quality up or down ([R3F, “Scaling performance”](https://r3f.docs.pmnd.rs/advanced/scaling-performance)). Direct Three.js can implement the same policy with its own invalidation scheduler.

**Inference:** A portfolio tab that renders at display refresh indefinitely consumes power without improving a still state. Validate power and frame behavior on actual mobile hardware.

### 4. Quality is a ladder, not a device-name branch

Potential signals include measured frame time, viewport area, device pixel ratio, reduced motion, Save-Data, and observed context failure. `navigator.deviceMemory` is not universally available and intentionally coarse, so it can only be an optional hint ([MDN, `Navigator.deviceMemory`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory)).

Provisional tiers:

| Tier | Rendering posture | Content posture |
| --- | --- | --- |
| Static | No renderer or context failure | Master poster, semantic links, still project frames |
| Low | Capped DPR, simplified materials, no post-processing, demand loop | One active scene; no background video texture |
| Standard | Capped DPR, bounded effects, demand/adaptive loop | Active plus one prepared transition asset |
| High | Optional richer material/effect after sustained performance | Never unlocks additional content or destinations |

Three.js exposes `setPixelRatio()` and render-target controls, but an application must still select a cap and test memory/fill cost ([Three.js, WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html)).

### 5. Render targets need a conceptual reason

Offscreen buffers enable crossfades, masks, feedback, and compositing. They also multiply texture memory and fill work. Use the smallest necessary resolution, dispose targets on teardown, and avoid keeping every project world live.

Author case studies describe:

- a ping-pong render-target approach with only active pages retained ([Codrops, Ronin161](https://tympanus.net/codrops/2024/02/20/case-study-ronin161s-portfolio-2024/));
- a WebGL overlay/circle reveal between states ([Codrops, Studiogusto](https://tympanus.net/codrops/2023/04/25/case-study-studiogusto/)); and
- a planes-only WebGL approach in a custom portfolio system ([Codrops, Design Embraced](https://tympanus.net/codrops/2024/03/21/case-study-design-embraced-portfolio-2024/)).

These are implementation disclosures by case-study authors. They are not evidence that the visible reference can only be built that way and not a reason to copy the techniques.

### 6. Context loss is a normal failure case

Listen for `webglcontextlost`, prevent default only when attempting restoration, stop rendering, and show the static state. If restoration succeeds, rebuild resources from retained CPU/source data; otherwise keep the fallback ([MDN, `webglcontextlost`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextlost_event)).

### 7. Assets are web exports, not raw production files

- Compress geometry after topology and silhouette review.
- Use web texture dimensions/formats selected from measured device support and visual review.
- Avoid video textures for information-bearing content.
- Store a poster and meaningful alt/adjacent description for every production visual.
- Keep raw masters separate from optimized exports and track provenance.

See [Asset-production patterns](asset-production-patterns.md) for the proposed deterministic boundary.

## Direct Three.js versus React Three Fiber

| Consideration | Direct Three.js | React Three Fiber |
| --- | --- | --- |
| Scene authoring | Explicit imperative ownership; minimal abstraction. | Declarative React renderer for Three.js with reusable component ecosystem ([R3F repository](https://github.com/pmndrs/react-three-fiber)). |
| Lifecycle | Full control, but House Adel must implement resource ownership and cleanup conventions. | React mount/unmount helps structure ownership, but disposal and external resources still need review. |
| Render loop | Custom invalidation and quality logic. | Canvas, demand frameloop, fallback, and performance helpers are documented ([R3F Canvas](https://r3f.docs.pmnd.rs/api/canvas), [Scaling performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance)). |
| Custom compositor/shaders | Direct access and fewer framework assumptions. | Still exposes Three primitives; advanced render graphs may require escaping abstraction. |
| React integration | Manual bridges for state and lifecycle. | Native fit when the surrounding shell is React. |
| Risk | Ad-hoc imperative scene code grows difficult to coordinate. | React re-renders or component churn can be mistaken for GPU lifecycle; ecosystem helpers can inflate scope. |

**Provisional recommendation:** Carry React Three Fiber as the leading integration hypothesis if the application shell remains React and scenes are componentized project modules. Build one representative transition in direct Three.js and R3F before recording the decision. Select direct Three.js if the approved concept reduces to one tightly controlled compositor with little React-scene composition. Neither choice is a creative-direction choice.

The R3F maintainers state that their renderer has no overhead and can outperform React in some scaling scenarios ([R3F repository](https://github.com/pmndrs/react-three-fiber)). Treat that as a maintainer claim; benchmark House Adel's actual scene on target devices.

## Prototype acceptance evidence

Before any WebGL direction can advance:

- a static master frame demonstrates the idea before effects;
- the same content and links work with WebGL disabled;
- reduced motion removes nonessential spatial movement;
- a route-cycle test shows stable geometry, texture, program, and render-target counts;
- a context-loss test settles into and, when possible, recovers from a static fallback;
- ordinary integrated graphics and representative mobile devices meet measured frame and memory envelopes;
- slow network reveals a meaningful poster/shell rather than a blank canvas;
- project-specific code/assets load only when relevant; and
- reviewers can state what the real-time layer communicates.

## Sources

- Three.js, “Cleanup”: https://threejs.org/manual/en/cleanup.html
- Three.js, “How to dispose of objects”: https://threejs.org/manual/en/how-to-dispose-of-objects.html
- Three.js, WebGLRenderer: https://threejs.org/docs/pages/WebGLRenderer.html
- React Three Fiber, repository: https://github.com/pmndrs/react-three-fiber
- React Three Fiber, Canvas API: https://r3f.docs.pmnd.rs/api/canvas
- React Three Fiber, “Scaling performance”: https://r3f.docs.pmnd.rs/advanced/scaling-performance
- MDN, `webglcontextlost`: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextlost_event
- MDN, `Navigator.deviceMemory`: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory
- Codrops, author case study, “Ronin161's Portfolio 2024”: https://tympanus.net/codrops/2024/02/20/case-study-ronin161s-portfolio-2024/
- Codrops, author case study, “Studiogusto”: https://tympanus.net/codrops/2023/04/25/case-study-studiogusto/
- Codrops, author case study, “Design Embraced Portfolio 2024”: https://tympanus.net/codrops/2024/03/21/case-study-design-embraced-portfolio-2024/
