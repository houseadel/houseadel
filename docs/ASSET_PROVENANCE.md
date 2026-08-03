# Asset provenance

Last updated: 2026-08-03

## Production statement

House Adel version one ships no generative-AI image, generative-AI video, AI-created person, wedding photography, raster artwork, stock footage, or generated 3D asset. The public visual system is made from semantic typography, CSS fields and paper-like planes, project-owned inline SVG drawings and masks, and a project-owned procedural WebGL scene built from simple geometry. The WebGL scene has no image texture, video, model, or external media dependency.

`data/assets.json` is the authority for stored production imagery. Its `assets` collection is intentionally empty. The production `public/` directory contains only the local font binaries and their licence notices listed below; browser screenshots under `output/` are QA evidence and are not copied into the deployed build.

## Files distributed with the site

| File | Creator/source | Rights | Use | Transformations |
| --- | --- | --- | --- | --- |
| `public/fonts/manrope-latin-variable.woff2` | The Manrope Project Authors | SIL Open Font License 1.1 | Neutral grotesk for navigation, metadata, forms, and text | Latin variable WOFF2 subset retained locally for self-hosting |
| `public/fonts/newsreader-latin-variable.woff2` | The Newsreader Project Authors | SIL Open Font License 1.1 | Editorial serif for display type and ceremonial hierarchy | Latin upright variable WOFF2 subset retained locally for self-hosting |
| `public/fonts/newsreader-latin-variable-italic.woff2` | The Newsreader Project Authors | SIL Open Font License 1.1 | Restrained italic from the same serif family | Latin italic variable WOFF2 subset retained locally for self-hosting |
| `public/licenses/manrope-OFL-1.1.txt` | The Manrope Project Authors | SIL Open Font License 1.1 | Distributed licence notice for Manrope | None |
| `public/licenses/newsreader-OFL-1.1.txt` | The Newsreader Project Authors | SIL Open Font License 1.1 | Distributed licence notice for Newsreader | None |

The CSS `@font-face` declarations point to these local files. No font request is made to a third-party origin, and the prior Fontsource runtime packages are no longer required for distribution.

## Code-native visual material

These elements are source code rather than acquired media and therefore do not receive `data/assets.json` image records:

- the homepage ivory fallback, planes, frames, aperture, register lines, and procedural Three.js geometry;
- Edition plates and their SVG reveal masks;
- Story plates and configured project-interaction diagrams;
- the Private Commissions atelier-table map, plan, paper, type, date, and measurement abstractions;
- The House continuous SVG path;
- interface icons, rules, form indicators, focus treatments, and CSS grain/lighting treatments.

All of these forms were created for this repository. They do not depict a real wedding, venue, location, client archive, or person. Every Edition and Story using them is labelled `House Adel Study — Self-initiated.`

## Archived material excluded from production

The superseded Moving House implementation, Phase 1 generated masters, derived world imagery, sequence frames, and review captures are preserved only on branch `phase-1-research` at commit `7ec9c97`. They are prohibited production material and are absent from the public source paths and `dist/`. Audit screenshots of the superseded interface also remain outside the deployable bundle.

## Acquisition policy

Future stored imagery is eligible only when it is:

- project-owned with documented ownership;
- verified CC0 or public-domain material from the Metropolitan Museum of Art, Rijksmuseum, or Smithsonian Open Access; or
- manually approved licensed material with evidence of permitted web use.

Google Images, Pinterest, competitor sites, unverifiable downloads, and generative systems are not asset sources. Public-domain material may be contextual editorial material but may never be presented as wedding photography, client work, or evidence of a commission.

`scripts/fetch-open-access-assets.ts` accepts explicit object IDs or a curated query, verifies rights before downloading, preserves the institution-supplied original, creates deterministic AVIF/WebP derivatives, records hashes and transformations, and refuses to overwrite an existing path. Smithsonian requests require the server-side `SMITHSONIAN_API_KEY`; the script never exposes credentials to the browser.

An acquired record remains unusable until a human verifies its rights, context, crop, colour treatment, alt text, public credit, page list, and any privacy, publicity, trademark, or cultural-sensitivity restrictions, then records `approvedBy` and `approvedAt` in `data/assets.json`.

## Verification

The provenance audit checks production image files against `data/assets.json`. A production build should contain only the three font files, two OFL notices, JavaScript, CSS, and HTML until a human-approved asset record is added. Run:

```powershell
npm run audit:provenance
npm run audit:assets
```

Verified 2026-08-03: the provenance audit found 0 production image files and no unrecorded image; the public asset-size audit found only the three WOFF2 font files, totalling 144 KiB.
