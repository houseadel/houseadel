# Production status

Last updated: 2026-08-03

## Current milestone

**Phase 7 is complete for local production.**

The production Vite build contains every required route and interaction: the static-first procedural homepage, Edition SVG masks and live demonstration, Private Commissions atelier table, Stories archive and reusable details, The House path, and the Living Brief application. Core content remains semantic and usable with reduced motion or no WebGL. No raster or generative media ships.

The superseded Moving House direction remains recoverable on branch `phase-1-research` at commit `7ec9c97`; it is absent from the production route and asset graph.

## Production architecture

- Home, Apply, and the Private Commissions introduction are synchronous business-critical shells. The Apply form and Private Commissions editorial body load as separate content chunks.
- Other direct routes are split and warmed only for the requested path. Homepage WebGL and its GSAP timeline are route-local and requested on visitor intent, with a quiet 12-second fallback; other route motion uses deferred GSAP imports.
- The homepage renders its complete CSS/SVG master frame before the optional procedural canvas. Reduced motion, forced colours, Save-Data, failed WebGL, and explicit no-WebGL preferences retain the static experience.
- Newsreader and Manrope are local OFL files with `font-display: optional` and no document preload. Visual tests and production captures explicitly warm the fonts before comparison.
- The application has independent client/server Zod validation, sanitisation, a 64 KiB JSON limit, honeypot, optional Turnstile, and mock/email/Google Sheets provider boundaries. Mock mode is explicitly local and non-persistent.

Every Edition and Story is labelled `House Adel Study — Self-initiated.` No client, wedding, result, award, press item, location, testimonial, or team member is fabricated.

## Final verification

| Check | Final local result |
| --- | --- |
| Production cross-engine Playwright | 133 passed, 35 skipped, 0 failed |
| Accessibility Playwright/Axe | 93 passed, 5 skipped, 0 failed |
| Visual regression | 26 passed, 52 configured skips, 0 failed |
| Production captures | `output/playwright/final-production/manifest.json` is `complete`; 80 screenshots generated at 2026-08-03T03:47:37.926Z, including all routes at 1440×900, 1024×768, 430×932, and 390×844 plus interaction, fallback, master-frame, and spatial-sequence states |
| Runtime budgets | All 7 measured route/viewport entries passed. Home desktop: 490 KiB, LCP 184 ms, frame p95 16.8 ms. Home mobile: 490 KiB, LCP 172 ms, frame p95 16.8 ms. Full evidence is in `docs/performance-results.json` |
| Lighthouse | Home 97 / LCP 2,111 ms; Editions 97 / 2,130 ms; Private Commissions 98 / 2,005 ms; Apply 96 / 2,299 ms. Every measured route has accessibility 100, best practices 100, and CLS 0 |
| Build and assets | Final lint, typecheck, unit, production-build, structure, provenance, public-asset, dependency, and bundle gates passed. The provenance audit found 0 production images; public media is limited to 3 local fonts totalling 144 KiB |

Local runtime and Lighthouse results are lab evidence, not field Core Web Vitals. The runtime report records headless Chromium GL readback messages separately from application console output because the harness itself can trigger them.

## Known production compromises and test qualifications

- The isolated Three.js/React Three Fiber WebGL chunk is approximately 231 KiB gzip. It is requested only on the homepage after intent and is never required for content or navigation.
- Optional, non-preloaded fonts protect the critical path but can leave a first-time slow visitor on the compatible fallback face for that page view. Screenshot and visual-regression harnesses warm the local fonts for deterministic comparison.
- Playwright's Windows WebKit harness cannot reliably exercise a small set of keyboard-specific cases; those cases are skipped there rather than reported as false failures. Equivalent keyboard flows pass in Chromium, Firefox, and Edge, and the remaining WebKit coverage passes. Physical Safari/VoiceOver validation remains required.
- Local mock submissions are in-memory and the development rate limiter is process-local. Neither is a public multi-instance delivery system.

## Requirements before public launch

- Select a host that rewrites document routes to `index.html` and deploys the same server-owned `POST /api/applications` contract.
- Credential and verify either the email webhook or Google Sheets provider. If Turnstile is enabled, configure both keys; use a shared rate-limit store for multi-instance deployment.
- Verify that `studio@houseadel.com` is active and monitored, and complete human review of pricing, availability, founder language, Privacy, Terms, and all public business claims.
- Test on physical iPhone Safari, Android Chrome, an ordinary integrated-graphics Windows laptop, and representative assistive technology. Collect field LCP, INP, and CLS after deployment.
- Confirm the deliberately image-free, code-native art direction for launch. Any later photography, scans, archival objects, or client material require human approval and complete provenance.

## Environment required for non-mock deployment

- Provider: `HOUSE_ADEL_APPLICATION_PROVIDER`.
- Email mode: `HOUSE_ADEL_EMAIL_WEBHOOK_URL`; optional `HOUSE_ADEL_EMAIL_WEBHOOK_TOKEN`.
- Google Sheets mode: `HOUSE_ADEL_GOOGLE_SHEETS_ID`, `HOUSE_ADEL_GOOGLE_SHEETS_RANGE`, and `HOUSE_ADEL_GOOGLE_SERVICE_ACCOUNT_JSON`.
- Optional Turnstile: paired `VITE_TURNSTILE_SITE_KEY` and `HOUSE_ADEL_TURNSTILE_SECRET_KEY`.
- Optional deployment settings: `HOUSE_ADEL_TRUST_PROXY`, `HOUSE_ADEL_BUILD_SOURCEMAPS`.
- Asset acquisition only: `SMITHSONIAN_API_KEY`.
