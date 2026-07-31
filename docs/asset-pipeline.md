# Asset-first production pipeline

Status: Phase 1 working system; tool choices remain under research.

## World gate

Do not produce a large asset set until these are approved in order:

1. world brief;
2. visual bible;
3. one master frame;
4. reference pack and exclusion list;
5. asset shot list;
6. motion and sound intent;
7. mobile and static reinterpretation;
8. rights plan.

## Pipeline

| Stage | Input | Output | Review question |
|---|---|---|---|
| Direction | project narrative and House Adel rules | world brief and visual bible | Is this world conceptually distinct without breaking the shared system? |
| Master frame | references and prompt plan | one approved hero frame | Does the composition, type territory, material, light, and emotional register hold? |
| Expansion | approved frame and shot list | supporting plates and isolated layers | Do additions feel related rather than merely similar? |
| Motion | approved layers | restrained loops, mattes, depth, camera plan | Does motion reveal meaning and survive interruption/reduction? |
| Optional 3D | justified spatial need | optimized GLB/textures or procedural recipe | Does real-time geometry outperform layered media for this job? |
| Sound | world brief and event map | ambient bed and event cues | Is sound optional, controlled, and rights-cleared? |
| Optimization | raw masters | responsive web variants | Do exports meet visual and byte budgets? |
| Manifest | sources and exports | validated provenance record | Can every public byte be traced and replaced? |
| QA | approved manifest | desktop/mobile/fallback evidence | Does the world work without motion, WebGL, sound, or fast networking? |

## File naming

Use:

`{universe}-{role}-{subject}-{sequence}-{purpose}-{width}.{ext}`

Example:

`archive-portal-silk-01-mobile-960.avif`

Keep the base asset ID dimension-free in the manifest. Use lowercase ASCII, hyphens, and a two-digit sequence.

## Delivery defaults to test

These are starting hypotheses, not permanent budgets:

- photographic stills: AVIF primary, WebP fallback where testing warrants it;
- alpha imagery: AVIF or WebP after browser-quality comparison; PNG only when fidelity requires it;
- video: muted inline MP4/H.264 compatibility baseline plus WebM when it materially reduces bytes; always include poster and still fallback;
- 3D: binary glTF, Meshopt geometry compression, texture dimensions selected by quality tier, KTX2 only after device testing;
- audio: short compressed loops with explicit controls and no autoplay dependency;
- fonts: licensed WOFF2 subsets, minimal weights, preload only the critical face.

## Automation targets

Implemented project scripts:

- `generate-responsive-images.mjs` generates measured AVIF/WebP variants and metadata;
- `transcode-video.mjs` and `extract-poster.mjs` use the discovered FFmpeg installation;
- `optimize-glb.mjs` gates the optional glTF Transform CLI instead of installing it prematurely;
- `report-asset-sizes.mjs` reports individual and category bytes;
- `asset-manifest.mjs` generates, validates, previews, and explicitly writes manifest metadata;
- `find-duplicate-assets.mjs` hashes and reports duplicate material; and
- `audit-asset-files.mjs` detects missing, invalid, and orphaned files.

The Phase 1 world manifest validates with zero errors/warnings, and its public asset audit reports no missing, orphaned, or duplicate files.

## Quality review

Inspect each export for banding, haloing, alpha fringes, texture seams, motion judder, poster mismatch, and legibility behind foreground material. Compare the optimized export with the master at intended display size; do not use a single numeric quality setting as approval.
