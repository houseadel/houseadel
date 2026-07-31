---
name: house-adel-research
description: Research and maintain House Adel's cited landscape, market, pattern, and technical evidence. Use when evaluating interactive references or competitors, verifying technology claims, writing reference dossiers or research syntheses, or adding and correcting entries in research/reference-matrix.csv.
---

# House Adel Research

## Establish the research contract

1. Read `AGENTS.md`, the relevant files in `research/`, and existing dossiers before collecting evidence.
2. Define the question, comparison set, and intended output. Classify each reference as a realistic peer, future-scale reference, or narrow technical reference.
3. Keep observed facts, technical inference, and House Adel recommendations visibly separate. Do not turn research into an unapproved positioning or creative-direction decision.

## Collect authoritative evidence

- Prefer official sites, first-party case studies, repositories, documentation, talks, and interviews.
- Use reputable secondary reporting only when primary evidence is unavailable; state that limitation.
- Put a direct URL beside every material claim. Record the access date for pages, products, prices, teams, or capabilities that may change.
- Preserve the exact evidence needed to revisit a claim. Do not cite a search-results page as evidence.
- Inspect the live experience beyond its hero. Examine what remains useful after 30 seconds: project discovery, context, credits, navigation, content depth, next-project behavior, return paths, mobile behavior, and failure states.

## Verify technical claims

Use this evidence order:

1. Accept an explicit first-party statement or repository as verified evidence.
2. Treat source code, response headers, network requests, source maps, package signatures, and runtime behavior as observed signals, not automatic proof of the full stack.
3. Prefix every unsupported technical conclusion with `Inference:` and state the observable basis and confidence.
4. Record `Unknown` when the evidence does not justify a conclusion.

Never claim a framework, renderer, CMS, shader, analytics system, asset method, accessibility practice, or deployment platform from appearance alone.

## Apply one evaluation rubric

Evaluate the applicable dimensions consistently:

- business and portfolio model;
- governing concept and durability;
- homepage, information architecture, navigation, and scroll;
- typography, imagery, interaction, motion, sound, and WebGL;
- asset quality and likely production burden;
- project context, roles, credits, process, outcomes, and technical depth;
- mobile, keyboard, reduced-motion, failure, and performance behavior;
- likely team scale and production risk.

Conclude with what House Adel can legitimately learn, what must not be copied, what is unrealistic for one person, what Codex can automate, what needs strong assets or specialist humans, what is surface spectacle, and why the work does or does not remain impressive after 30 seconds.

## Maintain the research set

1. Create or update `research/reference-dossiers/<slug>.md` with scope, dated evidence, findings, inferences, assessment, and direct sources.
2. Add or update exactly one matching row in `research/reference-matrix.csv`. Preserve its current schema and quoting; use `Unknown` instead of guessing and avoid duplicate entities.
3. Update the relevant pattern report only when the evidence changes a cross-reference finding.
4. Update `research/conclusions.md` only when synthesis changes. Keep recommendations out of factual sections.
5. When correcting a fact, update the dossier and matrix together and note unresolved contradictions rather than silently choosing one source.

Before handing off, check that every claim is traceable, every inference is labeled, dates use an unambiguous ISO format, links resolve, and the dossier and matrix agree.
