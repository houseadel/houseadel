# Information Architecture

Last updated: 2026-09-04

## Global frame

The public architecture is deliberately limited to four primary destinations: Home, Work, Studies, and Contact. Home and Work are chapters of one continuous document: each owns a real path, and moving between them is a scroll rather than a navigation, with the address rewritten as a chapter takes the viewport. Studies and Contact are routes of their own, reached by navigating. The global frame contains a skip link, House Adel mark, EN/ID control, explicit sound control, full-screen primary menu, page-change transition, and footer. Native links, browser Back/Forward, deep links, focus restoration, and semantic document headings remain authoritative.

Sound is off by default. WebGL and motion are progressive enhancements. Language preference is local to the visitor and updates the document language.

## Primary routes

| Route | Purpose | Required content |
| --- | --- | --- |
| `/` | Say who the studio is for and what it does, and show the work. | Static-first spatial opening; two statements and no more, the first naming practices, studios and brands ahead of singular occasions, the second naming the disciplines; the work index; the closing ask. No services, process or capability sections. |
| `/work` | Hold delivered client work. | MARVELL 20 only until a second genuine project exists; no placeholder cards and no fabricated availability. Delivered work only: nothing self-initiated appears here. |
| `/studies` | Show what the studio builds without a brief, and say plainly that it is not client work. | Its own route, not a chapter of the document. One statement, then the studies themselves, each with one sentence, its disciplines and where it can be seen. Currently empty, and the page states that rather than filling the frame. |
| `/contact` | Take the enquiry. | One statement, the EN/ID enquiry form directly beneath it with validation and honest provider response, and the studio's direct channels as a quieter way out. No fit, boundaries, process, price or budget copy. |

`/begin-a-project` remains a compatibility alias for the Contact inquiry page but does not appear in primary navigation. `/marvell-20` is the project page reached from the work index.

## Utility routes

| Route | Purpose |
| --- | --- |
| `/enquiry-received` | Shows either a confirmed EN/ID receipt or an explicit unconfirmed state. |
| `/privacy` | Privacy and retention information. |
| `/terms` | Terms information. |

Unknown routes render an honest not-found state. Production hosting must rewrite document requests to `index.html` while continuing to serve real static assets directly.

## Core content models

### Project

- Client-approved title and disclosure level.
- The one sentence that represents the project in any index.
- Overview, the website itself, and what ran alongside it.
- Scope, delivery context, credits, and asset provenance.
- No fabricated client, celebration, result, testimonial, or performance claim.
- No capability the studio does not have: see the envelope in `docs/POSITIONING.md`.

### Enquiry

- Project context, described in the enquirer's own words rather than chosen from a category list.
- Functional needs.
- One thing that belongs to the project.
- Optional detail and references.
- Contact and explicit consent.
- No budget or price question of any kind.
- Local draft, progress state, server validation, and provider-confirmed receipt.

## Primary journeys

1. A new visitor enters Home, understands who the studio is for without waiting for animation to complete, and descends into Work.
2. An evidence-seeking visitor opens Work directly, sees the single real project, and can continue to Studies or Contact without encountering placeholder fiction.
3. A visitor judging capability rather than client history opens Studies and finds either the pieces or an honest statement that there are none yet.
4. A prospective client opens Contact directly, completes the enquiry form, and receives a receipt only after provider acceptance.
5. An Indonesian-speaking visitor can change language from any primary page and complete the same enquiry path with translated labels, options, errors, and receipt states.

## Resilience

- All primary content exists in semantic HTML.
- Reduced motion removes route-cover travel, camera travel, scrub sequences, and ornamental interpolation.
- No-WebGL, Save-Data, forced-colour, hidden-document, and graphics-failure paths retain both Home statements in full.
- Menu, language, sound, and enquiry controls are keyboard and touch operable.
- Audio never starts without explicit visitor action.
