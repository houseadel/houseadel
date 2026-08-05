import { useLanguage } from "../../context/LanguageContext";
import { primaryNavigation } from "../../data/navigation";
import { Link } from "../../lib/router";
import { resolveAppUrl } from "../../lib/basePath";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  const { language } = useLanguage();
  const copy =
    language === "en"
      ? {
          eyebrow: "A digital invitation house",
          statement: "A private world, made legible for every guest.",
          begin: "Begin a commission",
          note: "Independent practice. Enquiries are reviewed personally.",
          privacy: "Privacy",
          terms: "Terms",
        }
      : {
          eyebrow: "Studio undangan digital",
          statement: "Sebuah dunia privat, dibuat jelas bagi setiap tamu.",
          begin: "Mulai komisi",
          note: "Praktik independen. Setiap pertanyaan ditinjau secara pribadi.",
          privacy: "Privasi",
          terms: "Ketentuan",
        };

  return (
    <footer className={styles.footer}>
      <div className={`${styles.inner} page-frame`}>
        <div className={styles.signature}>
          <p className="eyebrow">{copy.eyebrow}</p>
          <p className={styles.statement}>{copy.statement}</p>
          <Link className={styles.begin} to="/commissions#application" data-sonic>
            {copy.begin} <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <nav className={styles.navigation} aria-label={language === "en" ? "Footer navigation" : "Navigasi kaki halaman"}>
          {primaryNavigation.map((item, index) => (
            <Link to={item.href} key={item.href} data-sonic>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {language === "en" ? item.label : item.labelId}
            </Link>
          ))}
        </nav>

        <div className={styles.contact}>
          <a href="mailto:studio@houseadel.com" data-sonic>studio@houseadel.com</a>
          <p>{copy.note}</p>
        </div>

        <div className={styles.lower}>
          <p>© {new Date().getFullYear()} House Adel</p>
          <nav aria-label={language === "en" ? "Legal" : "Legalitas"}>
            <Link to="/privacy">{copy.privacy}</Link>
            <Link to="/terms">{copy.terms}</Link>
          </nav>
        </div>
        <img className={styles.mark} src={resolveAppUrl("/adel-mark.svg")} alt="" aria-hidden="true" />
      </div>
    </footer>
  );
}
