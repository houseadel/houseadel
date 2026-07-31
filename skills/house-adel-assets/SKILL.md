---
name: house-adel-assets
description: Plan, generate, transform, optimize, and document provenance-first assets for House Adel project worlds. Use when producing AI-assisted images, reference frames, layered artwork, video, audio, 3D models, textures, posters, responsive or mobile variants, fallbacks, or asset manifests for prototypes and production candidates.
---

# House Adel Assets

## Establish the asset contract

1. Read `AGENTS.md`, the approved world brief and visual bible, and the repository's asset-pipeline, manifest-schema, and rights documents when present.
2. Confirm whether the work is exploratory, a prototype, or a production candidate. Do not present exploratory output as approved production art.
3. Define every required variant before generation: desktop, tablet, mobile, reduced-motion, no-WebGL, slow-network placeholder, failed-asset fallback, and static poster.
4. Set size and quality targets from measured use and performance budgets; do not invent one universal export size.

## Work from one approved master

Produce assets in this order:

1. world brief and visual bible;
2. reference pack with source and rights notes;
3. approved master frame;
4. supporting images and separated foreground/background layers;
5. motion loops, optional 3D, sound, depth data, masks, and transition mattes;
6. optimized web exports, mobile alternatives, posters, placeholders, and static fallbacks.

Carry forward the master frame's controlled characteristics, such as palette, material, lighting, lens, composition, texture, and subject treatment. Use the master or an approved derivative as a style reference when tools support it. Record seeds, model versions, prompts, masks, control images, edits, and transformations; never imply reproducibility when a tool cannot provide it.

Verify current licensing, commercial-use terms, pricing, API availability, and output restrictions against official sources before adopting a generation or production tool.

## Record provenance before publishing

Create one manifest record per logical asset and include:

- stable ID, world, role, media type, version, and status;
- source, creator or tool, model/version, prompt or transformation notes, and generation date;
- license, commercial-use status, attribution requirements, and source URL;
- human approver, approval date, and usage restrictions;
- raw master path and checksum;
- each export's path, format, dimensions or duration, byte size, and checksum;
- desktop, mobile, poster, placeholder, and fallback relationships;
- owning route or component, loading priority, and alt-text or decorative status.

Conform to `docs/asset-manifest-schema.md` when it exists. Never commit secrets, unlicensed paid assets, unverifiable media, or a production candidate without human approval. Keep raw masters separate from generated intermediates and optimized exports.

## Name and export deterministically

- Use lowercase kebab-case: `<world>-<role>-<subject>-<variant>-vNN[-<width>w].<ext>`.
- Keep one stable base name across responsive variants; suffix posters with `-poster` and placeholders with `-placeholder`.
- Preserve the original source name in provenance even when the working file is renamed.
- Generate exports with repeatable scripts. Make scripts refuse to overwrite raw masters and report missing files, duplicates, dimensions, formats, and byte sizes.

Apply these media rules:

- **Images:** retain a lossless or highest-quality master; emit measured responsive sizes in AVIF and WebP plus a justified fallback; never upscale; verify transparency, color space, crop, and edge quality.
- **Video:** retain the edit master; emit web-compatible MP4 and WebM variants as required by the support matrix; create a poster; verify first frame, last frame, loop seam, duration, dimensions, bitrate, audio state, and `playsinline` behavior.
- **GLB:** validate transforms, scale, pivots, normals, materials, animation clips, bounds, and unused data; apply Meshopt or Draco only when the runtime supports it; compress compatible textures with KTX2/Basis and verify the decoded result.
- **Textures:** assign color space correctly, generate mipmaps where useful, limit resolution by measured display need and quality tier, and test compressed normal, alpha, environment, and depth maps for artifacts.
- **Audio:** retain a master, export appropriate web encodes, normalize deliberately, provide a controllable silent default, and never make meaning depend on sound.

## Validate the complete set

Compare every derivative with the approved master and visual bible. Test real routes at desktop and mobile sizes, slow-network behavior, missing-file behavior, static and no-WebGL fallbacks, reduced motion, decoding, loop quality, memory pressure, and visible compression artifacts.

Update the manifest and asset-size report in the same change as any export. Reject orphaned files, stale hashes, missing posters, broken fallback relationships, unexplained rights, or assets that exceed measured budgets.
