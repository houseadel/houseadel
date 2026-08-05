# Production status

Last updated: 2026-08-04

## Current review milestone

The requested three-page House Adel architecture is implemented and ready for visual review:

- Home introduces the world, proposition, process, optional spatial opening, and operable capability instrument.
- Work is a truthful empty archive with a reserved Request / Response / Glimpse case-study structure. No client work is invented.
- Commissions explains accepted work, boundaries, the relationship, practical facts, and a detailed staged enquiry.

The global frame includes the House Adel favicon/mark, English/Indonesian preference, opt-in synthesized sound, keyboard-safe full-screen navigation, page-change choreography, production loader, mobile states, reduced motion, and static/no-WebGL fallbacks. `/labs/loader` remains available as the isolated regression lab.

No reference assets, fonts, code, copy, layouts, shaders, marks, or distinctive compositions were used. No new dependency was installed. The implementation uses the existing self-hosted Newsreader and Manrope families, approved public-domain Met material, GSAP, and progressive Three/R3F architecture.

## Verification

| Check | Result |
| --- | --- |
| ESLint | Passed with zero warnings. |
| Strict TypeScript | Passed. |
| Vitest | 6 passed. |
| Production + loader Playwright | 48 passed; 18 project-inapplicable skips across Chromium, mobile Chromium, and reduced motion. |
| Accessibility / Axe | 19 passed; 1 desktop-only touch-target skip across Chromium and mobile Chromium. |
| Visual regression | 12 passed; 24 project-inapplicable skips. Local fonts are warmed before comparison for deterministic baselines. |
| Production build | Passed. Main app 17.92 KiB gzip; application form 40.05 KiB gzip; motion 44.40 KiB gzip; optional lazy WebGL 231.29 KiB gzip. |
| Production captures | Complete manifest with 39 screenshots in `output/playwright/final-production`, covering primary routes at four viewports plus Indonesian, menu, application validation/review, reduced-motion, no-WebGL, master-frame, and spatial states. |
| Structure / assets / provenance | Passed. All 13 production image files have provenance records. |
| Runtime budgets | All 6 current route/viewport cases passed. Home 931 KiB, Work 532 KiB, Commissions 574 KiB; LCP 152–200 ms and frame p95 16.7–16.8 ms in the local harness. |
| Bundle analysis | Generated at `output/bundle-report.html`. |

Local runtime numbers are lab evidence, not field Core Web Vitals. The approximately 231 KiB gzip WebGL chunk is lazy, Home-only, and never required for content or navigation.

## Requirements before public launch

- Configure and verify a real server-owned application provider. Local mock acceptance is intentionally non-persistent and is not public delivery.
- Verify that `studio@houseadel.com` is active and monitored; human-review minimum investment, availability, Privacy, Terms, and all business claims.
- Test audio, touch, keyboard, VoiceOver, and visual viewport behaviour on physical iPhone Safari, Android Chrome, and representative assistive technology.
- Confirm final art direction and archival crops with the creative owner. Any future client fragments or photography require explicit permission and complete provenance.
- Add real Work entries only after completed commissions are approved for publication.

## Environment for non-mock deployment

- Provider: `HOUSE_ADEL_APPLICATION_PROVIDER`.
- Email mode: `HOUSE_ADEL_EMAIL_WEBHOOK_URL`; optional `HOUSE_ADEL_EMAIL_WEBHOOK_TOKEN`.
- Google Sheets mode: `HOUSE_ADEL_GOOGLE_SHEETS_ID`, `HOUSE_ADEL_GOOGLE_SHEETS_RANGE`, and `HOUSE_ADEL_GOOGLE_SERVICE_ACCOUNT_JSON`.
- Optional Turnstile: paired `VITE_TURNSTILE_SITE_KEY` and `HOUSE_ADEL_TURNSTILE_SECRET_KEY`.
- Optional deployment settings: `HOUSE_ADEL_TRUST_PROXY`, `HOUSE_ADEL_BUILD_SOURCEMAPS`.
