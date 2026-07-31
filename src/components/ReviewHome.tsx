import { useState } from "react";
import {
  architectureOptions,
  multiverseSystems,
  positioningOptions,
  prototypeCards,
  references,
} from "../data/review";
import { Link } from "../lib/router";
import { ModeToolbar } from "./ModeToolbar";
import { VisualEvidence } from "./VisualEvidence";
import { WorldImage } from "./WorldImage";

const capabilityRows = [
  ["Application", "Vite + React + TypeScript", "Phase 1 lab only; final framework remains gated"],
  ["Rendering", "R3F / Three.js", "One principal renderer hypothesis; measured in B and C"],
  ["Motion", "GSAP + CSS", "One coordinator; simple states stay in CSS"],
  ["Testing", "Playwright + axe + Vitest", "Chromium, Firefox, WebKit, Edge channel"],
  ["Assets", "OpenAI image studies + Sharp + FFmpeg", "Masters, provenance, variants, and fallbacks separated"],
  ["Deployment", "Not selected", "No production deployment before direction approval"],
];

const measuredPrototypeRows = [
  ["A / DOM fracture", "293 KiB", "109 KiB", "102 KiB", "428 ms", "16.8 ms", "0"],
  ["B / Hybrid WebGL", "720 KiB", "339 KiB", "300 KiB", "384 ms", "50.0 ms", "≈31 MiB"],
  ["C / Cinematic", "741 KiB", "337 KiB", "323 KiB", "976 ms", "16.8 ms", "≈31 MiB"],
];

