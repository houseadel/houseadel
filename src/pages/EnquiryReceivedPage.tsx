import { useLanguage } from "../context/LanguageContext";
import { InkText } from "../components/motion/InkText";
import { Link } from "../lib/router";
import styles from "./SentencePage.module.css";

export function EnquiryReceivedPage({ search }: { search?: string }) {
  const { language } = useLanguage();
  const isEnglish = language === "en";
  const parameters = new URLSearchParams(search ?? window.location.search);
  const isConfirmed = parameters.get("confirmed") === "1";

  // The gate stays: nothing here claims a send until the server confirmed one.
  const sentence = isConfirmed
    ? isEnglish
      ? "Your message has reached House Adel."
      : "Pesan Anda telah sampai ke House Adel."
    : isEnglish
      ? "Nothing has been sent yet: opening this address directly does not submit an enquiry."
      : "Belum ada yang dikirim: membuka alamat ini secara langsung tidak mengirim pertanyaan.";

  return (
    <div className={`${styles.page} page-frame`}>
      <InkText as="h1" id="received-title" className={styles.sentence}>
        {sentence}
      </InkText>
      <Link className={`${styles.action} action`} to={isConfirmed ? "/" : "/contact"} data-sonic>
        {isConfirmed
          ? isEnglish ? "Return home" : "Kembali ke beranda"
          : isEnglish ? "Return to the form" : "Kembali ke formulir"}
      </Link>
    </div>
  );
}
