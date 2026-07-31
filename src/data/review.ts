export type World = {
  id: "afterlight" | "listening-garden" | "room-no-8";
  title: string;
  type: string;
  status: string;
  assetBase: string;
  image: string;
  avifSrcSet: string;
  webpSrcSet: string;
  alt: string;
  eyebrow: string;
  description: string;
  palette: string;
  accent: string;
};

function worldMedia(assetBase: string) {
  const path = `/assets/worlds/${assetBase}`;
  return {
    assetBase,
    image: `${path}-1440.webp`,
    avifSrcSet: `${path}-480.avif 480w, ${path}-960.avif 960w, ${path}-1440.avif 1440w`,
    webpSrcSet: `${path}-480.webp 480w, ${path}-960.webp 960w, ${path}-1440.webp 1440w`,
  };
}

export function worldTexture(world: World) {
  const targetWidth = window.innerWidth * Math.min(window.devicePixelRatio || 1, 1.5);
  const width = targetWidth <= 540 ? 480 : targetWidth <= 1080 ? 960 : 1440;
  return `/assets/worlds/${world.assetBase}-${width}.webp`;
}

export const worlds: World[] = [
  {
    id: "afterlight",
    title: "Afterlight",
    type: "Artist-release study",
    status: "Fictional Phase 1 study",
    ...worldMedia("afterlight-portal-01"),
    alt: "A silver tuning-like sculpture suspended in a dark mineral chamber before cobalt light.",
    eyebrow: "World 01 / Sound as architecture",
    description:
      "A launch world built from pause, resonance, and a single impossible instrument. The interaction should feel tuned—not technological.",
    palette: "Ink · silver · cobalt",
    accent: "#244ee9",
  },
  {
    id: "listening-garden",
    title: "The Listening Garden",
    type: "Cultural exhibition study",
    status: "Fictional Phase 1 study",
    ...worldMedia("listening-garden-portal-01"),
    alt: "Translucent ivory petals and copper listening horns arranged through a misty stone garden.",
    eyebrow: "World 02 / Botany as archive",
    description:
      "An exhibition entered through attention: petals, mineral basins, and small devices for listening. Discovery stays quiet and tactile.",
    palette: "Bone · moss · oxidized copper",
    accent: "#c0a06a",
  },
  {
    id: "room-no-8",
    title: "Room No. 8",
    type: "Hospitality-launch study",
    status: "Fictional Phase 1 study",
    ...worldMedia("room-no-8-portal-01"),
    alt: "A candlelit stone dining room opens through red fabric onto a dark garden at blue hour.",
    eyebrow: "World 03 / A table as threshold",
    description:
      "An intimate opening story where eight seats, a moving curtain, and a dark garden hold more meaning than a list of amenities.",
    palette: "Oxblood · midnight · wax",
    accent: "#9f2e28",
  },
];

