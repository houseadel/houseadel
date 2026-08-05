import { useCallback, useRef, useState } from "react";
import {
  RealLoaderLab,
  type LoaderGraphicsMode,
  type LoaderReport,
  type LoaderVisitMode,
} from "./RealLoaderLab";
import styles from "./LoaderLabPage.module.css";

function querySetting(name: string) {
  return new URLSearchParams(window.location.search).get(name);
}

function initialVisit(): LoaderVisitMode {
  const value = querySetting("visit");
  return value === "first" || value === "repeat" ? value : "auto";
}

function initialGraphics(): LoaderGraphicsMode {
  return querySetting("graphics") === "fallback" ? "fallback" : "auto";
}

export function LoaderLabPage() {
  const posterReference = useRef<HTMLImageElement>(null);
  const contentReference = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(0);
  const [visitMode, setVisitMode] = useState<LoaderVisitMode>(initialVisit);
  const [graphicsMode, setGraphicsMode] = useState<LoaderGraphicsMode>(initialGraphics);
  const [report, setReport] = useState<LoaderReport | null>(null);
  const [complete, setComplete] = useState(false);
  const preview = querySetting("preview") === "loader";

  const handleComplete = useCallback(() => setComplete(true), []);
  const handleReport = useCallback((nextReport: LoaderReport) => setReport(nextReport), []);

  const replay = (visit: Exclude<LoaderVisitMode, "auto">, graphics: LoaderGraphicsMode) => {
    setVisitMode(visit);
    setGraphicsMode(graphics);
    setReport(null);
    setComplete(false);
    setRun((current) => current + 1);
  };

  return (
    <div
      className={styles.page}
      data-loader-lab
      data-loader-complete={complete ? "true" : "false"}
      data-graphics={report?.graphics ?? "pending"}
      data-motion={report?.motion ?? "pending"}
      data-readiness={report?.readiness ?? "pending"}
      data-visit={report?.visit ?? "pending"}
    >
      <RealLoaderLab
        key={run}
        criticalPoster={posterReference}
        contentRoot={contentReference}
        graphicsMode={graphicsMode}
        preview={preview}
        visitMode={visitMode}
        onComplete={handleComplete}
        onReport={handleReport}
      />

      <div ref={contentReference}>
        <section className={styles.hero} aria-labelledby="loader-lab-title">
          <picture className={styles.poster} data-loader-reveal>
            <source srcSet="/assets/open-access/met-390163-1600w.avif" type="image/avif" />
            <img
              ref={posterReference}
              src="/assets/open-access/met-390163-1600w.webp"
              alt="An architectural drawing-room interior used as the static spatial fallback."
              loading="eager"
              decoding="async"
            />
          </picture>
          <div className={styles.heroField} aria-hidden="true" data-loader-reveal>
            <span />
            <span />
            <span />
          </div>

          <div className={`${styles.heroInner} page-frame`}>
            <div className={styles.heroMeta} data-loader-reveal>
              <p>Interaction laboratory · 01</p>
              <p>Isolated route · Review build</p>
            </div>
            <div className={styles.heroCopy}>
              <p className="eyebrow" data-loader-reveal>
                Real SVG-text loader
              </p>
              <h1 id="loader-lab-title" data-route-heading data-loader-reveal tabIndex={-1}>
                Readiness,<br />held with ceremony.
              </h1>
              <p className={styles.lede} data-loader-reveal>
                A first entrance for House Adel’s digital invitation practice, resolved from
                real type, poster and graphics capability checks—not a fabricated percentage.
              </p>
            </div>
            <div className={styles.heroFoot} data-loader-reveal>
              <p>
                Spatial layer · {report?.graphics === "ready" ? "capability available" : "static poster"}
              </p>
              <span aria-hidden="true">↓</span>
            </div>
          </div>
        </section>

        <section className={`${styles.review} page-frame`} aria-labelledby="loader-review-title">
          <div className={styles.reviewHeading}>
            <p className="eyebrow">Engineering note</p>
            <h2 id="loader-review-title">One readiness state. One resolving timeline.</h2>
          </div>
          <div className={styles.explanation}>
            <p>
              The loader waits only for the local editorial fonts, the first poster, the House
              Adel mark and a WebGL capability result. It does not wait for the rest of the page.
            </p>
            <p>
              Two restrained text arcs borrow the SVG text-path mechanic, while the offset arcs,
              architectural rule and vertical paper uncovering form an original House Adel
              composition.
            </p>
          </div>

          <dl className={styles.readinessList} aria-label="Current loader run">
            <div>
              <dt>Visit</dt>
              <dd>{report?.visit ?? "Checking"}</dd>
            </div>
            <div>
              <dt>Readiness</dt>
              <dd>{report?.readiness ?? "Checking"}</dd>
            </div>
            <div>
              <dt>Motion</dt>
              <dd>{report?.motion ?? "Checking"}</dd>
            </div>
            <div>
              <dt>Graphics</dt>
              <dd>{report?.graphics ?? "Checking"}</dd>
            </div>
            <div>
              <dt>Critical wait</dt>
              <dd>{report ? `${report.durationMs} ms` : "Checking"}</dd>
            </div>
            <div>
              <dt>Failures</dt>
              <dd>{report ? report.failures.length : "Checking"}</dd>
            </div>
          </dl>

          <div className={styles.controls} aria-label="Loader previews">
            <button type="button" onClick={() => replay("first", "auto")}>
              Replay first visit
            </button>
            <button type="button" onClick={() => replay("repeat", "auto")}>
              Preview repeat visit
            </button>
            <button type="button" onClick={() => replay("first", "fallback")}>
              Preview fallback
            </button>
          </div>
        </section>

        <section className={styles.acceptance} aria-labelledby="loader-acceptance-title">
          <div className="page-frame">
            <p className="eyebrow">Responsive contract</p>
            <h2 id="loader-acceptance-title">The invitation remains legible in every mode.</h2>
            <div className={styles.modeGrid}>
              <article>
                <span>01</span>
                <h3>Desktop</h3>
                <p>Offset arcs assemble around the seal before the paper field uncovers.</p>
              </article>
              <article>
                <span>02</span>
                <h3>Mobile</h3>
                <p>The same hierarchy is retained with a smaller orbit and shorter travel.</p>
              </article>
              <article>
                <span>03</span>
                <h3>Reduced motion</h3>
                <p>Readiness still resolves, but movement is removed and content appears intact.</p>
              </article>
              <article>
                <span>04</span>
                <h3>Fallback</h3>
                <p>The architectural poster carries the full composition without a canvas.</p>
              </article>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
