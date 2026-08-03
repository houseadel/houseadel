import { SpatialOpening } from "../features/home/SpatialOpening";
import { ArchivalImage } from "../components/editorial/ArchivalImage";
import { archivalAssets } from "../data/archivalAssets";
import { editions, formatEditionPrice } from "../data/editions";
import { stories } from "../data/stories";
import { Link } from "../lib/router";
import styles from "./HomePage.module.css";

const practice = [
  "Art direction",
  "Invitation design",
  "Guest journeys",
  "Editorial systems",
  "Creative technology",
];

const currentEdition = editions[0];
const selectedStories = stories.slice(0, 2);

export function HomePage() {
  return (
    <div className={styles.page}>
      <SpatialOpening className={styles.opening} stageClassName={styles.openingStage}>
        <div className={`${styles.openingContent} page-frame`} data-spatial-content>
          <p className="eyebrow">House Adel · Digital invitation house</p>
          <h1 id="home-title" data-route-heading tabIndex={-1}>
            Digital invitations and private worlds for singular celebrations.
          </h1>
          <p>
            House Adel works across art direction, design and creative technology to create
            experiences shaped around the people and occasions they represent.
          </p>
          <div className={styles.openingActions}>
            <Link className="button-link button-link--garnet" to="/editions">
              Explore Editions
            </Link>
            <Link className="text-link" to="/private-commissions">
              Private Commissions
            </Link>
          </div>
        </div>
      </SpatialOpening>

      <section className={`${styles.statement} editorial-section page-frame`} aria-labelledby="statement-title">
        <p className="eyebrow">Two ways to begin</p>
        <h2 id="statement-title">The starting point changes everything.</h2>
        <div className={styles.statementPair}>
          <p>An Edition begins with a world created by House Adel.</p>
          <p>A Private Commission begins with the client&apos;s world.</p>
        </div>
      </section>

      <section className={`${styles.edition} editorial-section page-frame`} aria-labelledby="current-edition">
        <div className={styles.sectionIndex}>01 / Current Edition</div>
        <figure className={styles.editionPlate}>
          <ArchivalImage asset={archivalAssets.interior} alt={archivalAssets.interior.alt} />
          <div className={styles.editionImageVeil} aria-hidden="true" />
          <span>{currentEdition.number}</span>
          <figcaption>{archivalAssets.interior.title} · The Metropolitan Museum of Art</figcaption>
        </figure>
        <div className={styles.editionCopy}>
          <p className="study-label">{currentEdition.studyLabel}</p>
          <h2 id="current-edition">{currentEdition.title}</h2>
          <p>{currentEdition.atmosphere}</p>
          <dl>
            <div>
              <dt>Edition</dt>
              <dd>{currentEdition.number.replace("Edition", "No.")}</dd>
            </div>
            <div>
              <dt>Investment</dt>
              <dd>{formatEditionPrice(currentEdition.priceUSD)} USD</dd>
            </div>
            <div>
              <dt>Timeframe</dt>
              <dd>{currentEdition.timeframe}</dd>
            </div>
          </dl>
          <Link className="text-link" to={`/editions/${currentEdition.slug}`}>
            Enter the live Edition
          </Link>
        </div>
      </section>

      <section className={`${styles.private} editorial-section`} aria-labelledby="private-title">
        <div className={`${styles.privateInner} page-frame page-grid`}>
          <div className={styles.privateImage}>
            <ArchivalImage asset={archivalAssets.drawingRoom} alt={archivalAssets.drawingRoom.alt} />
            <p>{archivalAssets.drawingRoom.title} · Public Domain</p>
          </div>
          <div className={styles.privateLead}>
            <p className="eyebrow">Private Commissions</p>
            <h2 id="private-title">Created once. Never repeated.</h2>
          </div>
          <div className={styles.privateCopy}>
            <p>
              One-of-one art direction for a celebration that cannot begin with an existing
              House Adel world. The work starts with source material, conversation and a blank
              page.
            </p>
            <p>Private Commissions begin at USD 12,000. Availability is intentionally limited.</p>
            <Link className="button-link" to="/private-commissions">
              Visit the atelier table
            </Link>
          </div>
        </div>
      </section>

      <section className={`${styles.stories} editorial-section page-frame`} aria-labelledby="stories-title">
        <div className={styles.sectionIndex}>02 / Selected Stories</div>
        <h2 id="stories-title" className="section-heading">
          The thinking behind an invitation.
        </h2>
        <div className={styles.storyRows}>
          {selectedStories.map((story) => (
            <Link key={story.slug} to={`/stories/${story.slug}`}>
              <span>{story.category}</span>
              <strong>{story.title}</strong>
              <span>Read story ↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={`${styles.practice} editorial-section page-frame`} aria-labelledby="practice-title">
        <div className={styles.practiceIntro}>
          <p className="eyebrow">Practice</p>
          <h2 id="practice-title">One house, across the full experience.</h2>
        </div>
        <ol>
          {practice.map((discipline, index) => (
            <li key={discipline}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {discipline}
            </li>
          ))}
        </ol>
      </section>

      <section className={`${styles.house} editorial-section page-frame page-grid`} aria-labelledby="house-title">
        <p className="eyebrow">The House</p>
        <div>
          <h2 id="house-title">An independent practice built for focused, authored work.</h2>
          <p>
            House Adel is the independent practice of Marshall Phan. Each project brings art
            direction, information design and creative development into one considered process.
          </p>
          <Link className="text-link" to="/the-house">
            Read about the House
          </Link>
        </div>
      </section>

      <section className={styles.apply} aria-labelledby="apply-title">
        <div className="page-frame">
          <p className="eyebrow">An invitation to begin</p>
          <h2 id="apply-title">Tell us what the occasion needs to become.</h2>
          <p>A concise brief is enough. Uncertainty is welcome.</p>
          <Link className="button-link button-link--garnet" to="/apply">
            Apply for a project
          </Link>
        </div>
      </section>
    </div>
  );
}
