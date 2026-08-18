import type { CSSProperties, ReactNode } from "react";
import { useLanguage } from "../../../context/LanguageContext";
import { translateApplicationError } from "../applicationErrors";
import styles from "./ApplicationForm.module.css";

type FieldShellProps = {
  id: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  index?: number;
  children: (describedBy: string) => ReactNode;
};

export function FieldShell({ id, label, description, error, required = false, index = 0, children }: FieldShellProps) {
  const { language } = useLanguage();
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const describedBy = [description ? descriptionId : "", error ? errorId : ""].filter(Boolean).join(" ");

  return (
    <div
      className={styles.field}
      data-invalid={error ? "true" : undefined}
      style={{ "--field-index": index } as CSSProperties}
    >
      {/*
        Required is the norm here, so it is not announced.

        Every question used to carry a tracked uppercase REQUIRED or OPTIONAL
        beside it, which put a second piece of shouting typography next to each
        of nine questions and made the state of the field compete with the
        question itself. Answering is the expectation; the only thing worth
        saying is where it is not, and that is said quietly, in lower case, once.
        The field's own `required` attribute and `aria-invalid` still carry the
        state properly to assistive technology, which is where it belongs.
      */}
      <label className={styles.label} htmlFor={id}>
        <span className={styles.question}>{label}</span>
        {required ? null : (
          <span className={styles.requirement}>{language === "en" ? "optional" : "opsional"}</span>
        )}
      </label>
      {description ? <p className={styles.description} id={descriptionId}>{description}</p> : null}
      {children(describedBy)}
      {error ? (
        <p className={styles.error} id={errorId} role="alert">
          {translateApplicationError(error, language)}
        </p>
      ) : null}
    </div>
  );
}
