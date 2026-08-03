# Asset provenance

Last updated: 2026-08-03

## Production statement

House Adel version one ships no generative-AI image, generative-AI video, AI-created person, wedding photography, stock footage, or generated 3D asset. The public visual system combines semantic typography, two verified public-domain Met archival interiors, CSS fields and paper-like planes, project-owned SVG drawings and masks, and a project-owned procedural WebGL scene built from simple geometry. The archival images are editorial references, never client work or wedding photography.

`data/assets.json` is the authority for stored production imagery. Browser screenshots under `output/` are QA evidence and are not copied into the deployed build.

## Files distributed with the site

| File | Creator/source | Rights | Use | Transformations |
| --- | --- | --- | --- | --- |
| `public/fonts/manrope-latin-variable.woff2` | The Manrope Project Authors | SIL Open Font License 1.1 | Neutral grotesk for navigation, metadata, forms, and text | Latin variable WOFF2 subset retained locally for self-hosting |
| `public/fonts/newsreader-latin-variable.woff2` | The Newsreader Project Authors | SIL Open Font License 1.1 | Editorial serif for display type and ceremonial hierarchy | Latin upright variable WOFF2 subset retained locally for self-hosting |
| `public/fonts/newsreader-latin-variable-italic.woff2` | The Newsreader Project Authors | SIL Open Font License 1.1 | Restrained italic from the same serif family | Latin italic variable WOFF2 subset retained locally for self-hosting |
| `public/licenses/manrope-OFL-1.1.txt` | The Manrope Project Authors | SIL Open Font License 1.1 | Distributed licence notice for Manrope | None |
| `public/licenses/newsreader-OFL-1.1.txt` | The Newsreader Project Authors | SIL Open Font License 1.1 | Distributed licence notice for Newsreader | None |
| `public/assets/open-access/met-389774-1600w.avif` and `.webp` | The Metropolitan Museum of Art, “Drawing for an Interior” (Anonymous Italian, 18th century), object 389774 | Public Domain | Homepage, Editions, Stories archival plate | Cropped/resized derivatives generated from preserved original; AVIF/WebP |
| `public/assets/open-access/met-390163-1600w.avif` and `.webp` | The Metropolitan Museum of Art, “Interior of a Drawing Room” (Anonymous Italian, 19th century), object 390163 | Public Domain | Homepage, Private Commissions, Stories archival plate | Cropped/resized derivatives generated from preserved original; AVIF/WebP |
| `public/adel-mark.svg` | House Adel project owner, supplied `adel mark.svg` | Project-owned | Persistent navigation mark | Byte-for-byte copy; no redraw |

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

An acquired record remains unusable until a human verifies its rights, context, crop, colour treatment, alt text, public credit, page list, and any privacy, publicity, trademark, or cultural-sensitivity restrictions, then records `approvedBy` and `approvedAt` in `data/assets.json`. Both Met records are approved for the current local production direction by House Adel creative-direction review on 2026-08-03.

## Verification

The provenance audit checks production image files against `data/assets.json`. Run:

```powershell
npm run audit:provenance
npm run audit:assets
```

Verified 2026-08-03: the provenance audit found the approved Met derivatives and no unrecorded production image. The public asset-size audit includes the two responsive archival sets and the three local WOFF2 font files.
