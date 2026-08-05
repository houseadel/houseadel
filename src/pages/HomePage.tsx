import { useLanguage } from "../context/LanguageContext";
import { CapabilityInstrument } from "../features/home/CapabilityInstrument";
import { SpatialOpening } from "../features/home/SpatialOpening";
import { Link } from "../lib/router";
import styles from "./HomePage.module.css";

const process = [
  {
    en: ["Read", "The occasion, its people and practical guest journey."],
    id: ["Memahami", "Perayaan, orang-orang di dalamnya, dan perjalanan praktis para tamu."],
  },
  {
    en: ["Distil", "Private material becomes a clear editorial and spatial premise."],
    id: ["Menyaring", "Materi privat menjadi premis editorial dan spasial yang jelas."],
  },
  {
    en: ["Compose", "Type, image, motion and information are authored as one system."],
    id: ["Menggubah", "Tipografi, gambar, gerak, dan informasi dirancang sebagai satu sistem."],
  },
  {
    en: ["Rehearse", "The experience is tested for real guests, devices and changing details."],
    id: ["Menguji", "Pengalaman diuji untuk tamu, perangkat, dan detail yang benar-benar berubah."],
  },
] as const;

export function HomePage() {
  const { language } = useLanguage();
  const isEnglish = language === "en";

  return (
    <div className={styles.page}>
      <SpatialOpening className={styles.opening} stageClassName={styles.openingStage}>
        <div className={`${styles.openingContent} page-frame`} data-spatial-content>
          <div className={styles.heroMeta} data-loader-reveal>
            <p>{isEnglish ? "Independent digital invitation studio" : "Studio undangan digital independen"}</p>
            <p>Jakarta · Worldwide</p>
          </div>
          <div className={styles.heroCopy}>
            <p className="eyebrow" data-loader-reveal>
              {isEnglish ? "Art direction · Design · Development" : "Arahan seni · Desain · Pengembangan"}
            </p>
            <h1 id="home-title" data-route-heading tabIndex={-1} data-loader-reveal>
              {isEnglish ? (
                <>Wedding websites, composed as <em>private worlds.</em></>
              ) : (
                <>Situs pernikahan, digubah menjadi <em>dunia privat.</em></>
              )}
            </h1>
            <p className={styles.lede} data-loader-reveal>
              {isEnglish
                ? "House Adel joins art direction, information design, motion and development into one considered guest experience."
                : "House Adel menyatukan arahan seni, desain informasi, gerak, dan pengembangan menjadi satu pengalaman tamu yang terarah."}
            </p>
            <div className={styles.openingActions} data-loader-reveal>
              <Link className="button-link button-link--garnet" to="/commissions" data-sonic>
                {isEnglish ? "Begin a commission" : "Mulai komisi"}
              </Link>
              <Link className="text-link" to="/work" data-sonic>
                {isEnglish ? "View the work archive" : "Lihat arsip karya"}
              </Link>
            </div>
          </div>
          <div className={styles.heroFoot} data-loader-reveal>
            <span>01—03</span>
            <p>{isEnglish ? "Scroll to unfold the field" : "Gulir untuk membuka bidang"}</p>
          </div>
        </div>
      </SpatialOpening>

      <section className={`${styles.position} editorial-section page-frame`} aria-labelledby="position-title">
        <p className="eyebrow">{isEnglish ? "The premise" : "Premis"}</p>
        <div>
          <h2 id="position-title">
            {isEnglish ? "An invitation is not a page around a photograph." : "Undangan bukan sekadar halaman di sekitar sebuah foto."}
          </h2>
          <div className={styles.positionCopy}>
            <p>
              {isEnglish
                ? "It is an entrance, an information system and a sequence of gestures. The visual world and technical architecture are developed together."
                : "Ia adalah sebuah ambang, sistem informasi, dan rangkaian gestur. Dunia visual dan arsitektur teknis dikembangkan bersama."}
            </p>
            <p>
              {isEnglish
                ? "The site itself is the proof: responsive, multilingual, accessible and able to hold practical change without losing its atmosphere."
                : "Situs ini menjadi buktinya: responsif, multibahasa, aksesibel, dan mampu menerima perubahan praktis tanpa kehilangan atmosfernya."}
            </p>
          </div>
        </div>
      </section>

      <section className={`${styles.capability} editorial-section page-frame`} aria-labelledby="capability-title">
        <div className={styles.sectionHeading}>
          <p className="eyebrow">{isEnglish ? "A working instrument" : "Instrumen yang bekerja"}</p>
          <h2 id="capability-title">
            {isEnglish ? "One invitation, read through four layers." : "Satu undangan, dibaca melalui empat lapisan."}
          </h2>
          <p>
            {isEnglish
              ? "Select a layer. The composition changes to show how the studio thinks—not only how it decorates."
              : "Pilih sebuah lapisan. Komposisi berubah untuk memperlihatkan cara studio berpikir—bukan hanya menghias."}
          </p>
        </div>
        <CapabilityInstrument />
      </section>

      <section className={styles.practice} aria-labelledby="practice-title">
        <div className={`${styles.practiceInner} page-frame`}>
          <header>
            <p className="eyebrow">{isEnglish ? "Inside the studio" : "Di dalam studio"}</p>
            <h2 id="practice-title">
              {isEnglish ? "A restrained process for authored work." : "Proses yang terukur untuk karya yang berkarakter."}
            </h2>
          </header>
          <ol>
            {process.map((step, index) => (
              <li key={step.en[0]}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{step[language][0]}</h3>
                <p>{step[language][1]}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`${styles.archive} editorial-section page-frame`} aria-labelledby="archive-title">
        <div className={styles.archiveIndex} aria-hidden="true">00</div>
        <div className={styles.archiveCopy}>
          <p className="eyebrow">{isEnglish ? "Completed commissions" : "Komisi yang telah selesai"}</p>
          <h2 id="archive-title">
            {isEnglish ? "The archive opens when the first work is ready." : "Arsip akan dibuka saat karya pertama siap."}
          </h2>
          <p>
            {isEnglish
              ? "No client work is being implied or invented. The Work page shows the case-study structure that future commissions will occupy."
              : "Tidak ada karya klien yang direka atau disiratkan. Halaman Karya menunjukkan struktur studi kasus yang kelak akan ditempati komisi."}
          </p>
          <Link className="text-link" to="/work" data-sonic>
            {isEnglish ? "Enter the empty archive" : "Masuk ke arsip kosong"}
          </Link>
        </div>
      </section>

      <section className={styles.invitation} aria-labelledby="invitation-title">
        <div className="page-frame">
          <p className="eyebrow">{isEnglish ? "For a particular occasion" : "Untuk sebuah perayaan tertentu"}</p>
          <h2 id="invitation-title">
            {isEnglish ? "Bring the fragments. We will find the form." : "Bawa fragmennya. Kami akan menemukan bentuknya."}
          </h2>
          <p>
            {isEnglish
              ? "A concise outline is enough to begin; dates and decisions may still be in formation."
              : "Gambaran singkat sudah cukup untuk memulai; tanggal dan keputusan boleh masih berkembang."}
          </p>
          <Link className="button-link button-link--garnet" to="/commissions#application" data-sonic>
            {isEnglish ? "Read about commissions" : "Pelajari komisi"}
          </Link>
        </div>
      </section>
    </div>
  );
}
