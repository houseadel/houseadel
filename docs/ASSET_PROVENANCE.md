# Asset provenance

Last updated: 2026-08-13

## Production statement

House Adel version one ships no generative-AI image, generative-AI video, AI-created person, stock footage, or generated 3D asset. The invitation uses seven manually reviewed photographs under the Pexels License as a coherent late-afternoon-to-night demonstration sequence. Neutral alternative text and the media configuration deliberately avoid identifying stock subjects as Amara and Daniel or presenting the chapel and glasshouse images as documentary evidence of the named venues. Two verified public-domain Met artworks remain in the public asset set; neither artwork is used within `/invitation`.

`data/assets.json` is the authority for stored production imagery. Browser screenshots under `output/` are QA evidence and are not copied into the deployed build.

## Files distributed with the site

| File | Creator/source | Rights | Use | Transformations |
| --- | --- | --- | --- | --- |
| `public/fonts/manrope-latin-variable.woff2` | The Manrope Project Authors | SIL Open Font License 1.1 | Neutral grotesk for navigation, metadata, forms, and text | Latin variable WOFF2 subset retained locally for self-hosting |
| `public/fonts/newsreader-latin-variable.woff2` | The Newsreader Project Authors | SIL Open Font License 1.1 | Editorial serif for display type and ceremonial hierarchy | Latin upright variable WOFF2 subset retained locally for self-hosting |
| `public/fonts/newsreader-latin-variable-italic.woff2` | The Newsreader Project Authors | SIL Open Font License 1.1 | Restrained italic from the same serif family | Latin italic variable WOFF2 subset retained locally for self-hosting |
| `public/fonts/cormorant-garamond-regular.ttf` and `-italic.ttf` | Christian Thalmann and the Cormorant Project Authors, distributed by Google Fonts | SIL Open Font License 1.1 | The invitation's softer ceremonial display and text family | Upright and italic static font files retained locally for self-hosting; no runtime third-party font request |
| `public/licenses/manrope-OFL-1.1.txt` | The Manrope Project Authors | SIL Open Font License 1.1 | Distributed licence notice for Manrope | None |
| `public/licenses/newsreader-OFL-1.1.txt` | The Newsreader Project Authors | SIL Open Font License 1.1 | Distributed licence notice for Newsreader | None |
| `public/assets/house-adel/sound/*.m4a` | House Adel project owner, “HOUSE ADEL — Sonic Identity v4” | **Pending verification.** Composer, licence and any third-party sample content unconfirmed. Launch blocker. | Press, route transition, loader bed and resolve, type resolving and receding, background score | Transcoded from supplied WAV/MP3 to AAC: cues mono 96 kbps, score stereo 72 kbps |
| `public/assets/house-adel/relief-depth-2048.png` and `-1024.png` | House Adel project owner, supplied `3d relief.stl` | **Pending verification.** Originating scan, sculpture, photographer and licence unconfirmed. Launch blocker. | The home page relief, rendered as a particle surface | Height baked by `scripts/bake-relief-depth.mjs`; carved axis and depth polarity detected, cropped to the slab, dilated and median-despeckled |
| `public/assets/house-adel/home-cloud.bin` | House Adel project owner, supplied `assets/originals/open-access/3d/home.stl` | **Owner-confirmed for commercial use.** Originating sculpture, scan creator and licence URL still to be recorded here. | Depth-shaded particle homepage sculpture | Area-sampled to 150,000 points with quantized positions and packed normals |
| `public/assets/house-adel/cupid-cloud.bin` | House Adel project owner, supplied `assets/originals/open-access/3d/cupid.stl` | **Owner-confirmed for commercial use.** Originating sculpture, scan creator and licence URL still to be recorded here. | Depth-shaded particle sculpture beside the Contact enquiry | Area-sampled to 150,000 points with quantized positions and packed normals |
| `public/assets/house-adel/work-cloud.bin` | House Adel project owner, supplied `assets/originals/open-access/3d work.stl` | **Pending verification.** Originating sculpture, scan creator and licence unconfirmed. Launch blocker. | Global footer particle sculpture | Surface area-sampled to 160,000 points with quantized positions and packed normals; the Z-up source is oriented upright at runtime |
| `public/assets/house-adel/tree-cloud.bin` | House Adel project owner, supplied `assets/originals/open-access/3d/island_tree_02_4k.glb` | **Pending verification. Launch blocker.** The `*_4k.glb` naming and the accompanying `.blend.zip` are the distribution convention of a well-known CC0 3D library, but a naming convention is not a licence. Source URL and licence to be recorded before launch. | The Work chapter's forest canopy | Area-sampled to a 39,000-point cloud with quantized positions and packed normals |
| `public/assets/house-adel/fern-cloud.bin` | House Adel project owner, supplied `assets/originals/open-access/3d/fern_02_4k.glb` | **Pending verification. Launch blocker.** As above: source URL and licence to be recorded before launch. | The Work chapter's undergrowth | Area-sampled to a 30,000-point cloud with quantized positions and packed normals |
| `public/assets/house-adel/dove-cloud.bin` | House Adel project owner, supplied `assets/originals/open-access/3d/dove.glb` | **Pending verification.** Not currently referenced by any runtime code; shipped but unused. | None at present | Area-sampled point cloud |
| `public/assets/house-adel/periwinkle-cloud.bin` | House Adel project owner, supplied `assets/originals/open-access/3d/periwinkle_plant_4k.glb` | **Pending verification.** Not currently referenced by any runtime code; shipped but unused. | None at present | Area-sampled point cloud |
| `public/assets/marvell-20/marvell-20-*.avif` and `.webp` | House Adel, commissioned work for Marvell Florist | Studio's own delivered work, shown as portfolio under clause 12 of the Terms | The MARVELL 20 project page and the Work index | Responsive AVIF and WebP encoding of screen captures |
| `public/preview.png` | House Adel | Project-owned; composed from the studio's own Work-chapter render | Open Graph and Twitter social card | Composed at 1200×630 |
| `public/adel-mark.svg` | House Adel project owner, supplied `adel mark.svg` | Project-owned | Persistent navigation mark | Byte-for-byte copy; no redraw |
| `public/assets/invitation/redon-bouquet-*` | Odilon Redon, *Bouquet of Flowers*, ca. 1900–1905, The Metropolitan Museum of Art, object 437379 | Public Domain / The Met Open Access | Stored legacy asset and Work preview; not used by `/invitation` | Responsive AVIF and WebP encoding; no content alteration |
| `public/assets/invitation/hiroshige-morning-glories-*` | Utagawa Hiroshige, *Morning Glories*, ca. 1847, The Metropolitan Museum of Art, object 39648 | Public Domain / The Met Open Access | Stored legacy asset; no longer referenced by `/invitation` | Responsive AVIF and WebP encoding; no content alteration |
| `public/assets/invitation/story/hands-*` | Scott Broome, Unsplash image `4KlDZK1xWqw` | Unsplash License | Invitation opening | Responsive AVIF and WebP encoding; no content alteration |
| `public/assets/invitation/story/chapel-*` | Debby Hudson, Unsplash image `sgdyBq6kheQ` | Unsplash License | Invitation place chapter; atmospheric, not documentary venue photography | Responsive AVIF and WebP encoding; no content alteration |
| `public/assets/invitation/story/field-*` | Jake Johnson, Unsplash image `XRrQzwkH300` | Unsplash License | Invitation couple chapter; subjects are not identified as the named couple | Responsive AVIF and WebP encoding; no content alteration |
| `public/assets/invitation/story/table-*` | Joshua Manjgo, Unsplash image `5RfyQ9urdx0` | Unsplash License | Invitation dinner detail | Responsive AVIF and WebP encoding; no content alteration |
| `public/assets/invitation/story/dusk-*` | J. Balla Photography, Unsplash image `zQfToEi3z2Y` | Unsplash License | Invitation closing; subjects are not identified as the named couple | Responsive AVIF and WebP encoding; no content alteration |
| `public/assets/invitation/cinematic/touch-*` | Lada Rezantseva, Pexels 9551241 | Pexels License | Backlit joined-hands opening | Responsive AVIF/WebP encoding; presentation-only exposure and saturation treatment |
| `public/assets/invitation/cinematic/couple-veil-*` | TBD Tuyen, Pexels 36647760 | Pexels License | Intimate couple memory | Responsive AVIF/WebP encoding; presentation-only exposure and saturation treatment |
| `public/assets/invitation/cinematic/chapel-*` | Leonardo Barucci, Pexels 36937106 | Pexels License | Chapel atmosphere, not documentary venue photography | Responsive AVIF/WebP encoding; presentation-only exposure and saturation treatment |
| `public/assets/invitation/cinematic/glasshouse-*` | Josh Hild, Pexels 18816025 | Pexels License | Night glasshouse atmosphere, not documentary venue photography | Responsive AVIF/WebP encoding; presentation-only exposure and saturation treatment |
| `public/assets/invitation/cinematic/letter-*` | cottonbro studio, Pexels 6752323 | Pexels License | Handwritten-memory and practical-information atmosphere | Responsive AVIF/WebP encoding; presentation-only exposure and saturation treatment |
| `public/assets/invitation/cinematic/sunlight-veil-*` | Alina Chernii, Pexels 30175883 | Pexels License | Vellum entrance, anticipation, and reply light | Responsive AVIF/WebP encoding; presentation-only exposure and saturation treatment |
| `public/assets/invitation/cinematic/closing-*` | Ravi Roshan, Pexels 20183377 | Pexels License | Dusk closing with joined hands | Responsive AVIF/WebP encoding; presentation-only exposure and saturation treatment |

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

