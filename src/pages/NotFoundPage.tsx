import { useLanguage } from "../context/LanguageContext";
import { InkText } from "../components/motion/InkText";
import { Link } from "../lib/router";
import styles from "./SentencePage.module.css";

export function NotFoundPage() {
  const { language } = useLanguage();
  const isEnglish = language === "en";
  return (
    <div className={`${styles.page} page-frame`}>
      <InkText as="h1" id="notfound-title" className={styles.sentence}>
        {isEnglish
          ? "This page is no longer here, or the address is incorrect."
          : "Halaman ini sudah tidak ada, atau alamatnya salah."}
      </InkText>
      <Link className={`${styles.action} action`} to="/" data-sonic>
        {isEnglish ? "Return home" : "Kembali ke beranda"}
      </Link>
    </div>
  );
}
