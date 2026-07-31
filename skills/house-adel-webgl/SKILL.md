---
name: house-adel-webgl
description: Design, implement, or audit House Adel's WebGL layer, including the persistent-canvas architecture, Three.js or React Three Fiber ownership rules, raycasting, materials, shaders, render targets, post-processing, quality tiers, resource disposal, context loss, and semantic fallbacks. Use for nexus prototypes, project-world scenes, portal transitions, GPU effects, or WebGL reliability work.
---

# House Adel WebGL

## Respect the architecture decision

- Read `AGENTS.md`, `docs/decision-log.md`, the approved route contract, and measured performance budgets first.
- Do not select or mix direct Three.js and React Three Fiber while the principal WebGL architecture is pending.
- Use one principal renderer architecture after the decision is accepted. Isolate Phase 1 alternatives in separate prototypes and label their status, strengths, and weaknesses.
- Keep semantic DOM content, links, focus, history, and loading status authoritative. Treat the canvas as progressive visual enhancement.
- Begin from an approved world brief and asset frame; do not substitute shader novelty for art direction.

## Own one rendering system

Prefer one application-owned canvas and renderer when persistent scenes or cross-route transitions justify them. Give the rendering system explicit owners for:

- Renderer and context.
- Scene and camera registry.
- Render loop and visibility state.
- Asset cache and reference counts.
- Raycasting and input projection.
- Composer, passes, render targets, and transition surfaces.
- Quality tier and device-pixel-ratio policy.
- Route lifecycle, context loss, diagnostics, and disposal.

Render only when visible or changing. Pause for hidden tabs, suspended routes, reduced motion, and static fallbacks. Resize from the canvas container with a debounced `ResizeObserver`; update cameras, targets, and DPR together.

If using direct Three.js, encapsulate every scene behind `mount`, `resize`, `update`, `deactivate`, and `dispose` boundaries. If using React Three Fiber, keep one `Canvas` owner, express scene ownership through mounted components, clean imperative effects in hooks, and do not create a second unmanaged render loop. Do not mix both ownership models for the same resources.

## Implement interaction through semantic parity

- Raycast only against an explicit interactive set; use coarse bounds or spatial indexing when the set grows.
- Normalize pointer coordinates from the canvas bounds, not the viewport.
- Throttle pointer movement to the render cadence and skip raycasting when input or the scene is inactive.
- Map each canvas target to a visible or programmatically associated semantic link or control.
- Mirror hover information through focus, touch, and persistent labels.
- Let DOM navigation activate the route; use raycasting only to express the same intent.
- Clear hover, capture, and pressed states on cancellation, pointer loss, resize, route exit, and context loss.

Never make project discovery, copy, or route access depend on pixel-perfect raycasting.

## Control materials and shaders

- Centralize shared materials and textures; clone only when per-instance mutation requires it.
- Declare color space, tone mapping, blending, transparency, depth, sidedness, and texture sampling deliberately.
- Bound uniforms and validate inputs to avoid NaN propagation, overdraw, and runaway loops.
- Compile critical shaders during a controlled loading phase and surface compile failure through diagnostics and a visual fallback.
- Provide simpler material or still-image alternatives for lower quality tiers.
- Record shader source, license or authorship, transformation notes, and production approval with the asset provenance system.

Treat transparency, refraction, transmission, and full-screen fragment work as expensive until measured. Reject effects that obscure legibility or only imitate glass, portals, particles, or generic AI spectacle.

## Bound render targets and post-processing

- Create render targets through one pool or owner and size them by quality tier.
- Use the smallest resolution, precision, depth, stencil, and sample count that preserves the intended result.
- Reuse transition targets and release their contents after the handoff.
- Keep the pass graph short; disable decorative passes on low tiers and when their contribution is not visible.
- Avoid nested composers, uncontrolled ping-pong buffers, and full-resolution targets for small effects.
- Reallocate targets only after meaningful size or tier changes.

Account for color, depth, mip levels, cubemaps, multisampling, history buffers, and duplicate transition scenes when estimating peak GPU memory.

## Establish measured quality tiers

Choose tiers from capability checks and measured frame time, not user-agent strings or a single benchmark.

- `static`: Skip WebGL and show the approved poster or DOM/SVG experience.
- `low`: Use capped DPR, simplified materials, reduced texture resolution, minimal post-processing, and no expensive secondary effects.
- `medium`: Enable the core approved effect within the recorded mobile or integrated-GPU budget.
- `high`: Add only measured improvements; cap DPR at the project's recorded ceiling.

Start conservatively and promote only after stable sampling. Downshift with hysteresis after sustained missed frames; do not oscillate tiers. Persist a user-selected lower-quality preference. Coordinate tier limits with `house-adel-performance`.

## Dispose without breaking shared assets

Assign every allocation to a scene, transition, cache, or application lifetime. On route exit:

- Abort outstanding loaders and ignore stale completions.
- Remove listeners, observers, controls, pointer capture, animation callbacks, and render-loop subscriptions.
- Dispose owned geometries, materials, textures, skeleton helpers, render targets, pass buffers, and media-backed textures.
- Pause and detach video or canvas texture sources.
- Release shared resources only when their reference count reaches zero.
- Clear scene references so garbage collection can reclaim JavaScript owners.

Dispose the renderer and force context loss only when the application-level canvas is permanently torn down, not on each route. Instrument renderer info, target counts, cache entries, and scene-owner counts before and after repeated transitions.

## Survive failure

- Feature-detect the required API and extensions before loading large scene assets.
- Display meaningful DOM content and the approved static fallback while loading or when initialization fails.
- Handle `webglcontextlost` without reloading the page; prevent default only when a tested restoration path exists.
- Rebuild resources from owned descriptors on restoration, or remain on the static fallback with a clear retry control.
- Substitute failed textures, models, videos, shaders, and environment maps without leaving a black or transparent void.
- Keep navigation usable during slow networks, tab suspension, and failed enhancement.

Validate cold load, resize, orientation change, tier changes, reduced motion, context loss and restoration, failed assets, route interruption, repeated navigation, and direct entry on desktop integrated graphics and ordinary mobile hardware.
