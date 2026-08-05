import { useController, useFormContext } from "react-hook-form";
import { useLanguage } from "../../../context/LanguageContext";
import { NEED_LABELS_ID, NEED_OPTIONS, type NeedValue } from "../applicationOptions";
import { translateApplicationError } from "../applicationTranslations";
import type { ApplicationValues } from "../applicationSchema";
import { ApplicationSection } from "./ApplicationSection";
import styles from "./ApplicationForm.module.css";

export function NeedsFields() {
  const { language } = useLanguage();
  const id = language === "id";
  const { control } = useFormContext<ApplicationValues>();
  const {
    field,
    fieldState: { error },
  } = useController({ control, name: "needs" });
  const descriptionId = "needs-description";
  const errorId = "needs-error";

  const toggle = (value: NeedValue, checked: boolean) => {
    const current = field.value ?? [];
    if (!checked) {
      field.onChange(current.filter((entry) => entry !== value));
      return;
    }
    if (value === "not-sure") {
      field.onChange([value]);
      return;
    }
    field.onChange([...current.filter((entry) => entry !== "not-sure"), value]);
  };

  return (
    <ApplicationSection
      id="what-you-need"
      number="02"
      title={id ? "Yang Anda butuhkan" : "What you need"}
      introduction={id ? "Pilih yang berguna saat ini. Lingkup dapat disempurnakan dalam percakapan." : "Choose only what is useful now. The scope can be refined in conversation."}
    >
      <fieldset className={styles.optionFieldset} aria-describedby={`${descriptionId}${error ? ` ${errorId}` : ""}`}>
        <legend className={styles.fieldsetLegend}>{id ? "Fungsi proyek" : "Project functions"}</legend>
        <p className={styles.description} id={descriptionId}>
          {id ? "Pilih semua yang sesuai. “Belum yakin” tetap merupakan jawaban lengkap." : "Select all that apply. “Not sure yet” remains a complete answer."}
        </p>
        <div className={styles.optionGrid}>
          {NEED_OPTIONS.map((option) => (
            <label className={styles.checkOption} key={option.value}>
              <input
                type="checkbox"
                name={field.name}
                value={option.value}
                checked={field.value.includes(option.value)}
                onBlur={field.onBlur}
                onChange={(event) => toggle(option.value, event.currentTarget.checked)}
              />
              <span aria-hidden="true" className={styles.checkMark} />
              <span>{id ? NEED_LABELS_ID[option.value] : option.label}</span>
            </label>
          ))}
        </div>
        {error?.message ? (
          <p className={styles.error} id={errorId} role="alert">
            {translateApplicationError(error.message, language)}
          </p>
        ) : null}
      </fieldset>
    </ApplicationSection>
  );
}
