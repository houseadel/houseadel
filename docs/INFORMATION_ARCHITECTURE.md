# Information Architecture

## Global frame

The House Adel mark remains visible. The persistent primary navigation contains:

- Editions
- Private Commissions
- Stories
- The House
- Apply

Every page provides a skip link, semantic landmarks, visible focus, direct URLs, and a restrained footer containing contact, privacy, and terms. Native links preserve opening in a new tab and browser Back/Forward. The mobile menu exposes the same destinations with at least 44 by 44 CSS pixel targets and returns focus correctly when closed.

## Route map

| Route | Purpose | Required content and primary action |
| --- | --- | --- |
| `/` | Establish House Adel and route visitors by intent. | Spatial opening; House statement; Current Edition; Private Commissions; Selected Stories; Practice; The House; Apply. Actions: view an Edition or apply. |
| `/editions` | Present the living catalogue without ecommerce-card conventions. | Three truthful self-initiated editorial plates, each with number, title, atmosphere, availability, exact starting price, and live-experience link. |
| `/editions/[slug]` | Explain an Edition and let a visitor experience it. | Functional desktop/mobile live preview, sample personalisation, sample guest name, navigation, demonstration RSVP, optional language switch, included features, boundaries, investment, and selection CTA. |
| `/private-commissions` | Explain one-of-one commissioning. | Created once statement; fragment-to-identity atelier table; meaning; one distinct House Adel Study; process; disciplines; availability; minimum investment; Apply action. |
| `/stories` | Provide a useful archive from its first entries. | Typographic list of three or four substantial entries with a focus/hover stage; readable metadata; tap-based mobile flow; no premature filters. |
| `/stories/[slug]` | Show process and judgement through a reusable case-study system. | Context; Brief; Source material; Creative premise; Visual system; Information architecture; Guest experience; Motion and technology; Mobile experience; Result; Credits/provenance. One configured project interaction maximum. |
| `/the-house` | State why and how House Adel works. | Why House Adel exists; Founder; Approach; Disciplines; Standards; Closing statement. One continuous SVG line supplies the page's only major interaction. |
| `/apply` | Collect a useful living brief without interrogation. | Celebration; needs; story; scope; contact; fixed progress rail; live brief card; editable review; honest submission and error states. |
| `/application-received` | Confirm a provider-accepted application. | Required confirmation copy, next-step expectation, and route back to House Adel. Direct access without a valid submission state must not imply receipt. |
| `/privacy` | Explain data handling clearly. | Data collected, purpose, lawful/consent basis where applicable, storage, providers, retention, rights/contact, and local autosave behaviour. No invented legal claims. |
| `/terms` | State service and site terms. | Site use, intellectual property, enquiry status, Edition/Commission distinction, third-party services, and contact. Human legal review remains visible as a launch requirement. |
| `*` | Recover from an unknown URL. | Branded 404 with concise orientation and links to Editions, The House, and Apply. |

### Version-one concrete detail routes

The configured route table currently resolves these exact Edition paths:

- `/editions/threshold`
- `/editions/correspondence`
- `/editions/afterlight`

It resolves these exact Story paths:

- `/stories/threshold-an-invitation-as-entrance`
- `/stories/correspondence-the-guest-as-reader`
- `/stories/atlas-table-from-fragments-to-order`
- `/stories/afterlight-time-as-material`

All seven are explicitly self-initiated studies. An unknown Edition slug, unknown Story slug, or any other unknown path renders the same useful not-found document instead of a blank route.

## Core content models

### Edition

- slug, number, title, one-sentence atmosphere, status, price, timeframe, scope;
- exact `House Adel Study — Self-initiated.` label until factual commission material exists;
- House-controlled theme configuration: palette, type pairing, reveal mask, image set, metadata, optional microinteraction;
- included features, personalisation boundaries, sample demo data, provenance references.

An Edition theme may shape its demonstration, but it cannot replace House Adel navigation, weaken contrast, or alter semantic structure.

### Story

- slug, title, category, summary, date/year only when factual, cover/provenance references;
- ordered case-study sections;
- one interaction identifier selected from an approved registry, never executable CMS code;
- credits and asset provenance.

Initial categories may be Editions, Private, Studies, and Other Worlds. Filters stay hidden until volume makes them useful.

### Application

The application is one editorial page with five grouped sections:

1. **Your celebration:** applicant name; partner/project names; celebration date; location; approximate guest count; number of events; required launch date.
2. **What you need:** save the date; digital invitation; full site; RSVP; guest-specific invitations; multiple events; travel/accommodation; registry; multilingual content; photography; film; illustration; 3D/interactive; not sure yet.
3. **The story:** brief introduction; meaningful place/object/memory/atmosphere; desired guest feeling; reference links; optional existing site or mood-board link.
4. **Scope:** Edition; Private Commission; not sure; budget; deadline; languages; collaborators; confidentiality.
5. **Contact:** name; email; WhatsApp/phone; preferred method; country; time zone; best time; privacy consent.

The form permits uncertainty and does not require a long narrative. Non-sensitive progress may autosave locally. Submission requires client and server validation, sanitisation, size limits, honeypot, a rate-limit boundary, and an optional environment-controlled Turnstile boundary. Version one accepts links, not uploads.

Providers implement one contract: local/mock, email webhook, Google Sheets, or explicitly disabled. Missing credentials return an unavailable/error state; they never produce a false confirmation. Service-account and webhook credentials remain server-side. Mock mode accepts in memory for local verification and does not persist applicant data.

The optional Turnstile widget is client-visible only when `VITE_TURNSTILE_SITE_KEY` is configured; its token is verified server-side only when the paired `HOUSE_ADEL_TURNSTILE_SECRET_KEY` is configured. Provider selection uses `HOUSE_ADEL_APPLICATION_PROVIDER`. Email delivery uses `HOUSE_ADEL_EMAIL_WEBHOOK_URL` and optional `HOUSE_ADEL_EMAIL_WEBHOOK_TOKEN`; Sheets delivery uses `HOUSE_ADEL_GOOGLE_SHEETS_ID`, `HOUSE_ADEL_GOOGLE_SHEETS_RANGE`, and `HOUSE_ADEL_GOOGLE_SERVICE_ACCOUNT_JSON`. `HOUSE_ADEL_TRUST_PROXY` controls forwarded-address trust. None of these server values may enter the browser bundle.

## Primary journeys

### Edition visitor

Home -> Current Edition -> live Edition demonstration -> scope/investment -> Apply with Edition context preserved.

### Private Commission visitor

Home -> Private Commissions -> study/process/minimum investment -> Apply with Commission context preserved.

### Evidence-seeking visitor

Home or navigation -> Stories -> Story detail -> related offer or Apply.

### Returning applicant

Apply -> restored non-sensitive draft -> editable review -> provider-accepted submission -> Application Received.

## Resilience

Core reading order, links, prices, project labels, and form controls live in the DOM. No route waits for canvas or animation before becoming usable. Reduced motion removes pinned spatial travel; no WebGL retains the opening static composition; failed imagery retains text, layout, and purposeful fallbacks.
