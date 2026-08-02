import type { ApplicationStep } from "../applicationProgress";
import styles from "./ApplicationForm.module.css";

type ProgressRailProps = {
  steps: ApplicationStep[];
};

export function ProgressRail({ steps }: ProgressRailProps) {
  const completed = steps.filter((step) => step.complete).length;
  const percentage = Math.round((completed / steps.length) * 100);

  return (
    <aside className={styles.progressRail} aria-label="Application progress">
      <div className={styles.railHeading}>
        <p>Application outline</p>
        <p aria-live="polite">
          {completed} of {steps.length}
        </p>
      </div>
      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-label="Application sections completed"
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
              <span>{step.label}</span>
              <span className={styles.stepState}>{step.complete ? "Complete" : "Open"}</span>
            </a>
          </li>
        ))}
      </ol>
      <p className={styles.autosaveNote}>
        Coarse scope choices are saved on this device. Names, dates, locations, stories, links and contact details are not.
      </p>
    </aside>
  );
}

