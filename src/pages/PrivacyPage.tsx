import { PageIntro } from "../components/layout/PageIntro";
import styles from "./LegalPage.module.css";

export function PrivacyPage() {
  return (
    <article className={styles.page}>
      <PageIntro
        eyebrow="House notes / Privacy"
        title="Privacy, plainly stated."
        lede="How House Adel handles project enquiries, saved drafts and the services involved in delivery."
      />

      <div className={`${styles.body} page-frame page-grid`}>
        <aside className={styles.meta} aria-label="Document information">
          <p className="eyebrow">Last updated</p>
          <time dateTime="2026-08-02">2 August 2026</time>
          <a href="mailto:studio@houseadel.com">studio@houseadel.com</a>
        </aside>

        <div className={styles.sections}>
          <section aria-labelledby="privacy-collect">
            <h2 id="privacy-collect">Information the application asks for</h2>
            <p>
              The project application asks for contact details, celebration details, scope, timing, budget range,
              preferences and any reference links you choose to provide. Do not include passwords, financial account
              details, identity documents or other highly sensitive information.
            </p>
          </section>

          <section aria-labelledby="privacy-drafts">
            <h2 id="privacy-drafts">Drafts in this browser</h2>
            <p>
              Non-sensitive application progress may be saved to local storage on the device you are using. That draft
              remains in the browser until it is cleared through the application interface or the browser’s site data
              controls. A local draft is not a submitted application.
            </p>
          </section>

          <section aria-labelledby="privacy-submission">
            <h2 id="privacy-submission">Submission status</h2>
            <p>
              A submitted application is delivered only when the application page confirms receipt. A saved draft or
              an unconfirmed attempt is not delivered. If delivery is unavailable, the application remains unsent and
              the page identifies that state clearly.
            </p>
          </section>

          <section aria-labelledby="privacy-use">
            <h2 id="privacy-use">Intended use</h2>
            <p>
              Information from an accepted application is used to review the enquiry, respond using the preferred
              contact method, discuss fit and scope, and keep a record of the resulting correspondence. House Adel does
              not sell application information or use it for third-party advertising.
            </p>
          </section>

          <section aria-labelledby="privacy-services">
            <h2 id="privacy-services">External links and services</h2>
            <p>
              Reference links lead to services controlled by their respective providers. Any enquiry-delivery,
              anti-spam, email or private-record service that handles application data has its own privacy terms. House
              Adel names any such external service in this notice.
            </p>
          </section>

          <section aria-labelledby="privacy-choices">
            <h2 id="privacy-choices">Questions and choices</h2>
            <p>
              To ask what information House Adel holds about an enquiry, request correction or deletion, or raise a
              privacy question, email <a href="mailto:studio@houseadel.com">studio@houseadel.com</a>. A request may need
              enough information to identify the relevant correspondence.
            </p>
          </section>
        </div>
      </div>
    </article>
  );
}
