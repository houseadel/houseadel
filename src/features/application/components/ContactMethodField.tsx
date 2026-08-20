import { useMemo, type CSSProperties } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useLanguage } from "../../../context/LanguageContext";
import { translateApplicationError } from "../applicationErrors";
import type { ApplicationValues } from "../applicationSchema";
import { CONTACT_METHODS, getCountryCallingOptions } from "../contactMethods";
import { FieldShell } from "./FieldShell";
import styles from "./ApplicationForm.module.css";

export function ContactMethodField({ index = 1 }: { index?: number }) {
  const { language } = useLanguage();
  const id = language === "id";
  const { control, register, formState: { errors } } = useFormContext<ApplicationValues>();
  const method = useWatch({ control, name: "contactMethod" });
  const countries = useMemo(() => getCountryCallingOptions(language), [language]);
  const methodError = errors.contactMethod?.message;
  const descriptionId = "enquiry-contact-method-description";
  const errorId = "enquiry-contact-method-error";
  const copy = id
    ? {
        heading: "Bagaimana kami dapat menghubungi Anda?",
        help: "Pilih satu. Kami hanya akan menggunakannya untuk membalas pertanyaan ini.",
        whatsapp: "WhatsApp",
        instagram: "Instagram",
        email: "Email",
        phoneLabel: "Nomor WhatsApp",
        phoneHelp: "Pilih kode negara, lalu masukkan nomor Anda.",
        country: "Negara dan kode panggilan",
        instagramLabel: "Nama pengguna atau tautan profil Instagram",
        instagramHelp: "Gunakan @namapengguna atau tautan profil lengkap.",
        emailLabel: "Alamat email",
      }
    : {
        heading: "How can we reach you?",
        help: "Choose one. We will only use it to reply to this inquiry.",
        whatsapp: "WhatsApp",
        instagram: "Instagram",
        email: "Email",
        phoneLabel: "WhatsApp number",
        phoneHelp: "Choose the country code, then enter your number.",
        country: "Country and calling code",
        instagramLabel: "Instagram username or profile link",
        instagramHelp: "Use @username or a complete profile link.",
        emailLabel: "Email address",
      };

  return (
    <div className={styles.contactBlock}>
      <fieldset
        className={`${styles.field} ${styles.contactMethod}`}
        data-invalid={methodError ? "true" : undefined}
        style={{ "--field-index": index } as CSSProperties}
        aria-describedby={[descriptionId, methodError ? errorId : ""].filter(Boolean).join(" ")}
      >
        {/* Required is the norm and is not announced here either; see FieldShell. */}
        <legend className={styles.label}>
          <span className={styles.question}>{copy.heading}</span>
        </legend>
        <p className={styles.description} id={descriptionId}>{copy.help}</p>
        <div className={styles.methodChoices}>
          {CONTACT_METHODS.map((value) => (
            <label className={styles.methodChoice} data-selected={method === value ? "true" : undefined} key={value}>
              <input type="radio" value={value} required {...register("contactMethod")} />
              <span>{copy[value]}</span>
            </label>
          ))}
        </div>
        {methodError ? (
          <p className={styles.error} id={errorId} role="alert">
            {translateApplicationError(methodError, language)}
          </p>
        ) : null}
      </fieldset>

      {method === "whatsapp" ? (
        <div className={styles.contactReveal}>
          <FieldShell
            id="enquiry-whatsapp"
            label={copy.phoneLabel}
            description={copy.phoneHelp}
            error={errors.whatsapp?.message}
            required
            index={index + 1}
          >
            {(describedBy) => (
              <div className={styles.phoneFields}>
                <select
                  className={styles.select}
                  aria-label={copy.country}
                  aria-describedby={describedBy || undefined}
                  {...register("contactCountry")}
                >
                  {countries.map((country) => (
                    <option key={country.country} value={country.country}>
                      {country.name} (+{country.callingCode})
                    </option>
                  ))}
                </select>
                <input
                  className={styles.input}
                  id="enquiry-whatsapp"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  maxLength={40}
                  required
                  aria-invalid={Boolean(errors.whatsapp)}
                  aria-describedby={describedBy || undefined}
                  placeholder={id ? "811 7783 600" : "Phone number"}
                  {...register("whatsapp")}
                />
              </div>
            )}
          </FieldShell>
        </div>
      ) : null}

      {method === "instagram" ? (
        <div className={styles.contactReveal}>
          <FieldShell
            id="enquiry-instagram"
            label={copy.instagramLabel}
            description={copy.instagramHelp}
            error={errors.instagram?.message}
            required
            index={index + 1}
          >
            {(describedBy) => (
              <input
                className={styles.input}
                id="enquiry-instagram"
                type="text"
                autoComplete="username"
                maxLength={254}
                required
                aria-invalid={Boolean(errors.instagram)}
                aria-describedby={describedBy || undefined}
                placeholder="@username"
                {...register("instagram")}
              />
            )}
          </FieldShell>
        </div>
      ) : null}

      {method === "email" ? (
        <div className={styles.contactReveal}>
          <FieldShell
            id="enquiry-email"
            label={copy.emailLabel}
            error={errors.email?.message}
            required
            index={index + 1}
          >
            {(describedBy) => (
              <input
                className={styles.input}
                id="enquiry-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                maxLength={254}
                required
                aria-invalid={Boolean(errors.email)}
                aria-describedby={describedBy || undefined}
                placeholder="name@example.com"
                {...register("email")}
              />
            )}
          </FieldShell>
        </div>
      ) : null}
    </div>
  );
}
