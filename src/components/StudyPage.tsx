import { worlds } from "../data/review";
import { Link } from "../lib/router";
import { NotFound } from "./NotFound";
import { WorldImage } from "./WorldImage";

const validSources = new Set(["fracture", "hybrid", "cinematic"]);

function prototypeTitle(source: string) {
  if (source === "hybrid") return "Prototype B / Hybrid glass";
  if (source === "cinematic") return "Prototype C / Cinematic compositing";
  return "Prototype A / DOM fracture";
}

export function StudyPage({ slug, search }: { slug: string; search: string }) {
  const world = worlds.find((item) => item.id === slug);
  if (!world) return <NotFound />;
  const params = new URLSearchParams(search);
  const requestedSource = params.get("from") || "fracture";
  const source = validSources.has(requestedSource) ? requestedSource : "fracture";
  const currentIndex = worlds.indexOf(world);
  const next = worlds[(currentIndex + 1) % worlds.length];

  return (
    <main className={`study-page study-page--${world.id}`}>
      <a className="skip-link" href="#study-content">
        Skip to study content
      </a>
      <header className="study-header">
        <Link to={`/prototypes/${source}`}>
          <span aria-hidden="true">←</span> {prototypeTitle(source)}
        </Link>
        <Link to="/#prototypes">House Adel / Phase 1</Link>
      </header>

      <section className="study-hero">
        <WorldImage world={world} fetchPriority="high" />
        <div className="study-hero-shade" aria-hidden="true" />
        <div className="study-hero-copy">
          <p>{world.type}</p>
          <h1 tabIndex={-1} data-route-heading>
            {world.title}
          </h1>
          <p>{world.eyebrow}</p>
        </div>
        <p className="study-status">{world.status} / Not client work</p>
      </section>

      <article id="study-content" className="study-content">
        <aside className="study-facts">
          <dl>
            <div>
              <dt>Context</dt>
              <dd>Phase 1 nexus-comparison content</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>Concept, art direction, generated master frame, interaction prototype</dd>
            </div>
            <div>
              <dt>Asset status</dt>
              <dd>Generated candidate; creative, rights, and technical approval pending</dd>
            </div>
            <div>
              <dt>Palette</dt>
              <dd>{world.palette}</dd>
            </div>
          </dl>
        </aside>

        <div className="study-narrative">
          <p className="overline">A controlled route-transition test</p>
          <h2>{world.description}</h2>
          <p>
            This route is deliberately smaller than a real case study. It tests the contract the
            final system would need: a direct URL, an image-led entry, immediate readable context,
            correct browser history, a return path, and a next-project path.
          </p>

          <section>
            <h3>What changes inside this world</h3>
            <p>
              Image language, palette, atmosphere, material behavior, pacing, and optional sound
              may belong to this project alone.
            </p>
          </section>
          <section>
            <h3>What remains House Adel</h3>
            <p>
              The route contract, semantic information, typography discipline, interaction
              quality, transition control, accessibility modes, performance budget, asset
              provenance, and return-to-work behavior remain shared.
            </p>
          </section>
          <section>
            <h3>What is still missing</h3>
            <p>
              A real brief, client context, full visual bible, approved master frame, supporting
              asset family, process evidence, credits, outcome, physical-device testing, and
              production rights review.
            </p>
          </section>
        </div>
      </article>

      <nav className="study-next" aria-label="Study navigation">
        <Link to={`/prototypes/${source}`}>All three prototypes</Link>
        <Link to={`/studies/${next.id}?from=${source}`}>
          <span>Next fictional study</span>
          <strong>{next.title}</strong>
          <span aria-hidden="true">→</span>
        </Link>
      </nav>
    </main>
  );
}
