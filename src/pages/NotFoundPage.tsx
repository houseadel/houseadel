import { PageIntro } from "../components/layout/PageIntro";
import { Link } from "../lib/router";
import styles from "./NotFoundPage.module.css";

export function NotFoundPage() {
  return (
    <div className={styles.page}>
      <PageIntro
        eyebrow="House Adel / 404"
        title="This room is not on the plan."
        lede="The address may have changed, or the page may no longer belong to the House. Choose a known doorway below."
      >
        <div className={styles.actions}>
          <Link className="button-link button-link--garnet" to="/">
            Return home
          </Link>
          <Link className="text-link" to="/editions">
            House Editions
          </Link>
          <Link className="text-link" to="/apply">
            Apply for a project
          </Link>
        </div>
      </PageIntro>
      <div className={`${styles.plan} page-frame`} aria-hidden="true">
        <svg viewBox="0 0 1200 300" preserveAspectRatio="none" role="presentation">
          <path d="M20 270V44h348v147h236V78h570v192M368 44v52m236 95h168M954 78v84" />
          <path className={styles.missing} d="M772 191v-98h182v167H772" />
        </svg>
      </div>
    </div>
  );
}
