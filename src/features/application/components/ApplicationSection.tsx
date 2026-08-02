import type { ReactNode } from "react";
import styles from "./ApplicationForm.module.css";

type ApplicationSectionProps = {
  id: string;
  number: string;
  title: string;
  introduction: string;
  children: ReactNode;
};

export function ApplicationSection({
  id,
  number,
  title,
  introduction,
  children,
}: ApplicationSectionProps) {
  return (
    <section className={styles.section} id={id} aria-labelledby={`${id}-heading`}>
      <header className={styles.sectionHeader}>
        <p className={styles.sectionNumber}>{number}</p>
        <div>
          <h2 className={styles.sectionTitle} id={`${id}-heading`}>
            {title}
          </h2>
          <p className={styles.sectionIntroduction}>{introduction}</p>
        </div>
      </header>
      <div className={styles.fields}>{children}</div>
    </section>
  );
}