### Sculptures withdrawn on 2026-08-17

`love.stl` (homepage) and `davidd.stl` (Contact) were replaced by `home.stl` and `cupid.stl`, which the project owner confirms are licensed for commercial use where the previous pair were not. Their baked derivatives — `love-cloud.bin`, `love-solid.glb` and `david-cloud.bin` — have been deleted from `public/` so they are no longer published, and nothing in `src/` references them. The source STLs remain outside the build in `assets/originals/`.


## Launch licence review

Nothing below is a reason to delete an asset. Each is a question that has to be
answered by the studio owner before the site is public, because the answer is
not derivable from the repository.

**Blocking — record the source and licence, or replace the asset:**

1. `public/assets/house-adel/sound/*.m4a` — the whole sonic identity. Composer,
   licence, and whether any third-party sample content is present, all
   unconfirmed. This is sixteen files including a five-and-a-half-megabyte score.
2. `public/assets/house-adel/relief-depth-2048.png` / `-1024.png` — baked from
   `3d relief.stl`. Originating sculpture, scan creator and licence unconfirmed.
3. `public/assets/house-adel/work-cloud.bin` — baked from `3d work.stl`. Same
   question, unanswered.
4. `public/assets/house-adel/tree-cloud.bin` and `fern-cloud.bin` — the entire
   Work chapter. The file naming points at a CC0 library, and pointing is not
   proof.

**Blocking, and specifically about scans:** a sculpture being centuries old does
not put a modern 3D scan of it in the public domain. The scan is a separate work
with its own author and its own licence, and several 3D libraries distribute
scans of public-domain sculpture under terms that restrict commercial use or
require attribution. `home-cloud.bin` and `cupid-cloud.bin` are recorded above as
owner-confirmed for commercial use; that confirmation still needs a source URL
and a licence name written down beside it, because "confirmed" with nothing to
point at is not something that can be relied on later.

**Not blocking:**

- `dove-cloud.bin` and `periwinkle-cloud.bin` are shipped but unreferenced. They
  are 639 KB of payload nobody downloads, since nothing requests them. Left in
  place rather than deleted, per the rule that an asset is not removed merely
  because no import is currently obvious.
