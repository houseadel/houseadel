import cinematicDesktop from "../assets/review-captures/cinematic-desktop-720.webp";
import cinematicMobile from "../assets/review-captures/cinematic-mobile-390.webp";
import fractureDesktop from "../assets/review-captures/fracture-desktop-720.webp";
import fractureMobile from "../assets/review-captures/fracture-mobile-390.webp";
import hybridDesktop from "../assets/review-captures/hybrid-desktop-720.webp";
import hybridMobile from "../assets/review-captures/hybrid-mobile-390.webp";

const captures = [
  {
    id: "A",
    title: "Graphic fracture",
    desktop: fractureDesktop,
    mobile: fractureMobile,
    desktopAlt:
      "Desktop Prototype A: three irregular photographic panes with visible project names.",
    mobileAlt:
      "Mobile Prototype A: the three panes recompose vertically with large readable project names.",
    note: "Desktop and mobile are different compositions. Navigation remains three ordinary links.",
  },
  {
    id: "B",
    title: "Real-time glass",
    desktop: hybridDesktop,
    mobile: hybridMobile,
    desktopAlt:
      "Desktop Prototype B: three shader-distorted photographic glass fragments above canonical project links.",
    mobileAlt:
      "Mobile Prototype B: the three real-time fragments recompose vertically above canonical links.",
    note: "Raycasting mirrors DOM selection. A visible control and context observer activate A on failure.",
  },
  {
    id: "C",
    title: "Cinematic compositor",
    desktop: cinematicDesktop,
    mobile: cinematicMobile,
    desktopAlt:
      "Desktop Prototype C: a dark cinematic Afterlight world with editorial copy and a project index.",
    mobileAlt:
      "Mobile Prototype C: the Afterlight composition reframed around large type and tactile project controls.",
    note: "The mobile version preserves narrative hierarchy instead of shrinking the desktop canvas.",
  },
];

export function VisualEvidence() {
  return (
    <section className="review-section visual-section" id="visual-evidence">
      <div className="section-heading section-heading--split">
        <div>
          <p className="overline">06 / Visual and responsive evidence</p>
          <h2>The same worlds, tested as systems—not as moodboards.</h2>
        </div>
        <p>
          These Playwright captures show desktop and emulated iPhone compositions. Open each live
          route above to judge focus, motion, history, and failure behavior directly.
        </p>
      </div>

      <div className="capture-grid">
        {captures.map((capture) => (
          <figure className="capture-card" key={capture.id}>
            <div className="capture-frame capture-frame--desktop">
              <img src={capture.desktop} alt={capture.desktopAlt} loading="lazy" />
            </div>
            <div className="capture-frame capture-frame--mobile">
              <img src={capture.mobile} alt={capture.mobileAlt} loading="lazy" />
            </div>
            <figcaption>
              <span>{capture.id}</span>
              <div>
                <strong>{capture.title}</strong>
                <p>{capture.note}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="visual-system-grid">
        <article className="type-specimen">
          <p className="card-kicker">House layer / typography hypothesis</p>
          <div aria-label="Newsreader display specimen">Connected realities.</div>
          <p>
            Newsreader gives the review layer an editorial, image-conscious voice. Manrope carries
            navigation, evidence, metadata, and controls. Neither face is approved as the permanent
            identity; the invariant under test is the contrast between expressive display and
            precise operational type.
          </p>
          <dl>
            <div>
              <dt>Display</dt>
              <dd>Newsreader variable / restrained contrast</dd>
            </div>
            <div>
              <dt>Interface</dt>
              <dd>Manrope variable / compact uppercase metadata</dd>
            </div>
          </dl>
        </article>

        <article className="motion-specimen">
          <p className="card-kicker">Motion and fallback comparison</p>
          <ul>
            <li>
              <span>A</span>
              <div>
                <strong>Graphic exit</strong>
                <p>Selected pane expands; other panes clear. Reduced motion commits immediately.</p>
              </div>
            </li>
            <li>
              <span>B</span>
              <div>
                <strong>Raycast mirror</strong>
                <p>Canvas intent mirrors DOM state. Context loss replaces the scene locally.</p>
              </div>
            </li>
            <li>
              <span>C</span>
              <div>
                <strong>Image-led dissolve</strong>
                <p>A shader blends frames; a time-bounded DOM matte guarantees route commit.</p>
              </div>
            </li>
          </ul>
        </article>
      </div>

      <div className="asset-requirements">
        <div>
          <span>A</span>
          <strong>Per world</strong>
          <p>1 master frame, 3 responsive crops, placeholder, static failure treatment.</p>
        </div>
        <div>
          <span>B</span>
          <strong>Per world</strong>
          <p>A’s set plus texture tiers, authored distortion data, optional depth/environment.</p>
        </div>
        <div>
          <span>C</span>
          <strong>Per world</strong>
          <p>Master, background plate, 1–3 isolated layers, matte/depth, optional 3–6 second loop.</p>
        </div>
      </div>
    </section>
  );
}
