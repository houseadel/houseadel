# Asset rights and provenance

Status: Phase 1 policy

## Principle

An asset is not production-ready because it looks right. It is production-ready only when its source, transformations, commercial rights, client-transfer implications, fallbacks, and human approval are recorded.

## Intake workflow

1. Assign a stable asset ID before editing.
2. Save the untouched master in a non-public reference location.
3. Record creator, source type, source URL or provider, collection/model, date, and job/seed when available.
4. Store the prompt and every source image used for generation or editing.
5. Save the applicable license or terms URL and the date it was checked.
6. Check commercial use, attribution, territory/term restrictions, sensitive-content rules, and whether deliverables may be transferred to a client.
7. Record every material transformation and tool version.
8. Generate public variants through deterministic scripts.
9. Review creative fit, rights, and technical behavior separately.
10. Approve only when all three reviews pass.

## Source-specific checks

### AI-generated or AI-edited

- Record the provider, model, account/plan context, prompt, references, and job identifier.
- Confirm current commercial-use terms for the actual plan used.
- Record whether inputs contain third-party copyrighted, trademarked, personal, or confidential material.
- Do not describe output as copyright-owned when the legal status is uncertain; record the practical license/usage basis instead.
- Treat stylistic imitation of a living artist or identifiable brand campaign as a creative and rights risk even if a provider permits generation.
- Preserve the generated master before compositing so provenance remains auditable.

### Licensed library

- Save the item URL, contributor, license name, invoice or subscription evidence outside the public repository, and download date.
- Check project, seat, audience, redistribution, template, and client-transfer restrictions.
- Do not commit raw redistributable source files when the license prohibits it.

### Commissioned

- Record the creator, scope, delivery date, usage grant/assignment, credit, territory, term, exclusivity, and model/property releases where relevant.
- Link the contract record without committing confidential agreements to a public repository.

### Client-supplied

- Record the client as the rights warrantor and ask for usage scope.
- Keep the source separate from House Adel-owned assets.
- Flag unclear releases, trademarks, faces, venues, artworks, and music before publishing.

### Public domain or open license

- Record the exact source item and license/version.
- Preserve required attribution and share-alike notices.
- Do not infer public-domain status from age or reposting.

## Repository boundaries

- `references/masters/`: untouched or working high-resolution sources; normally excluded from public deployment.
- `references/prompts/`: prompt and source-reference records.
- `references/licenses/`: non-confidential license snapshots or links; receipts/contracts remain outside a public repository.
- `public/assets/`: optimized, approved delivery files only.
- `manifest.json`: asset state and hashes.

## Publication gate

Block publication when:

- commercial rights are `unknown` or `restricted` without an approved exception;
- a license requires missing attribution;
- a person, property, artwork, trademark, or confidential input lacks clearance;
- an AI tool's plan or terms cannot be tied to the generated job;
- a motion/model asset lacks a required static or no-WebGL fallback;
- a production variant does not match its recorded hash.

This policy is operational documentation, not legal advice. Escalate novel or high-value rights questions to qualified counsel.
