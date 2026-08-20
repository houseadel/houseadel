# Voice

Last updated: 2026-08-06

`docs/COPY_APPROVED.md` is the literal copy source of truth — check it first, and do not paraphrase what it already fixes. This file states the rules for everything else: Indonesian translation, and any new English copy this brief doesn't cover (only added with explicit approval, per the brief's own closing instruction).

## Hard rules

- No em dashes.
- No "not only this, but that" construction.
- No: "more than," "beyond," "not just," "where X meets Y."
- No: "every story," "every moment," "brought to life," "made with passion," "designed to inspire," "crafted with care."
- No fashion terminology to describe web-development services (no "atelier," "maison," "bespoke" without naming what is individually designed, "curated," "exclusive," "elevated," "timeless").
- No exclamation marks.
- Use "commission" only when it is clearer than "project" — for this site, "project" is clearer; do not use "commission."
- Use "investment" only when it is clearer than "price" or "budget" — the site does not mention price or budget at all, so do not use "investment" either.
- Keep paragraphs short. Let the artwork and interaction carry the atmosphere, not extra sentences.

## What the copy establishes

Only: what House Adel is, what project is being shown, how to contact House Adel. Nothing else is added without approval — no services, process, philosophy, pricing or budget sections, no alternative headings, no supporting paragraphs beyond what `docs/COPY_APPROVED.md` specifies.

## Applying this to Indonesian

Bilingual EN/ID is a deliberate product decision (see `docs/DECISIONS.md`), not part of the original brief, so Indonesian translations are original work following the rules above, not a re-derivation of tone: plain, short, factual, no exclamation marks, no fashion-luxury vocabulary, no invented sections. Translate the rule, not just the words — an Indonesian sentence should read with the same plainness as the English, not a literal transposition of an English idiom that doesn't carry over.

## What must not change in substance

- **MARVELL FLORIST vs. MARVELL 20** — the general Marvell Florist brand/website/campaigns are never presented as House Adel work. Only the MARVELL 20 project is.
- **`src/pages/WorkPage.tsx`** — shows only MARVELL 20 until a second genuine project exists. No placeholder cards, no fabricated availability.
- **`src/features/application/components/ApplicationForm.tsx`** (the Begin a Project form) — no budget/investment field of any kind; no forced category selection for "what are you planning."
- **`src/pages/EnquiryReceivedPage.tsx`** — no promised response time; the `confirmed=1` gate stays honest (no reassurance shown before a real provider response exists).
