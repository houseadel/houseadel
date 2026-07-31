# Transition patterns

**Status:** Phase 1 research synthesis, not an approved motion system  
**Sources accessed:** 2026-07-30

## Reading key

- **Evidence** is supported by a cited source.
- **Inference** is a deduction and not an assertion about a reference site's internal code.
- **Recommendation** is a prototype hypothesis.

## A transition has functional work

A route transition should do at least one of the following:

- preserve spatial or conceptual continuity;
- cover a bounded content commit without pretending an unknown load has completed;
- orient the visitor inside a project sequence; or
- express the governing idea in a way the static state cannot.

It should not exist only to demonstrate an effect. MDN describes view transitions as a way to create continuity between UI states in both same-document and cross-document navigations ([MDN, View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)). That capability can also create focus and assistive-technology problems when content replacement is not handled deliberately, so it remains progressive enhancement.

## State model

Use one coordinator with explicit states instead of independent page animations:

```text
idle
  -> preparing
  -> exiting
  -> committing
  -> entering
  -> idle

preparing | exiting | committing | entering
  -> cancelling
  -> newest valid destination or prior stable route
```

The router owns the destination. The coordinator owns visual timing. Asset loaders report readiness and failure; they do not own navigation.

### Required events

- navigation requested;
- destination shell ready;
- optional enhanced asset ready;
- maximum wait elapsed;
- newer navigation requested;
- history traversal;
- reduced-motion preference changed;
- tab hidden or shown;
- WebGL context lost/restored; and
- transition complete/cancelled.

MDN's guidance notes that active view transitions are skipped or handled differently when a document is hidden, and that cross-document transitions use `pageswap` and `pagereveal` events ([MDN, Using the View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using)). These are cases to test, not assumptions of uniform support.

## Candidate transition families

| Family | Appropriate use | Risks | Reduced/no-WebGL alternative |
| --- | --- | --- | --- |
| **Direct cut with typographic continuity** | Fast index-to-case-study navigation; a shared title or position carries context. | Can feel abrupt if hierarchy changes completely. | Same direct cut with focus and title update. |
| **Short DOM crossfade** | Covers a quick content commit without spatial travel. | Text may be temporarily unreadable; double exposure can lower contrast. | Immediate replacement or very short opacity change. |
| **Shared-element transition** | The selected project's image/title becomes the case-study hero. | Responsive geometry, history reversal, and interrupted state are difficult. | Keep the label; remove motion and commit directly. |
| **Canvas-to-DOM handoff** | A nexus object resolves into a project master frame. | Canvas/DOM alignment, texture duplication, GPU memory, and accessibility drift. | Static poster or thumbnail and ordinary link navigation. |
| **Render-target reveal** | A concept specifically requires one reality to materially transform into another. | Extra framebuffers, fill rate, state complexity, and easy resemblance to generic shader showcases. | Concept-matched dissolve, mask, or cut in CSS/DOM. |
| **Project-world exit/entry pair** | A stable House Adel layer mediates between visually different project worlds. | The mediator can become a repetitive branded interstitial. | Retain the House Adel title/nav state; remove cinematic travel. |

