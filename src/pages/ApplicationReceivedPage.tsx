import { PageIntro } from "../components/layout/PageIntro";
import { Link } from "../lib/router";
import styles from "./ApplicationReceivedPage.module.css";

type ApplicationReceivedPageProps = {
  search?: string;
};

export function ApplicationReceivedPage({ search }: ApplicationReceivedPageProps) {
  const parameters = new URLSearchParams(search ?? window.location.search);
  const isConfirmed = parameters.get("confirmed") === "1";

  if (!isConfirmed) {
    return (
      <div className={styles.page}>
        <PageIntro
          eyebrow="Application status"
          title="Submission not confirmed."
          lede="Opening this address directly does not mean an application was sent or accepted by a submission provider."
        >
          <div className={styles.actions}>
            <Link className="button-link button-link--garnet" to="/apply">
              Return to the application
            </Link>
            <Link className="text-link" to="/">
              Return home
            </Link>
          </div>
        </PageIntro>
        <section className={`${styles.note} page-frame`} aria-labelledby="unconfirmed-note">
          <p className="eyebrow">Why you are seeing this</p>
          <h2 id="unconfirmed-note">Receipt is shown only after a real provider response.</h2>
          <p>
            In local or mock mode, the application can be reviewed and validated without being delivered. The submit
            interface will identify that state rather than redirecting here deceptively.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageIntro
        eyebrow="Application"
        title="Your application has been received."
        lede="We review every project personally. If the occasion and scope are suitable for House Adel, we will contact you using your preferred method."
      >
        <div className={styles.actions}>
          <Link className="button-link" to="/">
            Return to House Adel
          </Link>
        </div>
      </PageIntro>
      <section className={`${styles.note} page-frame`} aria-labelledby="next-note">
        <p className="eyebrow">What happens next</p>
        <h2 id="next-note">The brief will be read as a whole.</h2>
        <p>
          There is no additional action required on this page. Keep any provider-generated reference included with your
          submission for your records.
        </p>
      </section>
    </div>
  );
}
