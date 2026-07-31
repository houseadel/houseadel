# Asset-production patterns

**Status:** Phase 1 production research; visual worlds and final tool chain remain unapproved  
**Sources accessed:** 2026-07-30

## Reading key

- **Evidence** is supported by a cited primary source.
- **Inference** is a production deduction to validate with House Adel assets.
- **Recommendation** is a pipeline hypothesis, not an approved art direction or format budget.

## Asset-first principle

CSS, shaders, and transitions should express an approved visual world, not invent one accidentally. Every candidate world passes through:

```text
world brief
  -> visual bible + exclusion list
  -> reference pack + rights plan
  -> one master frame
  -> responsive/mobile/static reinterpretations
  -> approved shot + layer manifest
  -> production and compositing
  -> optional motion / optional real-time 3D / optional sound
  -> deterministic web exports
  -> creative + rights + technical review
```

Do not expand a prompt into dozens of assets before the world brief and one master frame are approved.

## 1. World brief

The brief should be short enough to govern decisions:

- project/route purpose and audience;
- one-sentence governing idea;
- emotional register;
- content hierarchy;
- material, light, color, spatial, image, and type principles;
- motion and sound intent;
- what remains House Adel infrastructure;
- mobile, reduced-motion, no-WebGL, slow-network, and failed-asset concept;
- prohibited clichés and negative references;
- rights sensitivities; and
- production ceiling and specialist needs.

## 2. Visual bible

A useful visual bible is operational rather than mood-board-only:

| Dimension | Define | Reject |
| --- | --- | --- |
| Composition | focal location, scale relationships, negative space, crop rules | generic centered AI tableau unless concept requires it |
| Lens / perspective | camera height, focal tendency, depth compression | inconsistent perspective between layers |
| Light | direction, hardness, color relationship, atmospheric depth | unmotivated glows |
| Material | surface vocabulary and age/imperfection | texture variety without hierarchy |
| Color | small functional palette and contrast roles | color used as the only state cue |
| Typography territory | role, density, casing, rhythm; licensing status | generating final body copy inside images |
| Motion | what moves, why, trigger, duration character, stop state | perpetual ambient motion with no meaning |
| Sound | optional narrative function, event map, silence | auto-playing ambience as identity |
| Provenance | allowed source classes and reference restrictions | unverifiable reposts or artist imitation |

Include an exclusion sheet showing visual outcomes that are technically possible but conceptually wrong: Marvel portals, game menus, generic glass tutorials, particle fields, glossy AI composites, glowing buttons, and disconnected theme skins.

## 3. Master-frame gate

Approve one high-resolution still that proves:

- composition and hierarchy;
- material/light/color behavior;
- typography territory;
- content legibility;
- the relationship between House Adel and project-world identity;
- a plausible mobile crop or alternate composition; and
- a plausible static fallback.

The master frame is not automatically a public asset. Preserve it as a raw source with provenance, then derive the shot list and public exports.

## 4. Shot and layer manifest

Break the frame into purposeful assets:

```text
background plate
midground / atmospheric plate
subject or portal plate
foreground occlusion
mask / matte
optional depth estimate
optional motion loop
optional model + textures
poster / static fallback
mobile alternate
reduced-motion alternate
```

Every item gets a stable ID before editing. The manifest defined in [Asset manifest contract](../docs/asset-manifest-schema.md) records source, prompts/references, tool/version, transformations, rights, hashes, variants, fallback, and three independent approvals.

## Deterministic boundary

AI generation and many creative edits are not reliably reproducible from prompt and seed alone. Preserve:

- original provider output;
- provider, model/version, plan, date, job ID and seed when exposed;
- exact prompt/settings;
- every reference/input;
- terms/pricing link checked at generation time; and
- selected master hash.

Once a master or composite is approved, web transformation should be deterministic and scriptable:

```text
approved master hash
  -> recorded crop/grade/layer recipe
  -> responsive image/video/model/audio transforms
  -> byte + dimension + duration inspection
  -> hash + manifest update
  -> visual QA
```

**Inference:** A seed is valuable provenance but not a guarantee of exact replay across model upgrades, hosted providers, GPU kernels, or custom-node changes.

