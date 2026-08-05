import { lazy, Suspense } from "react";
import { useLanguage } from "../context/LanguageContext";
import { PRIVATE_COMMISSION_MINIMUM_USD } from "../features/commissions/commissionContent";
import styles from "./CommissionsPage.module.css";

const ApplicationForm = lazy(() =>
  import("../features/application/components/ApplicationForm").then((module) => ({
    default: module.ApplicationForm,
  })),
);

const accepts = [
  {
    en: ["Private wedding websites", "A one-of-one digital invitation and guest experience developed from the occasion itself."],
    id: ["Situs pernikahan privat", "Undangan digital dan pengalaman tamu satu-satunya, dikembangkan dari perayaan itu sendiri."],
  },
  {
    en: ["Invitation systems", "Save-the-date, invitations, event access, travel guidance and response flows as one authored system."],
    id: ["Sistem undangan", "Save-the-date, undangan, akses acara, panduan perjalanan, dan alur respons sebagai satu sistem."],
  },
  {
    en: ["Multilingual guest journeys", "Language, content states and guest-specific information designed into the architecture from the start."],
    id: ["Perjalanan tamu multibahasa", "Bahasa, status konten, dan informasi khusus tamu dirancang ke dalam arsitektur sejak awal."],
  },
] as const;

const relationship = [
  {
    en: ["Conversation", "We read the practical outline and the personal fragments that may give the work its premise."],
    id: ["Percakapan", "Kami memahami garis besar praktis dan fragmen personal yang dapat memberi karya sebuah premis."],
  },
  {
    en: ["Direction", "One creative route is developed with enough clarity to test its language, material and behavior."],
    id: ["Arah", "Satu rute kreatif dikembangkan cukup jelas untuk menguji bahasa, material, dan perilakunya."],
  },
  {
    en: ["Construction", "Content, interaction and responsive development move together through reviewable stages."],
    id: ["Konstruksi", "Konten, interaksi, dan pengembangan responsif bergerak bersama melalui tahap yang dapat ditinjau."],
  },
  {
    en: ["Handover", "The final experience is rehearsed, documented and prepared for real guest use and practical updates."],
    id: ["Serah terima", "Pengalaman akhir diuji, didokumentasikan, dan disiapkan untuk penggunaan tamu serta pembaruan praktis."],
  },
] as const;

const formatInvestment = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
  PRIVATE_COMMISSION_MINIMUM_USD,
);

