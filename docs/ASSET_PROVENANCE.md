# Asset provenance

Last updated: 2026-08-02

## Production rule

House Adel version one must contain no generative-AI images, video, people, wedding photography, or 3D assets. An asset is eligible for production only when its source, creator or institution, rights status, retrieval date, transformations, and page usage are recorded. Public-domain material must still be credited in the relevant project detail.

Allowed sources are:

- project-owned type, code, SVG, photography, scans, and textures;
- verified CC0 or public-domain records from the Metropolitan Museum of Art, Rijksmuseum, or Smithsonian Open Access;
- manually approved licensed material with evidence of the licence and permitted web use.

Google Images, Pinterest, competitor sites, unverifiable downloads, and generative systems are not asset sources.

## Phase 0 inventory

| Asset family | Repository location | Source and rights | Production status | Required action |
| --- | --- | --- | --- | --- |
| Newsreader variable font | `@fontsource-variable/newsreader` | Fontsource package metadata identifies Google Inc. and `OFL-1.1`; licence file ships with the package | Eligible; final typographic approval pending | Retain only the weights/subsets actually used and carry the OFL notice with distributed licences |
| Manrope variable font | `@fontsource-variable/manrope` | Fontsource package metadata identifies Google Inc. and `OFL-1.1`; licence file ships with the package | Eligible; final typographic approval pending | Retain only the weights/subsets actually used and carry the OFL notice with distributed licences |
| Phase 1 world masters | `references/masters/prototype-worlds/` | OpenAI-generated studies recorded in the adjacent manifest and prompts | Prohibited | Remove from the production branch after this record is committed; preserve only on the archival branch |
| Phase 1 world derivatives | `public/assets/worlds/` | AVIF/WebP derivatives of the generated Phase 1 masters | Prohibited and currently public-path reachable | Remove before any production route is integrated |
| Phase 1 review captures | `src/assets/review-captures/`, `references/captures/phase-1/`, and visual baselines that reproduce the studies | Browser captures of the generated Phase 1 direction lab | Internal evidence only | Remove from production source/baselines; never publish as portfolio imagery |
| Moving House sequence and source material | Preserved by branch `phase-1-research` at commit `7ec9c97` | Generated masters, derived frames, prompts, recordings, and implementation from the superseded direction | Prohibited | Do not merge into production; the branch is the recovery record |
| Legacy static concept | `references/legacy-v0/` | Pre-Phase-1 project material; complete production rights are not recorded | Internal evidence only | Keep outside public imports and treat as ineligible until ownership and rights are documented |
| Phase 0 browser captures | `output/playwright/audit-current/` | Locally captured screenshots of the superseded site | Internal audit evidence only | Keep outside the deployed bundle and never use as public reference imagery |

No production photography, artwork, archival material, invitation imagery, or client material is approved as of this audit. No project claim may be inferred from the Phase 1 studies.

## Safe removal plan

1. Preserve the superseded Moving House implementation on `phase-1-research` at `7ec9c97` before changing `master`.
2. Commit this inventory and the prohibition decision on `master`.
3. Resolve the exact generated source, derivative, capture, test-baseline, and import paths with a read-only check.
4. Remove those paths from `master` and replace all imports with project-owned, procedural, or verified open-access material. Do not remove the archival branch.
5. Run the provenance audit, repository search for generated-asset references, route tests, and production build.
6. Verify the generated material is absent from `dist/` and all public routes. Internal Phase 0 screenshots remain excluded from deployment.

This sequence makes the removal deliberate and recoverable through the archival commit; it does not grant permission to reuse the archived material.

## Production record schema

`data/assets.json` will be the production authority. Every record must include:

- stable asset ID and file paths for original and derivatives;
- asset type and intended use;
- creator or institution, object ID when applicable, title, artist, and date;
- canonical source URL and rights or licence statement;
- retrieval or creation date;
- transformations and derivative dimensions/formats;
- pages using the asset;
- human approval state and approval date;
- credit line, including for public-domain objects;
- notes about restrictions, confidentiality, or replacement.

The acquisition script must reject unclear rights, preserve originals separately, optimise deterministic derivatives, and never overwrite an existing file silently.
