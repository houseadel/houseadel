import { AtelierTable } from "./AtelierTable";
import { ArchivalImage } from "../../components/editorial/ArchivalImage";
import { archivalAssets } from "../../data/archivalAssets";
import {
  PRIVATE_COMMISSION_MINIMUM_USD,
  privateCommissionDisciplines,
  privateCommissionProcess,
} from "./commissionContent";
import { Link } from "../../lib/router";
import styles from "../../pages/PrivateCommissionsPage.module.css";

const minimumInvestment = `USD ${new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
}).format(PRIVATE_COMMISSION_MINIMUM_USD)}`;

export function PrivateCommissionsContent() {
  return (
    <>
      <section className={`${styles.tableSection} page-frame`} aria-labelledby="atelier-heading">
        <div className={styles.sectionIntroduction}>
          <p className="eyebrow">The atelier table</p>
          <h2 className="section-heading" id="atelier-heading">
            The world begins in fragments.
          </h2>
          <p className="section-copy">
            A route, a date, an object, a sentence, the light in a room. Source material remains distinct until a clear
            premise gives every part a reason to belong.
          </p>
        </div>
        <AtelierTable />
      </section>

      <section
        className={`${styles.meaning} editorial-section page-frame page-grid`}
        id="commissioning"
        aria-labelledby="meaning-heading"
      >
        <div className={styles.meaningHeading}>
          <p className="eyebrow">What private means</p>
          <h2 className="section-heading" id="meaning-heading">
            The client’s world is the beginning.
          </h2>
        </div>
        <div className={styles.meaningCopy}>
          <p>
            A Private Commission is created from zero for one occasion. Its creative direction, structure and
            interaction are not resold and do not become a House Edition.
          </p>
          <blockquote>
            <p>An Edition begins with a world created by House Adel.</p>
            <p>A Private Commission begins with the client’s world.</p>
          </blockquote>
          <p>
            Personalisation is not added to a predetermined visual system. The system itself is made around the story,
            practical needs and desired feeling of the celebration.
          </p>
        </div>
      </section>

      <section className={`${styles.study} editorial-section`} aria-labelledby="study-heading">
        <div className={`${styles.studyInner} page-frame page-grid`}>
          <div className={styles.studyPlate} aria-hidden="true">
            <ArchivalImage asset={archivalAssets.interior} alt="" sizes="(max-width: 48rem) 100vw, 50vw" />
            <span className={styles.studyImageVeil} />
            <span className={styles.studyAperture} />
            <span className={styles.studyFold} />
            <span className={styles.studyLine}>A route held between two points</span>
            <svg viewBox="0 0 620 760" role="presentation">
              <path d="M74 654c92-149 113-381 302-489 69-40 120-46 170-60" />
              <circle cx="75" cy="654" r="7" />
              <circle cx="546" cy="105" r="7" />
            </svg>
          </div>
          <div className={styles.studyCopy}>
            <p className="study-label">House Adel Study — Self-initiated.</p>
            <p className={styles.studyNumber}>Private study 01</p>
            <h2 id="study-heading">The Fold Between</h2>
            <p>
              A route, an architectural threshold and one private line of language gather into a single digital
              identity. The material is unlocated and created for this study; no client, wedding or commissioned event
              is represented.
            </p>
            <dl>
              <div>
                <dt>Premise</dt>
                <dd>Distance becomes a folded route.</dd>
              </div>
              <div>
                <dt>Format</dt>
                <dd>Invitation, guest guide and response flow.</dd>
              </div>
              <div>
                <dt>Material</dt>
                <dd>Paper, plan line, aperture and oxblood ink.</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className={`${styles.process} editorial-section page-frame`} aria-labelledby="process-heading">
        <div className={styles.sectionIntroduction}>
          <p className="eyebrow">Process</p>
          <h2 className="section-heading" id="process-heading">
            From private material to public invitation.
          </h2>
        </div>
        <ol className={styles.processList}>
          {privateCommissionProcess.map((step, index) => (
            <li key={step.title}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        className={`${styles.disciplines} editorial-section page-frame page-grid`}
        aria-labelledby="disciplines-heading"
      >
        <div className={styles.disciplinesHeading}>
          <p className="eyebrow">Disciplines</p>
          <h2 className="section-heading" id="disciplines-heading">
            One authored experience, across every layer.
          </h2>
        </div>
        <ul className={styles.disciplineList}>
          {privateCommissionDisciplines.map((discipline, index) => (
            <li key={discipline}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {discipline}
            </li>
          ))}
        </ul>
      </section>

      <section className={`${styles.availability} page-frame`} aria-labelledby="availability-heading">
        <p className="eyebrow">Availability</p>
        <h2 id="availability-heading">A limited number of commissions are reviewed at a time.</h2>
        <div className={styles.availabilityDetails}>
          <div>
            <span>Minimum investment</span>
            <data value={PRIVATE_COMMISSION_MINIMUM_USD}>{minimumInvestment}</data>
          </div>
          <p>
            Final investment and timing are defined after the brief is reviewed; applying does not reserve
            availability or create a project agreement.
          </p>
        </div>
        <div className={styles.availabilityActions}>
          <Link className="button-link button-link--garnet" to="/apply">
            Begin an application
          </Link>
          <a className="text-link" href="mailto:studio@houseadel.com">
            studio@houseadel.com
          </a>
        </div>
      </section>
    </>
  );
}
