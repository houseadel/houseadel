import { PageIntro } from "../components/layout/PageIntro";
import { Link } from "../lib/router";
import styles from "./LegalPage.module.css";

export function TermsPage() {
  return (
    <article className={styles.page}>
      <PageIntro
        eyebrow="House notes / Terms"
        title="Terms of use."
        lede="About using this site, submitting an application and reading House Adel Studies. A signed project agreement governs commissioned work."
      />

      <div className={`${styles.body} page-frame page-grid`}>
        <aside className={styles.meta} aria-label="Document information">
          <p className="eyebrow">Last updated</p>
          <time dateTime="2026-08-02">2 August 2026</time>
          <a href="mailto:studio@houseadel.com">studio@houseadel.com</a>
        </aside>

        <div className={styles.sections}>
          <section aria-labelledby="terms-site">
            <h2 id="terms-site">Using this site</h2>
            <p>
              This site presents the House Adel practice, Editions, self-initiated studies and the application process.
              You may browse it and use its enquiry tools for genuine project enquiries. Do not attempt to disrupt the
              site, bypass security controls or submit content you do not have permission to share.
            </p>
          </section>

          <section aria-labelledby="terms-studies">
            <h2 id="terms-studies">Studies are not client claims</h2>
            <p>
              Work labelled “House Adel Study — Self-initiated.” is concept work created by the practice. It does not
              represent a client, wedding, commission, testimonial or measured result. Any credited open-access source
              material remains subject to the rights statement shown with that project.
            </p>
          </section>

          <section aria-labelledby="terms-applications">
            <h2 id="terms-applications">Applications and availability</h2>
            <p>
              Sending an application is a request for review, not an acceptance, reservation or project agreement. A
              receipt page only confirms delivery when the form service has accepted the submission. House
              Adel may decline an enquiry or ask for more information before discussing scope.
            </p>
          </section>

          <section aria-labelledby="terms-investment">
            <h2 id="terms-investment">Scope, timing and investment</h2>
            <p>
              Published Edition prices and the Private Commission minimum describe the stated offering at the
              time shown. The final deliverables, fees, payment schedule, timing, responsibilities and cancellation
              terms for accepted work are set out in a separate written agreement.
            </p>
          </section>

          <section aria-labelledby="terms-material">
            <h2 id="terms-material">Material and attribution</h2>
            <p>
              Do not reproduce House Adel writing, marks, layouts or original study material as your own. Rights in
              public-domain or licensed source material are not claimed beyond the House Adel transformations and
              presentation. Project-specific ownership and permitted use will be defined in the project agreement.
            </p>
          </section>

          <section aria-labelledby="terms-version">
            <h2 id="terms-version">Questions about these terms</h2>
            <p>
              These terms do not replace the project agreement used for commissioned work. Questions can be sent to
              {" "}<a href="mailto:studio@houseadel.com">studio@houseadel.com</a>.
            </p>
            <Link className="text-link" to="/apply">
              Read the application brief
            </Link>
          </section>
        </div>
      </div>
    </article>
  );
}
