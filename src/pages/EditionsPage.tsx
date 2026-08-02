import { PageIntro } from "../components/layout/PageIntro";
import { editions, formatEditionPrice } from "../data/editions";
import { EditionPlate } from "../features/editions/EditionPlate";
import { Link } from "../lib/router";
import styles from "./EditionsPage.module.css";

export function EditionsPage() {
  return (
    <div className={styles.page}>
      <PageIntro
        eyebrow="House Editions"
        title="Original worlds, composed to become personal."
        lede={
          <>
            Each Edition begins with an authored House Adel concept. Names, information and
            selected personal material enter a system whose composition remains deliberately
            intact.
          </>
        }
      >
        <div className={styles.distinction}>
          <p>An Edition begins with a world created by House Adel.</p>
          <p>A Private Commission begins with the client’s world.</p>
        </div>
      </PageIntro>

      <section className={`${styles.catalogue} page-frame`} aria-labelledby="edition-index-heading">
        <header className={styles.sectionHeader}>
          <p>Living catalogue · First collection</p>
          <h2 id="edition-index-heading">Three worlds, each with a defined form.</h2>
          <p>
            Each is presented as a House Adel Study — Self-initiated. Scope, timing and Edition
            investment are stated directly; no commissioned wedding is represented.
          </p>
        </header>

        <ol className={styles.plates}>
          {editions.map((edition, index) => (
            <li key={edition.slug}>
              <article className={styles.plate}>
                <div className={styles.visual}>
                  <EditionPlate edition={edition} assetIndex={index % edition.theme.imageSet.length} />
                </div>

                <div className={styles.content}>
                  <p className={styles.number}>{edition.number}</p>
                  <h3>{edition.title}</h3>
                  <p className={styles.studyLabel}>{edition.studyLabel}</p>
                  <p className={styles.atmosphere}>{edition.atmosphere}</p>

                  <dl className={styles.facts}>
                    <div>
                      <dt>Availability</dt>
                      <dd>{edition.availability}</dd>
                    </div>
                    <div>
                      <dt>Edition investment</dt>
                      <dd>{formatEditionPrice(edition.priceUSD)} USD</dd>
                    </div>
                    <div>
                      <dt>Typical timeframe</dt>
                      <dd>{edition.timeframe}</dd>
                    </div>
                    <div>
                      <dt>Defined scope</dt>
                      <dd>Invitation, website and guest response</dd>
                    </div>
                  </dl>

                  <Link className={styles.openLink} to={`/editions/${edition.slug}`}>
                    Open {edition.title} and try the live invitation
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </section>

      <section className={`${styles.privatePrompt} page-frame`} aria-labelledby="edition-private-heading">
        <p className={styles.number}>Outside the Edition system</p>
        <h2 id="edition-private-heading">When the form must begin elsewhere.</h2>
        <p>
          Private Commissions are created from zero, are never resold and are never converted
          into an Edition.
        </p>
        <Link className={styles.openLink} to="/private-commissions">
          Understand Private Commissions
        </Link>
      </section>
    </div>
  );
}
