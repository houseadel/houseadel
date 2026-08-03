# House Adel

Production website for House Adel, an independent digital house creating authored wedding invitation Editions and original Private Commissions.

The permanent creative direction is **Ceremonial Spatial Editorialism**: formal architectural composition softened by intimate, human material. An Edition begins with a world created by House Adel. A Private Commission begins with the client’s world.

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

- `/` — Home
- `/editions` and `/editions/:slug` — House Editions and live invitation demonstrations
- `/private-commissions` — Private Commissions
- `/stories` and `/stories/:slug` — Stories archive and study detail
- `/the-house` — The House
- `/apply` — Living Brief application
- `/application-received` — provider-confirmed receipt state
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

## Applications

Local development defaults to an honest, non-persistent mock provider. Copy `.env.example` to a local environment file only when configuring email, Google Sheets, or Turnstile. Never expose server credentials through `VITE_` variables. A receipt page is shown only after the server explicitly accepts a valid application.

## Assets

No generative media is permitted. Production imagery must be project-owned, manually approved licensed material, or verified public-domain/CC0 material recorded in `data/assets.json`. Run `npm.cmd run assets:fetch -- --help` for the fail-closed Met, Rijksmuseum, and Smithsonian acquisition workflow.

Current milestone and unresolved launch work are recorded in `docs/STATUS.md`.
