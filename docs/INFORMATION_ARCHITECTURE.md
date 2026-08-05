# Information Architecture

Last updated: 2026-08-04

## Global frame

The public architecture is deliberately limited to three primary destinations: Home, Work, and Commissions. The global frame contains a skip link, House Adel mark, EN/ID control, explicit sound control, full-screen primary menu, page-change transition, and footer. Native links, browser Back/Forward, deep links, focus restoration, and semantic document headings remain authoritative.

Sound is off by default. WebGL and motion are progressive enhancements. Language preference is local to the visitor and updates the document language.

## Primary routes

| Route | Purpose | Required content |
| --- | --- | --- |
| `/` | Introduce the world, judgement, and technical capability of the studio. | Static-first spatial opening; clear wedding-website proposition; operable capability instrument; process; honest archive status; commission invitation. |
| `/work` | Hold completed commissions when they exist. | Truthful empty state now; reserved case-study anatomy showing Request, Response, and Glimpse without invented projects or outcomes. |
| `/commissions` | Explain fit, relationship, and enquiry. | Accepted work; boundaries; working relationship; practical facts; privacy; detailed but staged EN/ID Living Brief with validation, review, and honest provider response. |

`/private-commissions`, `/apply`, and `/begin-a-project` remain compatibility aliases for the Commissions page but do not appear in primary navigation.

## Utility routes

| Route | Purpose |
| --- | --- |
| `/application-received` | Shows either a confirmed EN/ID receipt or an explicit unconfirmed state. |
| `/privacy` | Privacy and retention information. |
| `/terms` | Terms information. |
| `/labs/loader` | Isolated loader review route retained for regression and fallback testing. |

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
2. An evidence-seeking visitor opens Work directly, sees the truthful archive status, and can continue to Commissions without encountering placeholder fiction.
3. A prospective client opens Commissions directly, checks fit and boundaries, understands the relationship, completes the Living Brief, reviews it, and receives a receipt only after provider acceptance.
4. An Indonesian-speaking visitor can change language from any primary page and complete the same enquiry path with translated labels, options, errors, review content, and receipt states.

## Resilience

- All primary content exists in semantic HTML.
- Reduced motion removes route-cover travel, camera travel, scrub sequences, and ornamental interpolation.
- No-WebGL, Save-Data, forced-colour, hidden-document, and graphics-failure paths retain the complete Home proposition.
- Menu, capability layers, language, sound, and application controls are keyboard and touch operable.
- Audio never starts without explicit visitor action.