export const references = [
  {
    name: "Active Theory",
    model: "Future-scale technical reference",
    lesson: "A persistent experiential system can connect radically different client worlds.",
    caution: "Its specialist production scale is not a realistic starting baseline.",
    url: "https://activetheory.net/",
  },
  {
    name: "Bruno Simon",
    model: "Technical and interaction reference",
    lesson: "A central interaction metaphor can continue well beyond the opening moment.",
    caution: "A game-control metaphor would misstate House Adel’s client promise.",
    url: "https://bruno-simon.com/",
  },
  {
    name: "Hello Monday",
    model: "Business and case-study reference",
    lesson: "Playful interaction can remain legible when project context and roles are visible.",
    caution: "Breadth of services and team resources exceed the initial studio model.",
    url: "https://hellomonday.com/",
  },
  {
    name: "Locomotive",
    model: "Future-scale studio reference",
    lesson: "Strong identity can sit above varied client aesthetics and detailed project proof.",
    caution: "Do not copy the smooth-scroll surface language as a substitute for an idea.",
    url: "https://locomotive.ca/",
  },
  {
    name: "Dogstudio",
    model: "Future-scale experiential reference",
    lesson: "Transitions can create continuity while routes retain distinct visual worlds.",
    caution: "Signature spectacle depends on specialist craft and unusually strong assets.",
    url: "https://dogstudio.co/",
  },
  {
    name: "Shopify Editions",
    model: "Recurring-framework reference",
    lesson: "A stable information contract can support recurring, radically art-directed editions.",
    caution: "A publishing cadence is only credible if House Adel can sustain it.",
    url: "https://www.shopify.com/editions",
  },
  {
    name: "Dennis Snellenberg",
    model: "Realistic independent benchmark",
    lesson: "Clear role, process, and project depth can sell creative development without agency scale.",
    caution: "Surface motion is less valuable than proof of a complete engagement.",
    url: "https://dennissnellenberg.com/",
  },
  {
    name: "Obys",
    model: "Art-direction and business reference",
    lesson: "A studio voice can remain forceful while project case studies change aesthetic language.",
    caution: "Graphic intensity can reduce information hierarchy if applied uniformly.",
    url: "https://obys.agency/",
  },
  {
    name: "Studio Freight",
    model: "Business and editorial reference",
    lesson: "Focused positioning and unusually good written case studies make visual work commercially legible.",
    caution: "Do not inherit a branding-agency scope House Adel does not intend to sell.",
    url: "https://studiofreight.com/",
  },
  {
    name: "Garden Eight",
    model: "Relevant contemporary studio",
    lesson: "Quiet technical confidence can support culture and fashion work without constant spectacle.",
    caution: "A restrained surface still requires strong project material.",
    url: "https://garden-eight.com/",
  },
  {
    name: "Resn",
    model: "Experiential and technical reference",
    lesson: "A studio can make experimentation part of its commercial identity.",
    caution: "Abstract interaction without service clarity would be a poor launch position.",
    url: "https://resn.co.nz/",
  },
  {
    name: "Bürocratik",
    model: "Editorial interaction reference",
    lesson: "Type, layout, and image choreography can carry authorship without a literal 3D world.",
    caution: "Do not reduce the lesson to oversized type and cursor behavior.",
    url: "https://burocratik.com/",
  },
];

export const positioningOptions = [
  {
    number: "01",
    title: "The Private Occasion Atelier",
    promise: "Authored digital worlds for rare private occasions and destination gatherings.",
    buyers: "Affluent hosts, destination planners, luxury venues",
    strength: "Closest to current invitation and editorial strengths; a clear first-client channel.",
    weakness: "One-off demand and severe comparison with inexpensive invitation platforms.",
    multiverse: "Strong as a private-world idea, but public portal language could feel theatrical.",
  },
  {
    number: "02",
    title: "The Cultural Editions Studio",
    promise: "Digital editions for exhibitions, festivals, artists, and independent cultural programs.",
    buyers: "Curators, galleries, festivals, labels, foundations",
    strength: "Natural fit for editorial depth, archives, recurring editions, and radical art direction.",
    weakness: "Budgets can be constrained and institutional procurement may be slow.",
    multiverse: "Excellent: every edition can be a reality within a stable publishing contract.",
  },
  {
    number: "03",
    title: "The Launch-World Studio",
    promise: "Compact, sensory launch worlds for releases, openings, and considered products.",
    buyers: "Artist teams, hospitality founders, fragrance and beauty independents, PR partners",
    strength: "Connects atmosphere to a concrete commercial moment and repeatable launch scope.",
    weakness: "Premium assets and launch schedules create production pressure.",
    multiverse: "Excellent if worlds are framed as authored launch contexts, not genre skins.",
  },
  {
    number: "04",
    title: "The Creative-Development Partner",
    promise: "A senior art-direction and creative-development partner for studios with a strong idea.",
    buyers: "Brand studios, agencies, producers, independent creative directors",
    strength: "Partnership-led international path with less direct sales dependence.",
    weakness: "House Adel can disappear behind partner credits and be judged heavily on engineering reliability.",
    multiverse: "Moderate: proves range internally, but the public metaphor matters less than technical case studies.",
  },
  {
    number: "05",
    title: "The Focused Digital Experience Studio",
    promise: "Art-directed websites for launches, releases, exhibitions, and occasions.",
    buyers: "A broad mix of cultural, hospitality, private, and brand clients",
    strength: "Accurately describes the intended scope without locking the studio to one vertical.",
    weakness: "Too broad unless the examples and qualification language make the buying moment obvious.",
    multiverse: "Strong as a range system; highest risk of looking like a theme marketplace.",
  },
];

