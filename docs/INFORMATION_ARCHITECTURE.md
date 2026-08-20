# Information Architecture

Last updated: 2026-08-17

## Global frame

The public architecture is deliberately limited to four primary destinations: Home, Work, Studies, and Commissions. Home and Work are chapters of one continuous document: each owns a real path, and moving between them is a scroll rather than a navigation, with the address rewritten as a chapter takes the viewport. Studies and Commissions are routes of their own, reached by navigating. The global frame contains a skip link, House Adel mark, EN/ID control, explicit sound control, full-screen primary menu, page-change transition, and footer. Native links, browser Back/Forward, deep links, focus restoration, and semantic document headings remain authoritative.

Sound is off by default. WebGL and motion are progressive enhancements. Language preference is local to the visitor and updates the document language.

## Primary routes

| Route | Purpose | Required content |
| --- | --- | --- |
| `/` | Introduce the world, judgement, and technical capability of the studio. | Static-first spatial opening; clear wedding-website proposition; operable capability instrument; process; honest archive status; commission invitation. |
| `/work` | Hold completed commissions when they exist. | Truthful empty state now; reserved case-study anatomy showing Request, Response, and Glimpse without invented projects or outcomes. Delivered work only: nothing self-initiated appears here. |
| `/studies` | Show what the studio builds without a brief, and say plainly that it is not client work. | Its own route, not a chapter of the document. Why the page exists; what a study is not; what the studio is working out now; the studies themselves, each with one sentence, its disciplines and where it can be seen. The wedding invitation demonstration is the lead entry. |
| `/commissions` | Explain fit, relationship, and enquiry. | Accepted work; boundaries; working relationship; practical facts; privacy; detailed but staged EN/ID Living Brief with validation, review, and honest provider response. |

`/begin-a-project` remains a compatibility alias for the Contact inquiry page but does not appear in primary navigation.

## Utility routes

| Route | Purpose |
| --- | --- |
| `/application-received` | Shows either a confirmed EN/ID receipt or an explicit unconfirmed state. |
| `/privacy` | Privacy and retention information. |
| `/terms` | Terms information. |

Unknown routes render an honest not-found state. Production hosting must rewrite document requests to `index.html` while continuing to serve real static assets directly.

## Core content models

### Commission case study

- Client-approved title and disclosure level.
- Request: the actual problem and constraints.
- Response: House Adel's reasoning and authored system.
- Glimpse: approved fragments of the result.
- Scope, delivery context, credits, and asset provenance.
- No fabricated client, celebration, result, testimonial, or performance claim.

### Application

- Celebration/project context.
- Functional needs.
- Story and material.
- Scope and working parameters.
- Contact and explicit consent.
- Local draft, progress state, editable review, server validation, and provider-confirmed receipt.

## Primary journeys

1. A new visitor enters Home, understands the proposition without completing animation, explores the capability instrument, then moves to Work or Commissions.
2. An evidence-seeking visitor opens Work directly, sees the truthful archive status, and can continue to Studies or Commissions without encountering placeholder fiction.
3. A visitor judging capability rather than client history opens Studies, reads what a study is and is not, and can open the wedding invitation demonstration or go and look at any piece named as running on this site.
4. A prospective client opens Commissions directly, checks fit and boundaries, understands the relationship, completes the Living Brief, reviews it, and receives a receipt only after provider acceptance.
5. An Indonesian-speaking visitor can change language from any primary page and complete the same enquiry path with translated labels, options, errors, review content, and receipt states.

## Resilience

- All primary content exists in semantic HTML.
- Reduced motion removes route-cover travel, camera travel, scrub sequences, and ornamental interpolation.
- No-WebGL, Save-Data, forced-colour, hidden-document, and graphics-failure paths retain the complete Home proposition.
- Menu, capability layers, language, sound, and application controls are keyboard and touch operable.
- Audio never starts without explicit visitor action.
