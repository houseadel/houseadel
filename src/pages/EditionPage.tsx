import { PageIntro } from "../components/layout/PageIntro";
import { formatEditionPrice, getEdition } from "../data/editions";
import { EditionPlate } from "../features/editions/EditionPlate";
import { EditionPreview } from "../features/editions/EditionPreview";
import { Link } from "../lib/router";
import styles from "./EditionPage.module.css";

export function EditionPage({ slug }: { slug: string }) {
  const edition = getEdition(slug);

  if (!edition) {
    return (
      <div className={styles.notFound}>
        <PageIntro
          eyebrow="House Editions"
          title="This Edition is not in the collection."
          lede="The requested Edition may have moved or the address may be incomplete."
        />
        <div className="page-frame">
          <Link className={styles.textLink} to="/editions">
            Return to all Editions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className={styles.page}>
      <nav className={`${styles.breadcrumbs} page-frame`} aria-label="Breadcrumb">
        <Link to="/editions">Editions</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{edition.title}</span>
      </nav>

      <PageIntro eyebrow={edition.number} title={edition.title} lede={edition.atmosphere}>
        <p className={styles.studyLabel}>{edition.studyLabel}</p>
        <dl className={styles.introFacts}>
          <div>
            <dt>Availability</dt>
            <dd>{edition.availability}</dd>
          </div>
          <div>
            <dt>Investment</dt>
            <dd>{formatEditionPrice(edition.priceUSD)} USD</dd>
          </div>
          <div>
            <dt>Timeframe</dt>
            <dd>{edition.timeframe}</dd>
          </div>
        </dl>
      </PageIntro>

      <div className={`${styles.body} page-frame`}>
        <section className={styles.opening} aria-labelledby="edition-premise-heading">
          <div className={styles.openingText}>
            <p className={styles.eyebrow}>The Edition premise</p>
            <h2 id="edition-premise-heading">One world, held with intention.</h2>
            <p>{edition.summary}</p>
            <p>
              Personalisation enters defined places in the system. This protects the Edition’s
              art direction while ensuring the invitation reads as specific to the people and
              occasion it represents.
            </p>
          </div>
          <EditionPlate edition={edition} />
        </section>

        <EditionPreview edition={edition} />

        <section className={styles.scope} aria-labelledby="edition-scope-heading">
          <header>
            <p className={styles.eyebrow}>Defined scope</p>
            <h2 id="edition-scope-heading">What the Edition contains</h2>
          </header>
          <div>
            <h3>Experience</h3>
            <ul>
              {edition.scope.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Service</h3>
            <ul>
              {edition.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className={styles.boundaries} aria-labelledby="edition-boundaries-heading">
          <header>
            <p className={styles.eyebrow}>Controlled personalisation</p>
            <h2 id="edition-boundaries-heading">What changes. What remains.</h2>
          </header>
          <div>
            <h3>May change</h3>
            <ul>
              {edition.personalisation.mayChange.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Remains House Adel</h3>
            <ul>
              {edition.personalisation.remains.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className={styles.investment} aria-labelledby="edition-investment-heading">
          <p className={styles.eyebrow}>Selection</p>
          <h2 id="edition-investment-heading">
            {formatEditionPrice(edition.priceUSD)} USD
          </h2>
          <p>
            Exact Edition investment for the defined scope above. Additional events, languages
            or services are considered before engagement and quoted clearly.
          </p>
          <p>{edition.timeframe} from receipt of final content and the agreed project start.</p>
          <Link className={styles.applyLink} to={`/apply?interest=edition&edition=${edition.slug}`}>
            Apply for {edition.title}
          </Link>
          <Link className={styles.textLink} to="/editions">
            Compare all Editions
          </Link>
        </section>
      </div>
    </article>
  );
}