An author-attributed Studiogusto case study describes a WebGL overlay whose circle expands to reveal the destination ([Codrops, Studiogusto case study](https://tympanus.net/codrops/2023/04/25/case-study-studiogusto/)). A Ronin161 case study describes ping-pong render targets and limiting active pages ([Codrops, Ronin161 case study](https://tympanus.net/codrops/2024/02/20/case-study-ronin161s-portfolio-2024/)). These disclose possible mechanisms; they do not establish that House Adel needs either.

## Timing hypotheses

There is no universal “premium” duration. Timing depends on the idea, route distance, content readiness, and input.

**Recommendation — prototype ranges only:**

| Event | Starting range to test | Stop condition |
| --- | --- | --- |
| Press/focus feedback | 80–180 ms | Must not delay activation. |
| Small DOM state change | 120–260 ms | State remains legible and responsive. |
| Index-to-project route | 350–750 ms desktop; 250–550 ms mobile | Destination shell should not wait for enhanced media. |
| Conceptual world handoff | 600–1,100 ms | Use only if the sequence communicates a tested idea and remains interruptible. |

These values are design hypotheses, not sourced standards. Measure perceived delay and abandonment in review. A transition that waits on an unpredictable network request needs a maximum wait, useful loading state, and a route shell that can commit without the enhanced asset.

## GSAP, CSS, and the platform API

- Use CSS transitions/animations for local, independent visual states.
- Use one GSAP timeline for coordinated sequences that require play, pause, reverse, seek, or cancellation; the GSAP timeline API supplies these controls ([GSAP, Timeline](https://gsap.com/docs/v3/GSAP/Timeline/)).
- Scope GSAP work and revert it during teardown. GSAP documents `gsap.context()` as a collection/cleanup mechanism and `revert()` as a way to kill animation and restore prior inline state ([GSAP, `gsap.context()`](https://gsap.com/docs/v3/GSAP/gsap.context%28%29/), [GSAP, Timeline `revert()`](https://gsap.com/docs/v3/GSAP/Timeline/revert%28%29/)).
- Treat the View Transition API as enhancement. `document.startViewTransition()` reached the Baseline 2025 designation, but MDN still identifies variations and older-browser gaps ([MDN, `startViewTransition`](https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition)).
- Do not combine GSAP, CSS, and native view transitions on the same property without explicit ownership.

## Interruption rules

1. The last deliberate navigation request wins.
2. Kill or reverse only timelines owned by the outgoing transaction.
3. Abort obsolete data/asset requests where possible.
4. Never leave an opaque transition layer over a settled route.
5. If the enhanced transition fails, reveal the destination shell and restore input.
6. Back/Forward receives the same care as click navigation.
7. When the tab becomes hidden, skip nonessential progression and settle safely.

The Design Embraced author case study identifies interruption as one of the hardest parts of a custom router/animation system and describes trading a larger initial preload for seamless later transitions ([Codrops, Design Embraced case study](https://tympanus.net/codrops/2024/03/21/case-study-design-embraced-portfolio-2024/)). That is author testimony, not a recommendation to preload all House Adel assets.

## Accessibility and resilience

- `prefers-reduced-motion: reduce` removes spatial travel, parallax, scrub requirements, rapid scaling, and nonessential looping. It does not remove navigation or content.
- Motion triggered by interaction must be disableable when it is not essential ([W3C, Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)).
- Moving content that starts automatically, lasts more than five seconds, and appears alongside other content needs a pause/stop/hide mechanism under WCAG conditions ([W3C, Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide)).
- Focus indicators must remain above masks and transition layers.
- Loading progress should report real state; an indeterminate visual must not announce fabricated percentages.
- A no-WebGL or failed-asset path uses the same URL and content, not a separate inaccessible microsite.

## Prototype evidence to capture

- screen recording of normal, reduced-motion, Back/Forward, rapid-click, and slow-network runs;
- route/transition event log showing cancel and settle behavior;
- main-thread and frame-time trace for each effect;
- GPU/resource counts before and after 20 route cycles;
- focus order and route-announcement record;
- fallback screenshot for missing media and lost context; and
- qualitative note explaining what the transition communicates beyond “polish.”

## Sources

- MDN, View Transition API: https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API
- MDN, Using the View Transition API: https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using
- MDN, `Document.startViewTransition()`: https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition
- GSAP, Timeline: https://gsap.com/docs/v3/GSAP/Timeline/
- GSAP, `gsap.context()`: https://gsap.com/docs/v3/GSAP/gsap.context%28%29/
- GSAP, Timeline `revert()`: https://gsap.com/docs/v3/GSAP/Timeline/revert%28%29/
- GSAP, `matchMediaRefresh()`: https://gsap.com/docs/v3/GSAP/gsap.matchMediaRefresh%28%29/
- W3C, Understanding SC 2.3.3 Animation from Interactions: https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions
- W3C, Understanding SC 2.2.2 Pause, Stop, Hide: https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide
- Codrops, author case study, “Design Embraced Portfolio 2024”: https://tympanus.net/codrops/2024/03/21/case-study-design-embraced-portfolio-2024/
- Codrops, author case study, “Ronin161's Portfolio 2024”: https://tympanus.net/codrops/2024/02/20/case-study-ronin161s-portfolio-2024/
- Codrops, author case study, “Studiogusto”: https://tympanus.net/codrops/2023/04/25/case-study-studiogusto/
