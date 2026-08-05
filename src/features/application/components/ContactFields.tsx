import { useFormContext } from "react-hook-form";
import { useLanguage } from "../../../context/LanguageContext";
import { Link } from "../../../lib/router";
import { CONTACT_METHOD_LABELS, CONTACT_METHOD_LABELS_ID, CONTACT_METHOD_VALUES } from "../applicationOptions";
import { FIELD_LIMITS, type ApplicationValues } from "../applicationSchema";
import { translateApplicationError } from "../applicationTranslations";
import { ApplicationSection } from "./ApplicationSection";
import { FieldShell } from "./FieldShell";
import { TurnstileField } from "./TurnstileField";
import styles from "./ApplicationForm.module.css";

export function ContactFields() {
  const { language } = useLanguage();
  const id = language === "id";
  const {
    register,
    formState: { errors },
  } = useFormContext<ApplicationValues>();

  return (
    <ApplicationSection
      id="contact"
      number="05"
      title={id ? "Kontak" : "Contact"}
      introduction={id ? "Detail ini hanya digunakan untuk meninjau dan menanggapi pengajuan." : "These details are used only to review and respond to this application."}
    >
      <FieldShell
        id="contact-name"
        label={id ? "Nama kontak" : "Contact name"}
        description={id ? "Orang yang perlu dihubungi House Adel mengenai proyek." : "The person House Adel should contact about the project."}
        error={errors.contactName?.message}
        required
      >
        {(describedBy) => (
          <input
            className={styles.input}
            id="contact-name"
            type="text"
            autoComplete="name"
            maxLength={120}
            required
            aria-invalid={Boolean(errors.contactName)}
            aria-describedby={describedBy}
            {...register("contactName")}
          />
        )}
      </FieldShell>

      <div className={styles.fieldPair}>
        <FieldShell
          id="contact-email"
          label="Email"
          description={id ? "Digunakan untuk tanggapan pengajuan, tanpa pemasaran yang tidak terkait." : "Used for the application response and no unrelated marketing."}
          error={errors.email?.message}
          required
        >
          {(describedBy) => (
            <input
              className={styles.input}
              id="contact-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={254}
              required
              aria-invalid={Boolean(errors.email)}
              aria-describedby={describedBy}
              {...register("email")}
            />
          )}
        </FieldShell>
        <FieldShell
          id="contact-phone"
          label={id ? "WhatsApp atau telepon" : "WhatsApp or phone"}
          description={id ? "Wajib hanya jika WhatsApp atau telepon menjadi metode pilihan." : "Required only when WhatsApp or phone is the preferred method."}
          error={errors.phone?.message}
        >
          {(describedBy) => (
            <input
              className={styles.input}
              id="contact-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={FIELD_LIMITS.phone}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={describedBy}
              {...register("phone")}
            />
          )}
        </FieldShell>
      </div>

      <FieldShell
        id="preferred-contact"
        label={id ? "Metode kontak pilihan" : "Preferred contact method"}
        description={id ? "Pilih cara House Adel sebaiknya membalas, atau pilih “Belum yakin”." : "Choose how House Adel should reply, or select “Not sure yet.”"}
        error={errors.preferredContact?.message}
        required
      >
        {(describedBy) => (
          <select
            className={styles.select}
            id="preferred-contact"
            required
            aria-invalid={Boolean(errors.preferredContact)}
            aria-describedby={describedBy}
            {...register("preferredContact")}
          >
            {CONTACT_METHOD_VALUES.map((value) => (
              <option key={value} value={value}>
                {(id ? CONTACT_METHOD_LABELS_ID : CONTACT_METHOD_LABELS)[value]}
              </option>
            ))}
          </select>
        )}
      </FieldShell>

      <div className={styles.fieldPair}>
        <FieldShell
          id="contact-country"
          label={id ? "Negara" : "Country"}
          description={id ? "Negara tempat Anda mengajukan pertanyaan." : "The country from which you are enquiring."}
          error={errors.country?.message}
          required
        >
          {(describedBy) => (
            <input
              className={styles.input}
              id="contact-country"
              type="text"
              autoComplete="country-name"
              maxLength={120}
              required
              aria-invalid={Boolean(errors.country)}
              aria-describedby={describedBy}
              {...register("country")}
            />
          )}
        </FieldShell>
        <FieldShell
          id="contact-time-zone"
          label={id ? "Zona waktu" : "Time zone"}
          description={id ? "Contohnya, UTC+7 atau Asia/Jakarta." : "For example, UTC+7 or Asia/Jakarta."}
          error={errors.timeZone?.message}
          required
        >
          {(describedBy) => (
            <input
              className={styles.input}
              id="contact-time-zone"
              type="text"
              autoComplete="off"
              maxLength={120}
              required
              aria-invalid={Boolean(errors.timeZone)}
              aria-describedby={describedBy}
              {...register("timeZone")}
            />
          )}
        </FieldShell>
      </div>

      <FieldShell
        id="best-contact-time"
        label={id ? "Waktu kontak terbaik" : "Best contact time"}
        description={id ? "Rentang waktu umum sudah cukup." : "A broad window is enough."}
        error={errors.bestContactTime?.message}
      >
        {(describedBy) => (
          <input
            className={styles.input}
            id="best-contact-time"
            type="text"
            maxLength={FIELD_LIMITS.contactTime}
            aria-invalid={Boolean(errors.bestContactTime)}
            aria-describedby={describedBy}
            {...register("bestContactTime")}
          />
        )}
      </FieldShell>

      <div className={styles.consentField} data-invalid={errors.privacyConsent ? "true" : undefined}>
        <label className={styles.consentLabel}>
          <input
            type="checkbox"
            required
            aria-invalid={Boolean(errors.privacyConsent)}
            aria-describedby={errors.privacyConsent ? "privacy-note privacy-error" : "privacy-note"}
            {...register("privacyConsent")}
          />
          <span aria-hidden="true" className={styles.checkMark} />
          <span>{id ? "Saya menyetujui House Adel menggunakan detail ini untuk menilai dan menanggapi pengajuan." : "I consent to House Adel using these details to assess and respond to this application."}</span>
        </label>
        <p className={styles.description} id="privacy-note">
          {id ? "Baca " : "Review the "}<Link to="/privacy">{id ? "halaman Privasi" : "Privacy page"}</Link>{id ? " untuk informasi penanganan dan penyimpanan." : " for handling and retention information."}
        </p>
        {errors.privacyConsent?.message ? (
          <p className={styles.error} id="privacy-error" role="alert">
            {translateApplicationError(errors.privacyConsent.message, language)}
          </p>
        ) : null}
      </div>

      <TurnstileField />

      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="website">{id ? "Biarkan bidang ini kosong" : "Leave this field empty"}</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>
    </ApplicationSection>
  );
}