## Tool roles

| Stage | Preferred class | Evidence / use | House Adel posture |
| --- | --- | --- | --- |
| Compositing and retouch | Photoshop or equivalent layered editor | Photoshop documents Generative Fill/Expand/Remove and reference-image workflows ([Adobe, generative AI overview](https://helpx.adobe.com/photoshop/desktop/generative-ai/generative-ai-features-overview.html), [reference images](https://helpx.adobe.com/photoshop/desktop/create-open-import-images/create-images/use-reference-images-for-consistent-results.html)). | Human art-direction checkpoint; never treat a one-click cutout as final edge work. |
| Alpha extraction / masks | Manual masks, Photoshop removal, or reviewed segmentation | Photoshop's Remove Background produces transparency/masked layers and anticipates manual refinement ([Adobe, Remove Background](https://helpx.adobe.com/photoshop/desktop/repair-retouch/remove-objects-fill-space/remove-background-in-your-images.html)). Meta's SAM 2 repository provides promptable segmentation for image/video under Apache 2.0 code/checkpoint terms ([SAM 2](https://github.com/facebookresearch/sam2)). | Preserve a lossless mask master; inspect hair, glass, translucency, motion edges, and halos. |
| Depth estimate | Reviewed monocular-depth model or manual depth painting | Depth Anything V2 publishes model-specific licenses: Small is Apache-2.0; Base/Large/Giant are CC-BY-NC-4.0 in the official repository ([Depth Anything V2](https://github.com/DepthAnything/Depth-Anything-V2)). | Depth is an estimated compositing aid, not geometric truth. Do not use noncommercial weights in a commercial candidate. |
| Motion compositing | After Effects or equivalent compositor | Adobe documents supported import/export formats and render/export workflows ([After Effects formats](https://helpx.adobe.com/ca/after-effects/kb/supported-file-formats.html), [render/export](https://helpx.adobe.com/uk/after-effects/using/basics-rendering-exporting.html)). | Build short purposeful shots, clean loops, mattes, and source masters before web encoding. |
| 3D cleanup / authoring | Blender | Blender's GPL applies to the program; Blender's manual states artwork created with it is the user's property ([Blender license](https://docs.blender.org/manual/en/3.2/getting_started/about/license.html)). Its glTF exporter supports GLB and documents export features/limitations ([Blender glTF](https://docs.blender.org/manual/en/3.3/addons/import_export/scene_gltf2.html)). | AI-generated meshes pass through silhouette, topology, UV, material, scale, pivot, and animation review. |
| Image derivatives | Sharp | Sharp supports resize and conversion among JPEG, PNG, WebP, GIF, AVIF, TIFF, and SVG input/output combinations documented by the project ([Sharp](https://sharp.pixelplumbing.com/)). | Candidate for reproducible responsive variants and metadata reports. |
| Video/audio derivatives | FFmpeg | FFmpeg's official manual covers transcoding, filtering, stream selection, and stream copy ([FFmpeg](https://ffmpeg.org/ffmpeg.html)). | Candidate for web encodes, loop trims, posters, waveform/duration inspection. Pin/version the binary. |
| glTF transformation | glTF Transform | The official project provides a JavaScript/TypeScript API and CLI for inspect, dedup, texture processing, Draco, Meshopt, WebP, and KTX2 operations under MIT ([glTF Transform](https://github.com/donmccurdy/glTF-Transform)). | Leading orchestration layer for deterministic GLB reports/optimization. |
| Mesh optimization | Meshoptimizer / `gltfpack` | Meshoptimizer documents vertex/index/animation optimization and optional mesh/texture compression ([meshoptimizer](https://github.com/zeux/meshoptimizer), [`gltfpack`](https://github.com/zeux/meshoptimizer/blob/master/gltf/README.md)). | Leading geometry-compression hypothesis; confirm decoder, quality, and browser/device cost. |
| Alternative geometry compression | Draco | Google's Draco project compresses 3D geometric meshes and point clouds ([Draco](https://google.github.io/draco/)). | Benchmark only if it materially wins for the approved model; do not ship both schemes without need. |
| GPU texture container | KTX2 / KTX-Software | Khronos publishes the KTX 2.0 specification and official tools for creating/transcoding KTX textures ([KTX 2.0 spec](https://registry.khronos.org/KTX/specs/2.0/ktxspec.v2.html), [KTX-Software](https://github.com/KhronosGroup/KTX-Software)). | Use only after device testing shows a real memory/transfer benefit. Record encoder version/settings. |

FFmpeg licensing depends on how it is built: the project is LGPL 2.1+ by default, while optional GPL components change the resulting build's license; patent considerations can also vary by codec and jurisdiction ([FFmpeg Legal](https://ffmpeg.org/legal.html)). Record the exact binary/distribution used and review redistribution separately from using the tool internally.

## Still-image production

### Masters

- Preserve layered/high-bit-depth working files where grading or alpha demands them.
- Flatten a visually approved, lossless or high-quality interchange master.
- Store the original color profile and record intentional conversion.
- Keep text and UI copy in DOM/SVG unless the text itself is artwork with an accessible equivalent.

### Web exports

- Generate width variants from observed layout slots.
- Use `srcset`/`sizes` for resolution selection and `<picture>` for art-directed mobile crops ([web.dev, “Responsive images”](https://web.dev/articles/responsive-images)).
- Compare AVIF, WebP, and a baseline JPEG/PNG at intended display size; choose by measured quality and bytes, not by format fashion.
- Preserve alpha only where composition requires it.
- Set intrinsic dimensions and retain an intentional placeholder/fallback.
- Inspect banding, ringing, gradients, film grain, skin, textural detail, and alpha fringes.

Sharp is suitable for deterministic resizing/encoding, but its version and encoder settings belong in the transformation record.

## Motion production

### Masters

- Keep an edit/composite project plus a high-quality mezzanine or lossless image sequence for alpha-sensitive work.
- Interpret premultiplied/straight alpha consistently; Adobe documents alpha interpretation as part of After Effects footage handling ([Adobe, importing and interpreting footage](https://helpx.adobe.com/after-effects/using/importing-interpreting-footage-items.html)).
- Define the loop seam in the edit, not as a browser workaround.

### Web exports

- Export a silent visual loop when sound is not essential.
- Produce a poster from a deliberately selected frame.
- Compare MP4 and WebM outputs on the supported browser/device matrix.
- Record codec, profile, dimensions, frame rate, duration, bitrate/quality mode, and audio state.
- Keep short loops short; do not hide a narrative film inside an ambient background.
- Stop offscreen playback and provide reduced-motion/static alternatives.

FFmpeg should generate web derivatives and posters from the approved motion master; it should not overwrite that master.

## 2.5D and depth

Use layered media when depth, focus, occlusion, and camera restraint communicate the idea without real-time geometry.

Pipeline:

1. segment reviewed foreground/midground/background masks;
2. repair occluded regions where camera movement will expose them;
3. create or review a depth estimate;
4. constrain camera displacement to what the source can support;
5. composite edge treatment, grain, and atmosphere consistently;
6. test portrait/mobile framing separately; and
7. provide the approved master still as fallback.

**Inference:** Monocular depth maps frequently fail on transparency, reflections, thin structures, text, and ambiguous scale. A technically smooth displacement can still be visually false.

## 3D production

### Intake gate

Use a model only if real-time viewpoint/material behavior adds meaning. A generated mesh is a blockout until reviewed for:

- silhouette and proportion;
- scale, units, orientation, pivot, and transforms;
- topology and deformation;
- normals/tangents;
- UVs and texture seams;
- material count and draw-call implications;
- texture licensing, color space, dimensions, and channel packing;
- animation clips and duration;
- hidden/internal geometry; and
- mobile/static alternative.

### Web path

```text
source model
  -> Blender cleanup / approved GLB
  -> glTF Transform inspect + deterministic operations
  -> Meshopt OR Draco comparison
  -> optional KTX2 texture comparison
  -> browser/device visual QA
  -> poster turntable / static frame
```

GLB is a useful single-file delivery container, but external texture delivery may be preferable when caching/variants justify it. Do not assume compression is free: decoding time, decoder bytes, texture transcode support, and artifacts must be measured.

## Sound production

- Begin with an event map: ambient bed, navigation cue, project cue, silence.
- Keep sound optional and disabled until the visitor opts in.
- Preserve a lossless master and record generation/library/commission rights.
- Normalize and trim deliberately; check loop clicks and headphone/speaker translation.
- Encode web candidates with recorded settings and test browser support.
- Provide visible equivalents for information-bearing cues.
- Never rely on sound for loading, selection, or route completion.

ElevenLabs and its current rights/API constraints are evaluated in [AI and production tool research](ai-asset-tools.md).

## Consistency across generative tools

Do not expect a tool's “style” control alone to make a world coherent. Consistency comes from a locked production packet:

- approved master frame and crop grid;
- fixed subject/material/color/light vocabulary;
- positive and negative prompt vocabulary;
- approved references with recorded rights;
- model/version and settings;
- shot IDs and camera/lens notes;
- stable edit/grade/grain recipe;
- reusable masks/depth/texture sources; and
- human comparison against the visual bible.

Generate in families from the approved source when possible. Do not independently prompt every asset from prose.

## Rights and provenance gate

For every production candidate:

1. verify the exact provider/model/plan terms at the generation date;
2. verify rights to every input/reference;
3. record public/private and provider-training settings;
4. flag people, likenesses, trademarks, protected characters, artworks, venues, and confidential material;
5. record attribution, territory/term, and client-transfer obligations;
6. preserve the raw output and transformation history; and
7. obtain creative, rights, and technical approval separately.

Provider terms are a contractual usage basis, not a guarantee of copyrightability, exclusivity, non-infringement, or uniqueness. Escalate high-value or ambiguous rights questions to qualified counsel. See [Asset rights and provenance](../docs/asset-rights-and-provenance.md).

## Publication QA

Block an asset when:

- its visual role is not tied to the world brief;
- rights or client-transfer status is unknown;
- an input/reference cannot be traced;
- a generative master is missing;
- an export cannot be connected to a recorded recipe and hash;
- a motion/model has no poster/static alternative;
- the mobile crop is automatic and fails composition;
- the asset fails contrast/legibility in its actual state;
- compression artifacts materially change the direction; or
- a failed load leaves a blank or broken route.

## Sources

- Adobe Photoshop, generative AI overview: https://helpx.adobe.com/photoshop/desktop/generative-ai/generative-ai-features-overview.html
- Adobe Photoshop, reference images: https://helpx.adobe.com/photoshop/desktop/create-open-import-images/create-images/use-reference-images-for-consistent-results.html
- Adobe Photoshop, Remove Background: https://helpx.adobe.com/photoshop/desktop/repair-retouch/remove-objects-fill-space/remove-background-in-your-images.html
- Adobe After Effects, supported formats: https://helpx.adobe.com/ca/after-effects/kb/supported-file-formats.html
- Adobe After Effects, rendering/export: https://helpx.adobe.com/uk/after-effects/using/basics-rendering-exporting.html
- Blender, license: https://docs.blender.org/manual/en/3.2/getting_started/about/license.html
- Blender, glTF 2.0: https://docs.blender.org/manual/en/3.3/addons/import_export/scene_gltf2.html
- Sharp: https://sharp.pixelplumbing.com/
- FFmpeg: https://ffmpeg.org/ffmpeg.html
- FFmpeg Legal: https://ffmpeg.org/legal.html
- glTF Transform: https://github.com/donmccurdy/glTF-Transform
- Meshoptimizer: https://github.com/zeux/meshoptimizer
- `gltfpack`: https://github.com/zeux/meshoptimizer/blob/master/gltf/README.md
- Draco: https://google.github.io/draco/
- KTX 2.0 specification: https://registry.khronos.org/KTX/specs/2.0/ktxspec.v2.html
- KTX-Software: https://github.com/KhronosGroup/KTX-Software
- Meta, SAM 2: https://github.com/facebookresearch/sam2
- Depth Anything V2: https://github.com/DepthAnything/Depth-Anything-V2
- web.dev, “Responsive images”: https://web.dev/articles/responsive-images
