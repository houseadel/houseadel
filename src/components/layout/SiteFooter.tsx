import { footerNavigation, primaryNavigation } from "../../data/navigation";
import { Link } from "../../lib/router";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.inner} page-frame`}>
        <div className={styles.signature}>
          <p className="eyebrow">House Adel</p>
          <p className={styles.statement}>Digital invitations and private worlds for singular celebrations.</p>
        </div>

        <nav className={styles.navigation} aria-label="Footer navigation">
          {[...primaryNavigation, ...footerNavigation].map((item) => (
            <Link to={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.contact}>
          <a href="mailto:studio@houseadel.com">studio@houseadel.com</a>
          <p>Independent practice. Enquiries are reviewed personally.</p>
        </div>

        <p className={styles.copyright}>© {new Date().getFullYear()} House Adel</p>
      </div>
    </footer>
  );
}
