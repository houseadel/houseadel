---
name: house-adel-design-guardian
description: Review and guide House Adel interface, motion, accessibility, and asset decisions against the Ceremonial Spatial Editorialism direction. Use when planning, implementing, or reviewing House Adel pages, components, interactions, animation, WebGL, responsive layouts, copy presentation, imagery, or release readiness.
---

# House Adel Design Guardian

Protect the authored House Adel system while keeping every decision useful, accessible, and supportable.

## Review workflow

1. Read `references/visual-principles.md` before assessing any visible interface change.
2. Read the checklist that matches the work:
   - Motion or WebGL: `references/motion-checklist.md`
   - Interaction, navigation, forms, or responsive behavior: `references/accessibility-checklist.md`
   - Any new or changed media: `references/asset-provenance-checklist.md`
3. Inspect the implementation in the browser at desktop and mobile sizes. Also inspect reduced-motion behavior when motion is present.
4. Identify concrete failures by file, route, viewport, and state. Distinguish release blockers from refinements.
5. Prefer removing an unjustified effect over adding decoration. Preserve working code and document material tradeoffs.
6. For asset-bearing changes, run:

   ```bash
   node skills/house-adel-design-guardian/scripts/report_images_without_provenance.mjs
   ```

7. Report what was checked, what passed, what remains unresolved, and the smallest corrective action. Never approve a claim that was not verified.

## Decision order

Resolve issues in this order: factual integrity and rights, content reachability, accessibility, layout and typography, responsive composition, interaction purpose, motion polish, then decorative detail.

Do not delete media or rewrite working components automatically. Flag the exact issue and make only changes authorized by the current task.
