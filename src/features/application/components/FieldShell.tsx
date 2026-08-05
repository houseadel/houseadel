import type { ReactNode } from "react";
import { useLanguage } from "../../../context/LanguageContext";
import { translateApplicationError } from "../applicationTranslations";
import styles from "./ApplicationForm.module.css";

type FieldShellProps = {
  id: string;
  label: string;
  description: string;
  error?: string;
  required?: boolean;
  children: (describedBy: string) => ReactNode;
};

export function FieldShell({
  id,
  label,
  description,
  error,
  required = false,
  children,
}: FieldShellProps) {
  const { language } = useLanguage();
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const describedBy = error ? `${descriptionId} ${errorId}` : descriptionId;

  return (
    <div className={styles.field} data-invalid={error ? "true" : undefined}>
      <label className={styles.label} htmlFor={id}>
        {label}
        <span className={styles.requirement}>
          {required
            ? language === "en" ? "Required" : "Wajib"
            : language === "en" ? "Optional" : "Opsional"}
        </span>
      </label>
      <p className={styles.description} id={descriptionId}>
        {description}
      </p>
      {children(describedBy)}
      {error ? (
        <p className={styles.error} id={errorId} role="alert">
          {translateApplicationError(error, language)}
        </p>
      ) : null}
    </div>
  );
}
