# Nexus prototype briefs

Status: implemented Phase 1 comparison briefs; none is an approved final direction  
Measured evidence: [`performance-baseline.md`](performance-baseline.md) and the three records under [`../prototypes/`](../prototypes/)

## Shared content

All prototypes use the same three fictional, clearly labeled studies so the comparison tests the interaction system rather than content advantage:

| Study | Type | World cue |
|---|---|---|
| Afterlight | Artist-release microsite | Ink chamber, silver acoustic form, cobalt field |
| The Listening Garden | Cultural exhibition site | Mineral garden, translucent petals, copper listening instruments |
| Room No. 8 | Intimate hospitality launch | Stone dining room, oxblood fabric, blue-hour garden |

The images are unapproved generated prototype candidates recorded in `references/masters/prototype-worlds/manifest.json`.

## Shared interaction contract

- The House Adel name, one-sentence studio description, Work index, and Contact remain visible or one standard activation away.
- Every destination is a semantic link with an accessible name.
- Focus, hover, and pointer state produce equivalent visual selection.
- A selection commits to a real URL; the user can copy it, reload it, and use Back/Forward.
- An in-progress transition can be superseded without trapping input or focus.
- Reduced-motion mode removes simulated depth/camera travel.
- WebGL failure preserves the same destinations and content.
- Mobile exposes titles and types without hover.
- Prototype measurements report initial bytes, interaction readiness, frame behavior, and fallback activation.

## Prototype A — SVG / DOM fracture

### Purpose

Test whether the shattered-surface concept can work as graphic composition rather than expensive simulation.

### Reference basis

- semantic/index-led navigation patterns in `research/navigation-patterns.md`;
- masked and shape-based home patterns in `research/homepage-patterns.md`;
- findings from `research/multiverse-evaluation.md`.

### Technology

- semantic HTML links;
- inline SVG polygon/clip paths or CSS `clip-path`;
- DOM type and project metadata;
- GSAP timeline for coordinated selection and route exit;
- CSS-only static fallback.

### Test

- arrange irregular panes around one controlled focal seam;
- reveal one study image in each pane;
- move focused pane forward through crop, scale, and type—not simulated physics;
- transition one pane to a full project-study route;
- validate tab order independently from pane coordinates.

### Mobile

Recompose as three offset full-width panes or cards. Keep the visual fracture through angled crops and seams; do not preserve the desktop shard map.

### Reduced motion

Use immediate selection, opacity/crop emphasis, and a short crossfade under 150 ms.

### Expected profile

- visual quality: dependent on composition and source imagery;
- load/GPU: low;
- accessibility: strongest;
- asset burden: low to medium;
- expansion: good if the layout is generated from a small set of templates;
- risk: “fashion editorial collage” rather than dimensional glass.

## Prototype B — Hybrid WebGL glass

### Purpose

Test whether a restrained real-time glass layer materially improves the nexus while DOM retains content and navigation.

### Reference basis

- persistent-canvas and framebuffer patterns in `research/webgl-patterns.md`;
- failure and quality-tier rules in the project WebGL/performance skills;
- Prototype A as the required fallback.

### Technology

- one Three.js canvas;
- simple plane/shard geometry and one portal texture atlas or bounded textures;
- raycasting mirrors DOM selection but never owns navigation;
- DOM links and typography above or beside the canvas;
- restrained shader/refraction treatment;
- one full selection-to-project transition;
- Prototype A activated on context creation/loss failure.

### Test

- compare real-time parallax/refraction with the same imagery in Prototype A;
- cap DPR and texture resolution by quality tier;
- ensure focus can drive the same raycast highlight state;
- interrupt and reverse the route transition;
- simulate WebGL context loss and verify replacement.

### Mobile

Use fewer fragments, no pointer-follow parallax, capped DPR, and an automatic low tier. Fall back to A when memory/performance heuristics fail.

### Reduced motion

Freeze camera and pointer response; keep only a short material-state crossfade before route commit.

### Expected profile

- visual quality: potentially high if the glass is quiet and imagery is strong;
- load/GPU: medium to high;
- accessibility: good only because DOM remains authoritative;
- asset burden: medium;
- expansion: medium;
- risk: tutorial glass, game menu, thermal/battery cost, and transition fragility.

## Prototype C — Cinematic compositing

### Purpose

Test whether high-fidelity image direction and layered transitions communicate connected realities more effectively than a literal glass simulation.

### Reference basis

- image/video and 2.5D patterns in `research/asset-production-patterns.md`;
- cinematic transition findings in `research/transition-patterns.md`;
- the optical index and living-edition alternatives in `research/multiverse-evaluation.md`.

### Technology

- optimized generated stills;
- DOM type and links;
- layered CSS/SVG masks plus a minimal shader or canvas blend only where it adds visible value;
- transformable foreground/background planes;
- restrained grain/light/matte overlays;
- no complex real-time 3D geometry.

### Test

- move between realities through match cuts, mattes, color, focus, and compositional depth;
- compare perceived fidelity with B at a lower GPU cost;
- support one full route transition and immediate interruption;
- verify still-image and reduced-motion modes look intentional.

### Mobile

Select a deliberate portrait crop or alternate still, use one active layer plus a low-cost foreground plane, and expose horizontal/vertical adjacent navigation.

### Reduced motion

Use one still per reality with an immediate state change or brief opacity dissolve.

### Expected profile

- visual quality: highest potential;
- load/GPU: medium and controllable;
- accessibility: strong with DOM ownership;
- asset burden: highest art-direction burden;
- expansion: good if every universe supplies the same layer/variant manifest;
- risk: impressive cover imagery without enough project proof, and recurring asset-production cost.

## Measurement rubric

| Criterion | Method |
|---|---|
| First semantic content | Browser timing from navigation to visible heading/link |
| Interaction readiness | Mark when the first project link is operable |
| Initial JavaScript | Built chunk report and transferred bytes |
| Initial media | Network bytes before interaction plus per-prototype lazy bytes |
| Frame time | Performance trace during idle, focus, pointer, and transition |
| GPU tier | High/low/fallback capture on Intel integrated graphics |
| Accessibility | axe scan plus keyboard/focus/reduced-motion manual assertions |
| Mobile quality | Screenshots and interactions at iPhone and ordinary Android viewports |
| Resilience | WebGL creation/loss, slow media, missing media, and interrupted transition |
| Expansion cost | Code/data/asset changes required to add a fourth study |

## Review questions

1. Which prototype best communicates one studio crossing distinct realities?
2. Which feels least like a game, theme selector, or effects reel?
3. Which preserves the clarity and confidence required to sell services?
4. Is the added real-time rendering in B visibly worth its cost over A or C?
5. Does C make the multiverse more sophisticated, or merely make the imagery stronger?
6. Which mobile interpretation feels authored rather than reduced?
