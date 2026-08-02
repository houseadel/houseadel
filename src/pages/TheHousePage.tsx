import { PageIntro } from "../components/layout/PageIntro";
import { DrawnLine } from "../features/house/DrawnLine";
import { Link } from "../lib/router";
import styles from "./TheHousePage.module.css";

const disciplines = [
  "Art direction",
  "Editorial and interaction design",
  "Digital invitation design",
  "Guest journeys and RSVP",
  "Motion and creative development",
  "Responsive digital production",
] as const;

const standards = [
  "The idea is clear before anything moves.",
  "Names, dates and guest details remain readable at every moment.",
  "Mobile is composed for its own proportions.",
  "Guest tasks remain clear, direct and accessible.",
  "Every source image and text is licensed, credited and used with care.",
  "A private commission is never resold as an Edition.",
] as const;

export function TheHousePage() {
  return (
    <div className={styles.page}>
      <DrawnLine />
      <div className={styles.content}>
        <PageIntro
          eyebrow="The House"
          title="A practice drawn around the occasion."
          lede="House Adel creates authored digital invitations: original Editions and one-of-one Private Commissions."
        />

        <section className={`${styles.chapter} editorial-section page-frame page-grid`} aria-labelledby="why-heading">
          <p className={styles.number} aria-hidden="true">
            01
          </p>
          <div className={styles.chapterHeading}>
            <p className="eyebrow">Why House Adel exists</p>
            <h2 className="section-heading" id="why-heading">
              The invitation is the first space guests enter.
            </h2>
          </div>
          <div className={styles.chapterCopy}>
            <p>
              A digital invitation sits between publishing, ceremony and software. House Adel exists to give that space
              the clarity of an editorial object and the intimacy of something made for specific people.
            </p>
            <p>
              The work is not organised around a fixed wedding style. It begins with a premise, then aligns language,
              typography, material, sequence and guest needs around it.
            </p>
          </div>
        </section>

        <section className={`${styles.chapter} editorial-section page-frame page-grid`} aria-labelledby="founder-heading">
          <p className={styles.number} aria-hidden="true">
            02
          </p>
          <div className={styles.chapterHeading}>
            <p className="eyebrow">Founder</p>
            <h2 className="section-heading" id="founder-heading">
              Independent by design.
            </h2>
          </div>
          <div className={styles.chapterCopy}>
            <p className={styles.founderStatement}>House Adel is the independent practice of Marshall Phan.</p>
            <p>
              Marshall works across art direction, design and creative development so the visual premise, information
              architecture and functioning website are treated as one continuous piece of work.
            </p>
            <p>
              The practice stays deliberately close to each commission. When specialist collaboration would serve the
              work, it is discussed in advance and credited clearly.
            </p>
          </div>
        </section>

        <section className={`${styles.chapter} editorial-section page-frame page-grid`} aria-labelledby="approach-heading">
          <p className={styles.number} aria-hidden="true">
            03
          </p>
          <div className={styles.chapterHeading}>
            <p className="eyebrow">Approach</p>
            <h2 className="section-heading" id="approach-heading">
              One house. Two ways to begin.
            </h2>
          </div>
          <div className={styles.comparison}>
            <article>
              <span>01 / Editions</span>
              <h3>The world comes first.</h3>
              <p>
                House Adel creates an original concept, then offers controlled personalisation within its authored
                system, defined scope, price and timeframe.
              </p>
              <Link className="text-link" to="/editions">
                View House Editions
              </Link>
            </article>
            <article>
              <span>02 / Private</span>
              <h3>The client’s world comes first.</h3>
              <p>
                A new visual and functional system is made from the occasion’s source material. It is created once and
                never converted into an Edition.
              </p>
              <Link className="text-link" to="/private-commissions">
                Private Commissions
              </Link>
            </article>
          </div>
        </section>

        <section className={`${styles.chapter} editorial-section page-frame page-grid`} aria-labelledby="disciplines-heading">
          <p className={styles.number} aria-hidden="true">
            04
          </p>
          <div className={styles.chapterHeading}>
            <p className="eyebrow">Disciplines</p>
            <h2 className="section-heading" id="disciplines-heading">
              The work crosses form and function.
            </h2>
          </div>
          <ol className={styles.indexList}>
            {disciplines.map((discipline, index) => (
              <li key={discipline}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {discipline}
              </li>
            ))}
          </ol>
        </section>

        <section className={`${styles.chapter} editorial-section page-frame page-grid`} aria-labelledby="standards-heading">
          <p className={styles.number} aria-hidden="true">
            05
          </p>
          <div className={styles.chapterHeading}>
            <p className="eyebrow">Standards</p>
            <h2 className="section-heading" id="standards-heading">
              Restraint gives the work its form.
            </h2>
          </div>
          <ul className={styles.standardsList}>
            {standards.map((standard) => (
              <li key={standard}>{standard}</li>
            ))}
          </ul>
        </section>

        <section className={`${styles.closing} page-frame`} aria-labelledby="closing-heading">
          <p className={styles.number} aria-hidden="true">
            06
          </p>
          <p className="eyebrow">Closing line</p>
          <h2 id="closing-heading">The invitation is not outside the occasion. It is the first room of it.</h2>
          <p>
            If the next project calls for a composed digital world rather than a conventional invitation page, begin
            with the living brief.
          </p>
          <div className={styles.actions}>
            <Link className="button-link button-link--garnet" to="/apply">
              Apply for a project
            </Link>
            <a className="text-link" href="mailto:studio@houseadel.com">
              studio@houseadel.com
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
