---
name: house-adel-universe-system
description: Define, implement, or review House Adel's shared universe system, including invariant studio rules, world-specific freedoms, universe metadata, semantic route contracts, loading and cleanup lifecycles, and the process for adding a future universe. Use for nexus architecture, project-world registration, cross-universe navigation, route transitions, or universe lifecycle changes.
---

# House Adel Universe System

## Establish authority

- Read `AGENTS.md`, `docs/decision-log.md`, and any approved direction or architecture record before changing the system.
- Treat the multiverse, shattered-fragment nexus, governing concept, route map, and WebGL architecture as hypotheses while their decisions remain pending.
- Label Phase 1 implementations as disposable prototypes. Do not let a prototype silently become the production contract.
- Preserve **House Adel** as the studio name. Keep the studio's identity distinct from every client or project world.

## Separate invariants from world freedoms

Keep these rules constant across every universe:

- Expose every essential destination through a semantic URL and HTML link.
- Preserve direct entry, reload, deep links, browser Back and Forward, visible focus, and logical focus order.
- Use one shared navigation and transition protocol, one universe metadata contract, and one lifecycle state model.
- Provide desktop, tablet, mobile, reduced-motion, no-WebGL, slow-network, and failed-asset behavior.
- Preserve shared status, error, credits, provenance, analytics, and performance hooks.
- Keep touch targets at least 44 by 44 CSS pixels and never rely on hover, color, sound, motion, WebGL, or cursor state alone.
- Lazy-load world-specific code and assets; release resources when their owner exits.

Allow a world to change only when its approved brief supports the change:

- Typography, palette, composition, imagery, spatial model, interaction rhythm, motion dialect, sound, and rendering technique.
- Case-study structure and density when the project's story requires them.
- Mobile composition when a literal reduction would weaken the idea.

Do not implement universes as skins over an identical layout. Make each world a distinct authored reality connected by the shared House Adel system.

## Define universe metadata

Register each universe through one typed, serializable record. Include:

- Stable `id`, human title, canonical `slug`, route, status, and display order.
- Project summary, credits source, and links to its brief, visual bible, master frame, and asset provenance manifest.
- Lazy module entry point and optional scene identifier without importing the module into the initial bundle.
- Required asset groups, preload policy, loading placeholder, static poster, and failed-asset substitutions.
- Desktop, tablet, mobile, reduced-motion, and no-WebGL presentation choices.
- Quality-tier capabilities and measured asset, bundle, GPU-memory, and frame-time budgets.
- Enter, activate, deactivate, exit, and dispose hooks supported by the world.

Reject duplicate identifiers, invalid routes, missing fallbacks, unverified asset references, or metadata that imports eager world code. Keep marketing copy and large asset lists outside the registry.

## Enforce the route contract

Make the semantic document and router authoritative; treat WebGL and motion as progressive enhancement.

1. Resolve the target URL and render meaningful DOM content before visual enhancement succeeds.
2. Start preloading through a cancellable request owned by that navigation.
3. Run the exit and handoff only after the target can display either its intended entry state or its fallback.
4. Commit history exactly once for user navigation. Never create a second history entry when an animation completes.
5. Restore the target's focus intentionally after activation; preserve or reset scroll according to the documented route policy.
6. On reload or direct entry, initialize the requested world without requiring a nexus visit.
7. On Back or Forward, honor the browser's requested URL and reconcile any transition already in flight.

Use an explicit lifecycle such as `idle -> loading -> entering -> active -> exiting -> disposed`, with `fallback` and `error` branches. Make transitions idempotent. Let the latest valid navigation intent win; abort stale loads and reconcile the current visual state before continuing.

Never leave the page inert, focus-trapped, scroll-locked, or visually covered after cancellation or failure.

## Own loading and cleanup

- Show an immediate, world-appropriate placeholder; report progress only when it is real.
- Set timeouts and error boundaries for lazy modules, images, video, audio, models, shaders, and render targets.
- Fall back locally when one decorative asset fails. Escalate to the static world only when the enhanced experience cannot remain coherent.
- Assign a single owner to every listener, observer, timer, animation, request, media element, audio node, DOM portal, and WebGL allocation.
- Abort pending work, kill timelines, remove observers and listeners, pause media, release audio, and dispose owned WebGL resources on exit.
- Retain shared caches only through explicit reference counting or a documented application-lifetime owner.
- Verify repeated navigation does not multiply render loops, event handlers, DOM nodes, GPU resources, or history entries.

## Add a universe

1. Confirm the world supports an approved positioning and governing concept; otherwise mark it as an experiment.
2. Produce a world brief, visual bible, approved master frame, reference pack, provenance record, web exports, mobile alternative, loading placeholder, and static fallback.
3. Add valid metadata and a lazy entry module.
4. Implement the semantic route before enhanced rendering.
5. Implement lifecycle hooks and prove interruption and disposal.
6. Define quality tiers and measurable budgets with `house-adel-performance`.
7. Validate semantic and assistive alternatives with `house-adel-accessibility`.
8. Test direct entry, transitions, Back and Forward, failure modes, and leaks with `house-adel-qa`.
9. Record any material system decision in `docs/decision-log.md`.

Do not approve a new universe solely because its hero moment is impressive. Review its information value, mobile reinterpretation, fallback quality, maintenance cost, asset burden, and behavior after the first 30 seconds.
