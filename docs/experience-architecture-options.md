# Experience architecture alternatives

Status: direction-review options, not final information architecture

## Shared contract

Every option must:

- explain House Adel and its offer without requiring WebGL interaction;
- expose Featured Work and Contact as semantic links from the first view;
- provide direct, shareable project URLs;
- preserve browser history, Back/Forward, focus, and transition interruption;
- give every project its own art direction without changing the basic content contract;
- include mobile, reduced-motion, no-WebGL, slow-network, and failed-asset states;
- keep experiments visibly distinct from commissioned work;
- allow a new project without redesigning every existing route.

## Option A — Nexus-led studio

The home is a one-screen authored nexus. It makes House Adel's range visible at once, while a conventional index and studio information remain immediately available.

```text
/
├─ /work                         semantic index / fallback
├─ /work/:project               project world + case study
├─ /studio                      concise About + capabilities
├─ /contact                     enquiry paths
├─ /archive                     secondary work and experiments
└─ /*                           authored 404 with direct links
```

### Home sequence

1. Immediate wordmark, one-sentence offer, Work index, and Contact.
2. Nexus resolves from an honest placeholder.
3. Three to five featured realities reveal project title, type, and status.
4. Select a reality; the semantic link starts a bounded exit transition.
5. Route commits, focus moves to the project heading, and the nexus releases or suspends resources.

### Project contract

- title, project type, context, role, status/year;
- art-directed opening world;
- readable story and selected media;
- mobile/accessibility/performance notes when meaningful;
- credits and outcomes;
- next project, all work, and Contact.

### Strengths

- clearest demonstration of the connected-realities hypothesis;
- memorable first interaction;
- provides a reason for persistent rendering and portal transitions.

### Risks

- highest asset and GPU burden;
- can conceal the offer behind spectacle;
- fixed composition is harder to expand;
- returning users need a quick bypass.

### Returning visitor behavior

Remember only non-sensitive preferences such as sound and reduced visual quality. Skip the long entry sequence; reveal actionable navigation immediately.

## Option B — Editorial index with world entrances

Home is a native-scroll editorial cover and selected-work index. Each project owns a radical visual world; transitions provide connection without a universal spatial scene.

```text
/
├─ /work
│  └─ /work/:project
├─ /studio
├─ /process                     optional, only if evidence exists
├─ /lab                         bounded experiments
├─ /contact
└─ /*
```

### Home sequence

1. Clear positioning statement and selected project.
2. Native-scroll sequence alternates project covers with concise service proof.
3. Hover/focus/tap previews may alter a shared media field.
4. Selection expands or matches the project cover into its route.

### Strengths

- strongest client clarity and case-study access;
- naturally responsive, indexable, and accessible;
- each project can change art direction without a heavy persistent metaphor;
- simplest to maintain before the portfolio is deep.

### Risks

- connected realities may feel like a visual claim rather than an experience;
- easier to drift toward a conventional studio portfolio;
- needs exceptional type, imagery, and transitions to feel authored.

### Best use of the nexus work

Place a refined optical/fracture study inside the opening cover, Work index, or occasional edition rather than making it own all navigation.

## Option C — House Adel Editions

The studio publishes recurring art-directed editions over a stable index. The current edition can be cinematic and non-scroll, while past editions and work remain clear.

```text
/
├─ /edition/:edition            current and past authored covers
├─ /work
│  └─ /work/:project
├─ /archive                     editions + work chronology
├─ /studio
├─ /contact
└─ /*
```

### Home sequence

1. Current edition cover and a direct “View selected work” path.
2. Edition chapters may contain a nexus, essay, experiment, or commissioned focus.
3. Stable Work/Studio/Contact shell remains unchanged between editions.
4. Returning visitors can see “new since your last visit” without storing identity.

### Strengths

- supports radical recurring art direction without rebuilding the information architecture;
- creates a reason to return before a large commissioned portfolio exists;
- can combine experimental and commercial work without presenting them as equal proof;
- easy long-term expansion and archiving.

### Risks

- substantial self-initiated asset burden;
- an empty or irregular publishing cadence damages the premise;
- “edition” can overshadow services if the commercial path is too quiet;
- requires clear status labels: commissioned, speculative, experiment, or essay.

## Option D — Compact commissioned-work portfolio

The studio launches with the smallest credible route set. One authored home composition introduces two to four strong pieces, the service model, Marshall, and Contact.

```text
/
├─ /work/:project
├─ /studio
├─ /contact
└─ /*
```

Archive, Lab, Editions, Process, and Backstage do not exist until there is enough material to justify them.

### Strengths

- most realistic for an emerging independent studio;
- concentrates asset and case-study effort;
- lowest maintenance and clearest enquiry path;
- can still give every project a distinct world.

### Risks

- less evidence of a broad universe system;
- one weak or speculative project has disproportionate weight;
- no recurring framework for experiments or returning visitors.

## Route usefulness review

| Candidate | Include now? | Evidence threshold |
|---|---|---|
| Home / Nexus | Yes, but expression undecided | Must explain offer and expose links before/without effect |
| Featured Work | Yes | Two to four pieces with honest status and useful context |
| Project routes | Yes | Each supports deep link, case-study contract, next/all-work paths |
| About / Studio | Yes | Concise founder, perspective, capabilities, location/time-zone, partnership model |
| Contact | Yes | Email or form, expected project types, optional budget/timing guidance, privacy |
| Work index | Yes for A–C | Provides conventional discovery and no-WebGL fallback |
| Archive | Later or C only | Enough dated work/editions to make chronology meaningful |
| Editions | Only with a publishing commitment | A real cadence and at least one complete edition plus archive plan |
| Lab | Later | Several strong experiments with explanations; never a dumping ground |
| Backstage | Fold into case studies first | Repeated process material that clients actually benefit from |
| Process | Fold into Studio/case studies first | A distinct, evidenced method rather than generic agency steps |
| 404 | Yes | Clear recovery links; may echo the concept without trapping users |

## Cross-route state machine

```text
idle
  └─ intent (click / keyboard activation)
       ├─ validation fails → idle + visible error
       └─ preparing
            ├─ superseded → cancel preparation → newest intent
            ├─ reduced motion → commit route
            └─ exit transition
                 ├─ superseded → reverse or finish safely
                 └─ commit route
                      └─ enter route
                           ├─ asset failure → local fallback
                           └─ ready + focus destination heading
```

Browser Back/Forward produces the same state path but uses the direction metadata only to choose an appropriate bounded transition. The URL is never held hostage to a long animation.

## Loading and failure contract

- Render the semantic route shell before enhancement.
- Show progress only when it measures real work; otherwise use an indeterminate but time-bounded state.
- Allow navigation away during loading.
- Fail one asset locally; do not fail the entire route.
- On WebGL creation/context failure, remove the canvas from the interaction tree and activate the semantic/SVG composition.
- Preserve the requested URL during fallback.
- Never replay an entry gate after every project.

## Direction decision

Review the options against the positioning research and the three nexus prototypes. A credible initial outcome may combine:

- Option D's disciplined route scope;
- Option B's semantic editorial index;
- Option C's future edition contract;
- a selective version of Option A's nexus as the authored opening interaction.

That combination is not selected until the creative director reviews the visual and technical evidence.
