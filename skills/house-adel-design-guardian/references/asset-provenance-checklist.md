# Asset provenance checklist

## Allowed material

- Project-owned media with documented authorship and commercial-use status.
- Verified CC0 or public-domain museum material from an authoritative record.
- Manually approved licensed media with the license and usage scope recorded.
- Deterministic code-native SVG, CSS, canvas, or procedural geometry created for House Adel.

Never use generative-AI imagery, video, people, wedding photography, or 3D assets. Never scrape competitors, Google Images, or Pinterest. Do not use public-domain artwork as simulated wedding photography.

## Record before use

Add every production image file to `data/assets.json` with:

- stable asset ID and every production file path;
- institution or owner, object ID when applicable, title, artist or creator, and date;
- authoritative source URL;
- rights statement, license, and commercial-use status;
- retrieval or creation date;
- original file path and optimized derivative paths;
- transformations performed;
- routes or components using the asset;
- human approval status.

Credit public-domain material in project details even when attribution is not legally required. Keep originals separate from optimized exports and never overwrite either silently.

## Audit command

Run from the repository root:

```bash
node skills/house-adel-design-guardian/scripts/report_images_without_provenance.mjs
```

The command scans production-facing image roots, ignores build, test, audit, review, archive, and reference paths, and exits nonzero when it finds a file that is not named anywhere in `data/assets.json`. Fix records; do not silence a valid finding by broadening exclusions.
