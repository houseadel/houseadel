import type { ApplicationStep } from "../applicationProgress";
import { useLanguage } from "../../../context/LanguageContext";
import styles from "./ApplicationForm.module.css";

type ProgressRailProps = {
  steps: ApplicationStep[];
};

export function ProgressRail({ steps }: ProgressRailProps) {
  const { language } = useLanguage();
  const id = language === "id";
  const stepLabels: Record<string, string> = {
    "your-celebration": "Perayaan Anda",
    "what-you-need": "Yang Anda butuhkan",
    "the-story": "Cerita",
    scope: "Lingkup",
    contact: "Kontak",
  };
  const completed = steps.filter((step) => step.complete).length;
  const percentage = Math.round((completed / steps.length) * 100);

  return (
    <aside className={styles.progressRail} aria-label={id ? "Progres pengajuan" : "Application progress"}>
      <div className={styles.railHeading}>
        <p>{id ? "Garis besar pengajuan" : "Application outline"}</p>
        <p aria-live="polite">
          {completed} {id ? "dari" : "of"} {steps.length}
        </p>
      </div>
      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-label={id ? "Bagian pengajuan yang selesai" : "Application sections completed"}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
      >
        <span style={{ inlineSize: `${percentage}%` }} />
      </div>
      <ol className={styles.progressList}>
        {steps.map((step, index) => (
          <li key={step.id} data-complete={step.complete ? "true" : undefined}>
            <a href={`#${step.id}`}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <span>{id ? stepLabels[step.id] : step.label}</span>
              <span className={styles.stepState}>{step.complete ? (id ? "Selesai" : "Complete") : (id ? "Terbuka" : "Open")}</span>
            </a>
          </li>
        ))}
      </ol>
      <p className={styles.autosaveNote}>
        {id
          ? "Pilihan lingkup umum disimpan di perangkat ini. Nama, tanggal, lokasi, cerita, tautan, dan detail kontak tidak disimpan."
          : "Coarse scope choices are saved on this device. Names, dates, locations, stories, links and contact details are not."}
      </p>
    </aside>
  );
}
