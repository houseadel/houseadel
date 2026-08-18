# House Adel Production Contract

## Product

House Adel is an independent web studio working across art direction, interaction design and frontend development for weddings, birthdays, dinners, launches and private events. No individual is named anywhere on the site or in copy: the studio speaks as the studio. The permanent creative direction is **Ceremonial Spatial Editorialism**: formal architectural composition softened by intimate, human material.

House Adel's one published project is MARVELL 20, a digital experience created for Marvell Florist's twentieth anniversary. **MARVELL FLORIST is not House Adel work** — never present Marvell Florist's general website, branding or campaigns as House Adel work; only the MARVELL 20 project is shown. Both names use two Ls: MARVELL FLORIST, MARVELL 20.

Correct spelling: **House Adel** (no trailing "e" in Adel). Correct email: `hello.houseofadel@gmail.com`. Correct Instagram: `@thehouseadel`.

`docs/COPY_APPROVED.md` is the literal canonical copy for every fixed page; `docs/VOICE.md` states the writing rules (no em dashes, no fashion-luxury vocabulary, no "commission"/"investment," no budget or price mentions anywhere on the site, short paragraphs) for anything `docs/COPY_APPROVED.md` doesn't already fix. Do not paraphrase what is already fixed there.

## Commands

Use npm and the existing Vite, React, and TypeScript stack.

- `npm install` - install locked dependencies.
- `npm run dev` - run the local site.
- `npm run lint` - run ESLint with zero warnings permitted.
- `npm run typecheck` - run strict TypeScript validation.
- `npm run build` - run type checking and create a production build.
- `npm test` - run Vitest.
- `npm run test:e2e` - run Playwright route and interaction tests.
- `npm run test:a11y` - run the Playwright accessibility suite.
- `npm run test:e2e:update` - intentionally update reviewed Playwright visual baselines.
- `npm run capture:production` - build and capture the required route/state screenshot manifest.
- `npm run audit:structure` - verify repository structure.
- `npm run audit:assets` - report public asset sizes.
- `npm run audit:provenance` - report production images without approved provenance records.
- `npm run audit:dependencies` - audit production dependencies.
- `npm run audit:performance` - measure cold production routes and enforce documented budgets.
- `npm run audit:lighthouse` - run the configured Lighthouse audit.
- `npm run analyze:bundle` - build and write the bundle visualisation outside `dist`.

Before completion, add and use explicit `lint`, `typecheck`, and bundle-analysis scripts. Record any proposed dependency in `docs/DECISIONS.md` before installation.

## Component conventions

- Keep routes, editorial sections, interactions, and data/configuration in small reviewable modules. Do not create a monolithic homepage or animation file.
- Use semantic HTML for navigation, headings, text, links, images, controls, and forms. Canvas is progressive enhancement only.
- Keep project content and theme data in typed configuration. CMS content must not execute arbitrary interaction code.
- Use CSS custom properties for tokens and locally scoped styles for components. Avoid a general-purpose UI library.
- Preserve direct routes, deep links, browser Back/Forward, focus, interruption, and animation cleanup.
- Use the existing stack when it is sound. Do not rewrite working code or add overlapping libraries without a recorded reason.
- Build complete static structure and responsive grey-box states before complex motion.

## Design non-negotiables

- Lead with typography, architectural grids, negative space, deliberate asymmetry, restrained colour, and physical material cues.
- Use warm ivory, ink, soft stone, a scarce garnet or oxblood, and a restrained metallic accent. Avoid constant dark mode and generic luxury black-and-white styling.
- Use one legally available editorial serif and one neutral grotesk; an italic may come from the serif family.
- Materials may include paper, vellum, glass, ink, handwriting fragments, archival material, lines, frames, folds, and apertures.
- Do not use generative-AI images, video, people, wedding photography, or 3D assets.
- Do not fabricate clients, projects, testimonials, awards, press, results, locations, or team members. Show only MARVELL 20 as completed work until another genuine House Adel project exists; never present Marvell Florist's general branding as House Adel work.
- Do not copy reference assets, copy, code, layouts, shaders, marks, or distinctive compositions. References are behavioural only and never appear publicly.
- Avoid marketplace cards, cyber aesthetics, generic particles, rotating chrome, literal cursor trails, preset animation patterns, and decorative WebGL.
- A cursor companion that supplements — and never hides or replaces — the native OS cursor is permitted as a state-feedback device. Magnetic hover on primary interactive elements is permitted within the documented timing bands. A marquee is permitted only where it carries real, reachable content with a static assistive-technology equivalent, never as decorative loop-filler.

## Motion rules

- Motion must establish hierarchy, change spatial context, reveal material, introduce a project, explain a process, demonstrate product function, or provide meaningful feedback.
- The motion grammar is assembly, disassembly, uncovering, framing, folding, depth change, light movement, and typographic masking.
- Use GSAP contexts and clean up every timeline and ScrollTrigger. Use CSS for simple local state changes.
- Use native scrolling. Do not pin for excessive distances or make content depend on animation completion.
- Use viewport-specific setups. Pause inactive and hidden-document rendering, cap canvas DPR, and avoid mobile post-processing and real-time shadows.
- Do not animate every element, make every text block fade upward, autoplay audio, or use animation to disguise weak layout.

## Accessibility and resilience

- Provide skip navigation, logical headings, visible focus, keyboard operation, useful labels and errors, and touch targets of at least 44 by 44 CSS pixels.
- Give hover interactions equivalent focus and mobile behaviour. Give every image intentional alternative text or mark it decorative.
- Respect reduced motion: remove camera travel and pinned scrub sequences, retain content, and use static states or short crossfades.
- Core content and navigation must survive no WebGL, slow connections, failed assets, forced colours, and reduced transparency.
- Never replace the browser cursor, block native scrolling, or hide essential information in canvas.
- Validate application data on both client and server. Do not expose credentials or imply a successful submission when no provider accepted it.

## Assets and licensing

- Only use project-owned assets, verified CC0/public-domain museum material, or manually approved licensed assets.
- Never scrape competitors, Google Images, or Pinterest.
- Record institution/creator, object ID, title, date, source URL, rights, retrieval date, transformations, and pages used in `data/assets.json` and `docs/ASSET_PROVENANCE.md`.
- Keep originals separate from derivatives, preserve credits, reject unclear rights, and never overwrite an asset silently.
- Do not commit secrets, private applicant data, or unverifiable media.

## Definition of done

The version is done only when all required routes (Home, Work, the MARVELL 20 project page, Contact, Begin a Project, Privacy) and navigation work; the homepage has a coherent optional spatial scene and static fallback; the Begin a Project enquiry form and mock submission are honestly functional; reduced-motion and no-WebGL modes preserve all content; no unlicensed, generative, or fabricated material ships; copy matches `docs/COPY_APPROVED.md` verbatim where fixed; provenance is complete; and lint, typecheck, unit, Playwright, accessibility, visual, production-build, bundle, and performance checks pass. `docs/STATUS.md` must disclose any remaining launch work.