export function CommissionsPage() {
  const { language } = useLanguage();
  const isEnglish = language === "en";

  return (
    <div className={styles.page}>
      <header className={`${styles.hero} page-frame`}>
        <div className={styles.heroMeta}>
          <p>{isEnglish ? "Private commissions" : "Komisi privat"}</p>
          <p>House Adel · 2026</p>
        </div>
        <div className={styles.heroCopy}>
          <p className="eyebrow">{isEnglish ? "Created once · Never repeated" : "Diciptakan sekali · Tak diulang"}</p>
          <h1 data-route-heading tabIndex={-1}>
            {isEnglish ? <>Begin with <em>your world.</em></> : <>Mulai dari <em>dunia Anda.</em></>}
          </h1>
        </div>
        <div className={styles.heroLede}>
          <p>
            {isEnglish
              ? "A private commission joins creative direction and technical development around one occasion. It does not begin from a resold visual template."
              : "Komisi privat menyatukan arahan kreatif dan pengembangan teknis untuk satu perayaan. Proses ini tidak dimulai dari templat visual yang dijual ulang."}
          </p>
          <a className="text-link" href="#application" data-sonic>
            {isEnglish ? "Go to the application" : "Menuju formulir"}
          </a>
        </div>
      </header>

      <section className={`${styles.accepts} editorial-section page-frame`} aria-labelledby="accepts-title">
        <header>
          <p className="eyebrow">{isEnglish ? "What the house accepts" : "Yang diterima House Adel"}</p>
          <h2 id="accepts-title">
            {isEnglish ? "Focused commissions with a digital invitation at their centre." : "Komisi terarah dengan undangan digital sebagai pusatnya."}
          </h2>
        </header>
        <div className={styles.acceptGrid}>
          {accepts.map((item, index) => (
            <article key={item.en[0]} tabIndex={0} data-sonic>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item[language][0]}</h3>
              <p>{item[language][1]}</p>
            </article>
          ))}
        </div>
        <aside className={styles.notFit}>
          <p>{isEnglish ? "Usually not a fit" : "Biasanya tidak sesuai"}</p>
          <p>
            {isEnglish
              ? "Template reskins, styling-only engagements, unlicensed source material, or work that asks motion to compensate for unclear information."
              : "Penggantian tampilan templat, pekerjaan sebatas styling, materi sumber tanpa lisensi, atau karya yang meminta gerak menutupi informasi yang tidak jelas."}
          </p>
        </aside>
      </section>

      <section className={styles.relationship} aria-labelledby="relationship-title">
        <div className={`${styles.relationshipInner} page-frame`}>
          <header>
            <p className="eyebrow">{isEnglish ? "The relationship" : "Cara bekerja bersama"}</p>
            <h2 id="relationship-title">
              {isEnglish ? "Close enough to be personal. Structured enough to stay clear." : "Cukup dekat untuk terasa personal. Cukup terstruktur untuk tetap jelas."}
            </h2>
          </header>
          <ol>
            {relationship.map((item, index) => (
              <li key={item.en[0]}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{item[language][0]}</h3>
                  <p>{item[language][1]}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`${styles.practical} editorial-section page-frame`} aria-labelledby="practical-title">
        <header>
          <p className="eyebrow">{isEnglish ? "Before applying" : "Sebelum mengajukan"}</p>
          <h2 id="practical-title">
            {isEnglish ? "A few practical boundaries make the first conversation useful." : "Beberapa batas praktis membuat percakapan pertama lebih berguna."}
          </h2>
        </header>
        <dl>
          <div>
            <dt>{isEnglish ? "Minimum investment" : "Investasi minimum"}</dt>
            <dd>USD {formatInvestment}</dd>
          </div>
          <div>
            <dt>{isEnglish ? "Starting material" : "Materi awal"}</dt>
            <dd>{isEnglish ? "A concise outline is enough" : "Gambaran singkat sudah cukup"}</dd>
          </div>
          <div>
            <dt>{isEnglish ? "Privacy" : "Privasi"}</dt>
            <dd>{isEnglish ? "Public sharing is never assumed" : "Publikasi tidak pernah dianggap otomatis"}</dd>
          </div>
          <div>
            <dt>{isEnglish ? "Availability" : "Ketersediaan"}</dt>
            <dd>{isEnglish ? "Confirmed only after review" : "Dikonfirmasi setelah peninjauan"}</dd>
          </div>
        </dl>
        <p>
          {isEnglish
            ? "Applying does not reserve availability or create a project agreement. Final scope, timing and investment are defined after the brief is reviewed."
            : "Pengajuan tidak menjamin ketersediaan atau membentuk perjanjian proyek. Lingkup, waktu, dan investasi akhir ditentukan setelah brief ditinjau."}
        </p>
      </section>

      <section className={styles.applicationIntro} id="application" aria-labelledby="application-title">
        <div className="page-frame">
          <p className="eyebrow">{isEnglish ? "The application" : "Formulir pengajuan"}</p>
          <h2 id="application-title">
            {isEnglish ? "Detailed enough to be useful. Open enough for uncertainty." : "Cukup rinci untuk berguna. Cukup terbuka untuk ketidakpastian."}
          </h2>
          <div className={styles.applicationNotes}>
            <p>{isEnglish ? "Five concise sections" : "Lima bagian ringkas"}</p>
            <p>{isEnglish ? "Draft saved on this device" : "Draf tersimpan di perangkat ini"}</p>
            <p>{isEnglish ? "Review before sending" : "Tinjau sebelum mengirim"}</p>
          </div>
        </div>
      </section>

      <section className={`${styles.application} page-frame`} aria-label={isEnglish ? "Commission application" : "Formulir komisi"}>
        <Suspense
          fallback={
            <p className={styles.formLoading} role="status">
              {isEnglish ? "Preparing the application" : "Menyiapkan formulir"}
            </p>
          }
        >
          <ApplicationForm />
        </Suspense>
      </section>
    </div>
  );
}