export const multiverseSystems = [
  { name: "Literal shattered multiverse", score: 3.35, note: "High drama, high cliché and access risk" },
  { name: "Connected realities, subtly expressed", score: 4.65, note: "Best fit between range, authorship, and durability" },
  { name: "The House: rooms and thresholds", score: 4.15, note: "Intimate and authored; risks fashion-house literalism" },
  { name: "Recurring Editions", score: 4.65, note: "Clearest durable publishing and return-visitor contract" },
  { name: "Editorial project-world index", score: 4.55, note: "Most legible and maintainable; least spatial" },
  { name: "Constellation / atlas", score: 3.65, note: "Expandable but abstract and game-adjacent" },
];

export const architectureOptions = [
  {
    id: "A",
    title: "Nexus-led studio",
    shape: "Nexus → Work index → Project worlds → Studio / Contact",
    communicates: "The connected-realities hypothesis immediately.",
    tradeoff: "Highest asset, GPU, expansion, and navigation burden.",
    routes: ["/ — authored nexus", "/work — semantic index", "/work/:project — world + case", "/studio", "/contact", "/* — authored recovery"],
    defer: "Archive until enough secondary work exists; Lab, Backstage, and Process until evidence earns them.",
    bestWhen: "The nexus beats the index on both destination tasks and exploratory use.",
  },
  {
    id: "B",
    title: "Editorial index + world entrances",
    shape: "Cover → Selected work → Project worlds → Studio / Lab / Contact",
    communicates: "Clarity first; each project earns its own visual reality.",
    tradeoff: "Can drift toward a conventional studio portfolio.",
    routes: ["/ — editorial cover + selection", "/work — full index", "/work/:project — world + case", "/studio", "/contact", "/lab — only with several explained experiments", "/* — recovery"],
    defer: "Archive, Editions, Backstage, and standalone Process until the content exists.",
    bestWhen: "Client comprehension and case depth matter more than persistent spatial continuity.",
  },
  {
    id: "C",
    title: "House Adel Editions",
    shape: "Current edition → Work → Edition archive → Studio / Contact",
    communicates: "Radical recurring art direction over a stable publishing contract.",
    tradeoff: "Requires a real, sustainable publishing cadence.",
    routes: ["/ — current edition cover", "/edition/:edition — authored chapters", "/work", "/work/:project", "/archive — work + past editions", "/studio", "/contact", "/* — recovery"],
    defer: "Lab and Backstage unless recurring material cannot live inside edition/project records.",
    bestWhen: "House Adel commits to a real publishing cadence and honest commissioned/speculative labels.",
  },
  {
    id: "D",
    title: "Compact commissioned-work portfolio",
    shape: "Authored home → 2–4 projects → Studio / Contact",
    communicates: "A disciplined, credible emerging studio.",
    tradeoff: "Less room to demonstrate a broad universe before the work exists.",
    routes: ["/ — offer + 2–4 selected works", "/work/:project — world + case", "/studio", "/contact", "/* — recovery"],
    defer: "Work index, Archive, Editions, Lab, Backstage, and Process until volume justifies them.",
    bestWhen: "The initial portfolio is shallow and each available project needs maximum proof.",
  },
];

export const prototypeCards = [
  {
    id: "fracture",
    label: "Prototype A",
    title: "SVG / DOM fracture",
    summary: "Graphic shards, semantic links, GSAP transition, and the strongest fallback contract.",
    profile: ["Low GPU", "Strong access", "Medium art burden"],
    world: worlds[1],
    image: worlds[1].image,
  },
  {
    id: "hybrid",
    label: "Prototype B",
    title: "Hybrid WebGL glass",
    summary: "R3F fragments and raycasting mirror an authoritative DOM navigation layer.",
    profile: ["High GPU", "Highest complexity", "Medium asset burden"],
    world: worlds[0],
    image: worlds[0].image,
  },
  {
    id: "cinematic",
    label: "Prototype C",
    title: "Cinematic compositing",
    summary: "Generated stills, one shader plane, DOM type, and image-led transitions.",
    profile: ["Medium GPU", "High fidelity", "Highest art burden"],
    world: worlds[2],
    image: worlds[2].image,
  },
];
