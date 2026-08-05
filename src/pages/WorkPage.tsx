import { useLanguage } from "../context/LanguageContext";
import { Link } from "../lib/router";
import styles from "./WorkPage.module.css";

const anatomy = [
  {
    number: "01",
    title: { en: "The request", id: "Permintaan" },
    body: {
      en: "The practical need, private source material and question brought to the studio.",
      id: "Kebutuhan praktis, materi sumber privat, dan pertanyaan yang dibawa ke studio.",
    },
  },
  {
    number: "02",
    title: { en: "The response", id: "Tanggapan" },
    body: {
      en: "The premise, system and design decisions House Adel developed in return.",
      id: "Premis, sistem, dan keputusan desain yang dikembangkan House Adel sebagai jawaban.",
    },
  },
  {
    number: "03",
    title: { en: "The glimpse", id: "Cuplikan" },
    body: {
      en: "A carefully permitted view of the finished interaction—never private guest material by default.",
      id: "Tinjauan yang diizinkan atas interaksi akhir—tanpa menjadikan materi tamu privat sebagai standar publikasi.",
    },
  },
] as const;

export function WorkPage() {
  const { language } = useLanguage();
  const isEnglish = language === "en";

  return (
    <div className={styles.page}>
      <header className={`${styles.hero} page-frame`}>
        <div className={styles.heroMeta}>
          <p>{isEnglish ? "Completed commissions" : "Komisi yang telah selesai"}</p>
          <p>Archive · 00</p>
        </div>
        <h1 data-route-heading tabIndex={-1}>
          {isEnglish ? <>The work, <em>when it is ready.</em></> : <>Karya, <em>saat telah siap.</em></>}
        </h1>
        <div className={styles.heroFoot}>
          <p>
            {isEnglish
              ? "This archive is intentionally empty. House Adel will not invent a commission to make the studio appear older than it is."
              : "Arsip ini sengaja dibiarkan kosong. House Adel tidak akan mengarang komisi agar studio tampak lebih lama dari kenyataannya."}
          </p>
          <span aria-hidden="true">00</span>
        </div>
      </header>

      <section className={styles.emptyStage} aria-labelledby="empty-title">
        <div className={`${styles.emptyInner} page-frame`}>
          <div className={styles.registration} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <p className="eyebrow">{isEnglish ? "Archive status" : "Status arsip"}</p>
          <h2 id="empty-title">
            {isEnglish ? "No completed commissions are published yet." : "Belum ada komisi selesai yang dipublikasikan."}
          </h2>
          <p>
            {isEnglish
              ? "When work appears here, it will be named accurately, shown with permission and described through the relationship between request and response."
              : "Saat karya hadir di sini, ia akan dinamai secara akurat, ditampilkan dengan izin, dan dijelaskan melalui hubungan antara permintaan dan tanggapan."}
          </p>
        </div>
      </section>

      <section className={`${styles.template} editorial-section page-frame`} aria-labelledby="template-title">
        <header>
          <p className="eyebrow">{isEnglish ? "Case-study template" : "Templat studi kasus"}</p>
          <h2 id="template-title">
            {isEnglish ? "What each future record will reveal." : "Apa yang akan diungkap setiap catatan kelak."}
          </h2>
          <p>
            {isEnglish
              ? "This is an information structure, not a set of placeholder projects."
              : "Ini adalah struktur informasi, bukan kumpulan proyek pengisi."}
          </p>
        </header>
        <ol>
          {anatomy.map((item) => (
            <li key={item.number} tabIndex={0} data-sonic>
              <span>{item.number}</span>
              <h3>{item.title[language]}</h3>
              <p>{item.body[language]}</p>
              <em>{isEnglish ? "Reserved" : "Tersedia nanti"}</em>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.endNote} aria-labelledby="work-end-title">
        <div className="page-frame">
          <p className="eyebrow">{isEnglish ? "The beginning may be yours" : "Awalnya dapat menjadi milik Anda"}</p>
          <h2 id="work-end-title">
            {isEnglish ? "A first commission does not need a finished brief." : "Komisi pertama tidak membutuhkan brief yang sudah sempurna."}
          </h2>
          <Link className="button-link button-link--garnet" to="/commissions" data-sonic>
            {isEnglish ? "How commissioning works" : "Cara komisi bekerja"}
          </Link>
        </div>
      </section>
    </div>
  );
}

