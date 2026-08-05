import { useFormContext } from "react-hook-form";
import { useLanguage } from "../../../context/LanguageContext";
import { FIELD_LIMITS, type ApplicationValues } from "../applicationSchema";
import { ApplicationSection } from "./ApplicationSection";
import { FieldShell } from "./FieldShell";
import styles from "./ApplicationForm.module.css";

export function StoryFields() {
  const { language } = useLanguage();
  const id = language === "id";
  const {
    register,
    formState: { errors },
  } = useFormContext<ApplicationValues>();

  return (
    <ApplicationSection
      id="the-story"
      number="03"
      title={id ? "Cerita" : "The story"}
      introduction={id ? "Fragmen sangat berguna. Narasi panjang tidak diharapkan maupun diwajibkan." : "Fragments are useful. A long narrative is neither expected nor required."}
    >
      <FieldShell
        id="story-together"
        label={id ? "Ceritakan secara singkat tentang kalian" : "Tell us briefly about the two of you"}
        description={id ? "Beberapa baris faktual atau personal sudah cukup." : "A few factual or personal lines are enough."}
        error={errors.storyTogether?.message}
      >
        {(describedBy) => (
          <textarea
            className={styles.textarea}
            id="story-together"
            rows={5}
            maxLength={FIELD_LIMITS.narrative}
            aria-invalid={Boolean(errors.storyTogether)}
            aria-describedby={describedBy}
            {...register("storyTogether")}
          />
        )}
      </FieldShell>

      <FieldShell
        id="meaningful-material"
        label={id ? "Tempat, benda, ingatan, atau atmosfer yang bermakna" : "A meaningful place, object, memory or atmosphere"}
        description={id ? "Satu fragmen spesifik sering memberi titik awal yang paling jelas." : "One specific fragment often gives the clearest starting point."}
        error={errors.meaningfulMaterial?.message}
      >
        {(describedBy) => (
          <textarea
            className={styles.textarea}
            id="meaningful-material"
            rows={4}
            maxLength={FIELD_LIMITS.material}
            aria-invalid={Boolean(errors.meaningfulMaterial)}
            aria-describedby={describedBy}
            {...register("meaningfulMaterial")}
          />
        )}
      </FieldShell>

      <FieldShell
        id="opening-feeling"
        label={id ? "Apa yang seharusnya dirasakan tamu saat membuka undangan?" : "What should guests feel when opening the invitation?"}
        description={id ? "Beberapa kata sudah cukup—misalnya, penantian yang tenang atau keakraban yang hangat." : "A few words are enough—for example, quiet anticipation or generous informality."}
        error={errors.openingFeeling?.message}
        required
      >
        {(describedBy) => (
          <textarea
            className={styles.textarea}
            id="opening-feeling"
            rows={3}
            maxLength={FIELD_LIMITS.feeling}
            required
            aria-invalid={Boolean(errors.openingFeeling)}
            aria-describedby={describedBy}
            {...register("openingFeeling")}
          />
        )}
      </FieldShell>

      <FieldShell
        id="reference-links"
        label={id ? "Tautan referensi" : "Reference links"}
        description={id ? "Maksimal enam tautan http atau https lengkap, satu per baris. Berkas belum diterima pada versi ini." : "Up to six complete http or https links, one per line. Files are not accepted in version one."}
        error={errors.referenceLinks?.message}
      >
        {(describedBy) => (
          <textarea
            className={`${styles.textarea} ${styles.monospaceInput}`}
            id="reference-links"
            rows={4}
            inputMode="url"
            maxLength={FIELD_LIMITS.links}
            placeholder="https://"
            aria-invalid={Boolean(errors.referenceLinks)}
            aria-describedby={describedBy}
            {...register("referenceLinks")}
          />
        )}
      </FieldShell>

      <FieldShell
        id="existing-website"
        label={id ? "Tautan situs atau mood board yang ada" : "Existing website or mood-board link"}
        description={id ? "Gunakan tautan http atau https yang lengkap." : "Use a complete http or https link."}
        error={errors.existingWebsite?.message}
      >
        {(describedBy) => (
          <input
            className={styles.input}
            id="existing-website"
            type="url"
            inputMode="url"
            maxLength={FIELD_LIMITS.link}
            placeholder="https://"
            aria-invalid={Boolean(errors.existingWebsite)}
            aria-describedby={describedBy}
            {...register("existingWebsite")}
          />
        )}
      </FieldShell>
    </ApplicationSection>
  );
}
