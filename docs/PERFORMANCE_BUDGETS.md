# Performance budgets

These are release gates for the first production version. Local lab values are evidence, not field Core Web Vitals; public field data must replace assumptions after launch.

## Experience budgets

| Measure | Budget |
| --- | ---: |
| Largest Contentful Paint | ≤ 2,500 ms in the local mobile-simulated gate |
| Interaction to Next Paint | ≤ 200 ms target; field measurement required after launch |
| Cumulative Layout Shift | ≤ 0.10 |
| Desktop frame interval p95 during the sampled state | ≤ 25 ms |
| Mobile frame interval p95 during the sampled state | ≤ 34 ms, preserving at least 30 FPS |
| Encoded resources for any measured cold route | ≤ 950 KiB |
| Canvas DPR | ≤ 1.5 desktop and ≤ 1.25 mobile |
| Main-thread task | no observed task over 200 ms in the sampled load |
| Horizontal overflow | ≤ 1 CSS pixel at every tested viewport |

## Loading policy

- The static ivory opening and semantic typography render before WebGL.
- Homepage WebGL is route-local and lazy. No unrelated route may request the WebGL chunk.
- The canvas uses procedural geometry and no production texture payload in version one.
- Later assets remain outside the opening preload and are loaded only as their section approaches.
- Production source maps are disabled unless explicitly requested for a controlled deployment.
- The Apply route may carry the form/schema bundle; that cost must not enter the homepage.

## Rendering policy

- Cap canvas DPR by device tier; do not follow a high-density display without a ceiling.
- Use no real-time shadows or post-processing on mobile.
- Pause or invalidate rendering when the homepage stage is outside view and when the document is hidden.
- Reduced-motion and explicit no-WebGL modes must create no canvas.
- A failed enhancement leaves the static composition visible and must not move semantic content.

## Enforcement

`npm run audit:performance` creates `docs/performance-results.json` from a production preview and fails if the measurable budgets above are exceeded. Lighthouse is a separate simulated lab check through `npm run audit:lighthouse`.