export function ReviewHome() {
  const [referenceFilter, setReferenceFilter] = useState("all");
  const [decisionNotes, setDecisionNotes] = useState("");

  const filteredReferences =
    referenceFilter === "all"
      ? references
      : references.filter((reference) =>
          reference.model.toLowerCase().includes(referenceFilter.toLowerCase()),
        );

  const downloadNotes = () => {
    const payload = {
      project: "House Adel — Phase 1",
      createdAt: new Date().toISOString(),
      note: decisionNotes,
      reminder:
        "This note is a review leaning, not automatic approval of positioning, governing concept, architecture, or production.",
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "house-adel-direction-notes.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="review-site">
      <a className="skip-link" href="#review-main">
        Skip to review
      </a>

      <header className="review-header">
        <a className="review-wordmark" href="#top" aria-label="House Adel direction lab, top">
          House Adel
        </a>
        <nav aria-label="Direction lab">
          <a href="#evidence">Evidence</a>
          <a href="#positioning">Positioning</a>
          <a href="#concept">Concept</a>
          <a href="#architecture">Architecture</a>
          <a href="#prototypes">Prototypes</a>
          <a href="#decisions">Decisions</a>
        </nav>
        <span className="phase-chip">Phase 1 / unapproved</span>
      </header>

      <main id="review-main">
        <section className="review-hero" id="top" aria-labelledby="hero-title">
          <div className="hero-register" aria-hidden="true">
            HA–01
          </div>
          <div className="hero-copy">
            <p className="overline">Direction lab / 30 July 2026</p>
            <h1 id="hero-title" tabIndex={-1} data-route-heading>
              Evidence before identity.
            </h1>
            <p className="hero-deck">
              House Adel is testing how one independent studio can construct radically different
              realities without becoming a theme shop, an effects reel, or a generic agency.
            </p>
          </div>
          <div className="hero-side">
            <p>
              This interface compares evidence, five market positions, four site architectures,
              and three working nexus systems. Nothing here silently approves the final site.
            </p>
            <a className="text-link" href="#prototypes">
              Compare the three systems <span aria-hidden="true">↘</span>
            </a>
          </div>
          <dl className="hero-metrics">
            <div>
              <dt>References</dt>
              <dd>22</dd>
            </div>
            <div>
              <dt>Positions</dt>
              <dd>05</dd>
            </div>
            <div>
              <dt>Nexus tests</dt>
              <dd>03</dd>
            </div>
            <div>
              <dt>Project skills</dt>
              <dd>10</dd>
            </div>
          </dl>
          <div className="hero-modes">
            <span>Review modes</span>
            <ModeToolbar compact />
          </div>
        </section>

        <section className="review-section evidence-section" id="evidence">
          <div className="section-heading">
            <p className="overline">01 / Comparative evidence</p>
            <h2>References are separated by what they can actually teach.</h2>
            <p>
              A realistic peer, a future-scale studio, and a narrow technical reference are not the
              same benchmark. The full dossiers and citations live in <code>research/</code>.
            </p>
          </div>
          <div className="filter-row" aria-label="Filter references">
            {[
              ["all", "All"],
              ["realistic", "Realistic"],
              ["future", "Future-scale"],
              ["technical", "Technical"],
              ["business", "Business"],
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                aria-pressed={referenceFilter === value}
                onClick={() => setReferenceFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="reference-grid">
            {filteredReferences.map((reference, index) => (
              <article className="reference-card" key={reference.name}>
                <div className="reference-index">{String(index + 1).padStart(2, "0")}</div>
                <div>
                  <p className="card-kicker">{reference.model}</p>
                  <h3>{reference.name}</h3>
                </div>
                <div className="reference-notes">
                  <p>
                    <span>Learn</span>
                    {reference.lesson}
                  </p>
                  <p>
                    <span>Do not copy</span>
                    {reference.caution}
                  </p>
                </div>
                <a href={reference.url} target="_blank" rel="noreferrer">
                  Visit source <span className="sr-only">for {reference.name}</span>
                  <span aria-hidden="true">↗</span>
                </a>
              </article>
            ))}
          </div>
          <p className="evidence-note">
            The full matrix adds central concept, navigation, scroll, verified WebGL evidence,
            project depth, mobile, accessibility, likely team scale, and House Adel relevance.
          </p>
        </section>

        <section className="review-section positioning-section" id="positioning">
          <div className="section-heading section-heading--split">
            <div>
              <p className="overline">02 / Market positions</p>
              <h2>Five credible starts. No permanent winner yet.</h2>
            </div>
            <p>
              The functional website is already a commodity. House Adel has to sell authorship
              around a meaningful moment, not more features or more animation.
            </p>
          </div>
          <div className="position-stack">
            {positioningOptions.map((option) => (
              <article className="position-card" key={option.number}>
                <div className="position-number">{option.number}</div>
                <div className="position-main">
                  <p className="card-kicker">Positioning option</p>
                  <h3>{option.title}</h3>
                  <p className="position-promise">{option.promise}</p>
                </div>
                <dl>
                  <div>
                    <dt>Likely buyers</dt>
                    <dd>{option.buyers}</dd>
                  </div>
                  <div>
                    <dt>Advantage</dt>
                    <dd>{option.strength}</dd>
                  </div>
                  <div>
                    <dt>Weakness</dt>
                    <dd>{option.weakness}</dd>
                  </div>
                  <div>
                    <dt>Multiverse fit</dt>
                    <dd>{option.multiverse}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section className="review-section concept-section" id="concept">
          <div className="concept-statement">
            <p className="overline">03 / Multiverse evaluation</p>
            <blockquote>
              One authored studio system that can enter, construct, and connect radically
              different realities.
            </blockquote>
            <p>
              That is defensible. “Five themes behind broken glass” is not. The governing logic,
              public word, material metaphor, and home layout are four separate decisions.
            </p>
          </div>
          <div className="score-list" aria-label="Weighted concept-system comparison">
            {multiverseSystems.map((system) => (
              <div className="score-row" key={system.name}>
                <div>
                  <strong>{system.name}</strong>
                  <span>{system.note}</span>
                </div>
                <div
                  className="score-track"
                  role="meter"
                  aria-label={`${system.name} score`}
                  aria-valuemin={0}
                  aria-valuemax={5}
                  aria-valuenow={system.score}
                >
                  <span style={{ width: `${(system.score / 5) * 100}%` }} />
                </div>
                <output>{system.score.toFixed(2)}</output>
              </div>
            ))}
          </div>
          <aside className="concept-callout">
            <span>Provisional conclusion</span>
            <p>
              Keep connected realities as the leading strategic hypothesis. Do not yet approve
              “multiverse” as the headline or shattered glass as the permanent interface.
            </p>
          </aside>
        </section>

        <section className="review-section architecture-section" id="architecture">
          <div className="section-heading">
            <p className="overline">04 / Complete site-flow options</p>
            <h2>The nexus does not have to own the whole website.</h2>
          </div>
          <div className="architecture-grid">
            {architectureOptions.map((option) => (
              <article className="architecture-card" key={option.id}>
                <span className="architecture-letter">{option.id}</span>
                <p className="card-kicker">Architecture option</p>
                <h3>{option.title}</h3>
                <p className="architecture-shape">{option.shape}</p>
                <dl>
                  <div>
                    <dt>Communicates</dt>
                    <dd>{option.communicates}</dd>
                  </div>
                  <div>
                    <dt>Main tradeoff</dt>
                    <dd>{option.tradeoff}</dd>
                  </div>
                </dl>
                <details>
                  <summary>Complete route flow</summary>
                  <ul>
                    {option.routes.map((route) => (
                      <li key={route}>{route}</li>
                    ))}
                  </ul>
                  <p>
                    <strong>Use when:</strong> {option.bestWhen}
                  </p>
                  <p>
                    <strong>Defer:</strong> {option.defer}
                  </p>
                </details>
              </article>
            ))}
          </div>
          <div className="route-contract">
            <p className="card-kicker">Shared route contract</p>
            <div>
              <span>Semantic shell</span>
              <span aria-hidden="true">→</span>
              <span>Cancelable exit</span>
              <span aria-hidden="true">→</span>
              <span>URL commits</span>
              <span aria-hidden="true">→</span>
              <span>Focus moves</span>
              <span aria-hidden="true">→</span>
              <span>Local fallback</span>
            </div>
          </div>
        </section>

        <section className="review-section prototypes-section" id="prototypes">
          <div className="section-heading section-heading--split">
            <div>
              <p className="overline">05 / Interaction prototypes</p>
              <h2>One content set. Three technically different answers.</h2>
            </div>
            <p>
              Each test uses the same fictional world studies, semantic destinations, and failure
              contract. Compare the system—not which image happens to be your favorite.
            </p>
          </div>
          <div className="prototype-grid">
            {prototypeCards.map((prototype) => (
              <article className="prototype-card" key={prototype.id}>
                <div className="prototype-image">
                  <WorldImage
                    world={prototype.world}
                    sizes="(max-width: 760px) 100vw, 33vw"
                    alt=""
                    loading="lazy"
                  />
                  <span>{prototype.label}</span>
                </div>
                <div className="prototype-copy">
                  <h3>{prototype.title}</h3>
                  <p>{prototype.summary}</p>
                  <ul aria-label="Prototype profile">
                    {prototype.profile.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <Link className="launch-link" to={`/prototypes/${prototype.id}`}>
                    Open full-screen test <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <div className="prototype-warning">
            <strong>Asset status</strong>
            <p>
              These three generated studies are provenance-recorded prototype candidates. They are
              not approved House Adel work, case studies, or final art direction.
            </p>
          </div>
        </section>

        <VisualEvidence />

        <section className="review-section system-section" id="system">
          <div className="section-heading">
            <p className="overline">07 / Technical and production system</p>
            <h2>A small, auditable stack for evidence—not a framework collection.</h2>
          </div>
          <div className="capability-table" role="table" aria-label="Phase 1 capability setup">
            {capabilityRows.map(([area, choice, status]) => (
              <div role="row" key={area}>
                <span role="cell">{area}</span>
                <strong role="cell">{choice}</strong>
                <span role="cell">{status}</span>
              </div>
            ))}
          </div>
          <div className="performance-summary">
            <div>
              <p className="card-kicker">Measured production-preview baseline / desktop</p>
              <h3>Visual ambition has a visible cost.</h3>
              <p>
                Cold isolated Chromium contexts at 1440 × 900. GPU figures are texture and canvas
                estimates—not driver telemetry. Full method and mobile results are recorded in{" "}
                <code>docs/performance-baseline.md</code>.
              </p>
            </div>
            <div
              className="performance-table"
              role="table"
              aria-label="Measured prototype results"
              tabIndex={0}
            >
              <div role="row" className="performance-table-head">
                {["Candidate", "Route", "Code gzip", "Images", "LCP", "Frame p95", "GPU est."].map(
                  (heading) => (
                    <span role="columnheader" key={heading}>
                      {heading}
                    </span>
                  ),
                )}
              </div>
              {measuredPrototypeRows.map((row) => (
                <div role="row" key={row[0]}>
                  {row.map((cell, index) => (
                    <span role="cell" key={`${row[0]}-${cell}`}>
                      {index === 0 ? <strong>{cell}</strong> : cell}
                    </span>
                  ))}
                </div>
              ))}
            </div>
            <aside>
              A clears the automated frame and long-task guardrails. B exceeds the standard p95
              frame budget; B and C both retain start-up tasks above 100 ms. Lighthouse mobile
              scores were 95 for A, 64 for B, and 58 for C; B/C LCP exceeded 3.7 seconds.
            </aside>
          </div>
          <div className="cost-grid">
            <article>
              <span>A</span>
              <h3>SVG / DOM fracture</h3>
              <strong>2–3 weeks</strong>
              <p>Lowest runtime cost. Composition and typography still have to carry the idea.</p>
            </article>
            <article>
              <span>B</span>
              <h3>Hybrid WebGL glass</h3>
              <strong>4–6 weeks</strong>
              <p>Highest reliability and specialist burden. Must visibly outperform A and C.</p>
            </article>
            <article>
              <span>C</span>
              <h3>Cinematic compositing</h3>
              <strong>3–5 weeks</strong>
              <p>Highest recurring art-direction burden; controlled GPU and strong still fallback.</p>
            </article>
          </div>
          <p className="estimate-note">
            Comparative production estimates, not quotations. They exclude feedback cycles,
            commissioned photography/CGI, complex sound, and legal review.
          </p>
        </section>

        <section className="review-section decisions-section" id="decisions">
          <div className="section-heading section-heading--split">
            <div>
              <p className="overline">08 / Direction review</p>
              <h2>Five decisions—after you have seen the evidence.</h2>
            </div>
            <p>
              A note recorded here is a leaning for the next review round. It does not silently
              start final-site production.
            </p>
          </div>
          <ol className="decision-list">
            <li>Which positioning territory should lead?</li>
            <li>Should connected realities stay, become subtler, or be replaced?</li>
            <li>Which site-flow architecture best balances clarity and discovery?</li>
            <li>Which prototype—or combination—deserves refinement?</li>
            <li>Which first asset world should receive a visual bible and full master-frame pass?</li>
          </ol>
          <div className="decision-notes">
            <label htmlFor="decision-note">Creative-director notes</label>
            <textarea
              id="decision-note"
              value={decisionNotes}
              onChange={(event) => setDecisionNotes(event.target.value)}
              placeholder="Record what communicates, what feels wrong, and what should be tested next…"
            />
            <button type="button" onClick={downloadNotes} disabled={!decisionNotes.trim()}>
              Download review note
            </button>
          </div>
        </section>
      </main>

      <footer className="review-footer">
        <div>
          <strong>House Adel</strong>
          <span>Phase 1 direction lab</span>
        </div>
        <p>No final production site has been approved or built.</p>
        <a href="#top">Back to top ↑</a>
      </footer>
    </div>
  );
}
