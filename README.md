# House Adel

Production website for House Adel, an independent web studio making art-directed websites for professional practices, design studios and service brands, and for singular occasions.

The permanent creative direction is **Ceremonial Spatial Editorialism**: formal architectural composition softened by intimate, human material. The studio's strength is composition — layout, typography, motion, interaction, image treatment, sequencing and transitions — and it does not claim original 3D pipelines, custom installations, VR systems, multiplayer experiences or campaign-scale engineering. `docs/POSITIONING.md` holds the client picture, the internal service levels and the capability envelope; `docs/COPY_APPROVED.md` is the canonical copy and `docs/VOICE.md` the writing rules.

The superseded research interface and Moving House direction are preserved on the `phase-1-research` branch. They are not part of the production site.

## Development

Node.js 22 or newer and npm are required.

```powershell
npm.cmd install
npm.cmd run dev
```

Open <http://127.0.0.1:5173/>. To inspect the production output:

```powershell
npm.cmd run build
npm.cmd run preview -- --port 4173
```

## Routes

- `/` and `/work` — the continuous home document; both are chapters of one mounted page, and moving between them is a scroll
- `/marvell-20` — the MARVELL 20 project page
- `/studies` — work made without a brief
- `/contact` — the enquiry form; `/begin-a-project` is a compatibility alias rendering the same page
- `/enquiry-received` — provider-confirmed receipt state
- `/privacy` and `/terms` — legal information

## Verification

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run test:e2e
npm.cmd run test:a11y
npm.cmd run build
npm.cmd run analyze:bundle
npm.cmd run audit:provenance
npm.cmd run audit:performance
npm.cmd run audit:lighthouse
```

Playwright browser binaries must be installed once with `npx.cmd playwright install`.

## Enquiries

Local development defaults to an honest, non-persistent mock provider. Copy `.env.example` to a local environment file only when configuring email, Google Sheets, or Turnstile. Never expose server credentials through `VITE_` variables. A receipt page is shown only after the server explicitly accepts a valid enquiry.

## Assets

No generative media is permitted. Production imagery must be project-owned, manually approved licensed material, or verified public-domain/CC0 material recorded in `data/assets.json`. Run `npm.cmd run assets:fetch -- --help` for the fail-closed Met, Rijksmuseum, and Smithsonian acquisition workflow.

Current milestone and unresolved launch work are recorded in `docs/STATUS.md`.
