import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { FormProvider, useForm, type FieldErrors } from "react-hook-form";
import { useLanguage } from "../../../context/LanguageContext";
import { Link } from "../../../lib/router";
import {
  APPLICATION_DEFAULTS,
  applicationResolver,
  type ApplicationValues,
} from "../applicationSchema";
import { createCommissionPayload, generateInquiryId } from "../commissionPayload";
import { submitApplication } from "../submitApplication";
import { ContactMethodField } from "./ContactMethodField";
import { FieldShell } from "./FieldShell";
import styles from "./ApplicationForm.module.css";

type StatusTone = "neutral" | "error";

const REQUIRED_ORDER: ReadonlyArray<keyof ApplicationValues> = [
  "name",
  "contactMethod",
  "whatsapp",
  "instagram",
  "email",
  "planning",
  "websitePurpose",
  "projectMeaning",
];

function growTextarea(event: FormEvent<HTMLTextAreaElement>) {
  const field = event.currentTarget;
  field.style.height = "auto";
  field.style.height = `${field.scrollHeight}px`;
}

export function ApplicationForm() {
  const { language } = useLanguage();
  const id = language === "id";
  const isEnglish = !id;
  const copy = useMemo(
    () => id
      ? {
          invalid: "Beberapa jawaban perlu diperiksa.",
          sending: "Mengirim",
          error: "Terjadi kesalahan. Jawaban Anda masih ada di sini. Silakan coba lagi.",
          submit: "Kirim pertanyaan",
          name: "Nama Anda",
          nameHelp: "Bagaimana kami sebaiknya menyapa Anda?",
          planning: "Apa yang sedang Anda rencanakan?",
          date: "Kapan acaranya?",
          dateHelp: "Perkiraan tanggal sudah cukup.",
          purpose: "Apa yang seharusnya dibantu oleh situs ini?",
          meaning: "Ceritakan sesuatu yang menjadi bagian dari proyek ini.",
          meaningHelp: "Bisa berupa tempat, kenangan, benda, foto, musik, tradisi, atau sesuatu yang berbeda.",
          optional: "Sudah memiliki gambaran yang lebih lengkap?",
          optionalHelp: "Bagikan sebanyak atau sesedikit yang Anda inginkan.",
          add: "Tambahkan detail",
          close: "Sembunyikan detail",
          more: "Ceritakan lebih lanjut",
          references: "Ada sesuatu yang ingin Anda tunjukkan kepada kami?",
          referencesHelp: "Google Drive, Pinterest, Instagram, Figma, Are.na, Dropbox, situs web, atau film. Apa pun yang berguna.",
          anythingElse: "Ada hal lain yang perlu kami ketahui?",
          received: "Diterima.",
          thanks: "Terima kasih.",
          confirmation: "Pesan Anda telah sampai ke House Adel. Kami akan membalas melalui kontak yang diberikan.",
          inquiry: "ID pertanyaan",
        }
      : {
          invalid: "A few answers need your attention.",
          sending: "Sending",
          error: "Something went wrong. Your answers are still here. Please try again.",
          submit: "Submit enquiry",
          name: "Your name",
          nameHelp: "How should we address you?",
          planning: "What are you planning?",
          date: "When is it for?",
          dateHelp: "An approximate date is enough.",
          purpose: "What should the website help people do?",
          meaning: "Tell us something that belongs to this project.",
          meaningHelp: "It could be a place, a memory, an object, a photograph, a piece of music, a tradition, or something completely different.",
          optional: "Already have more in mind?",
          optionalHelp: "Share as much or as little as you like.",
          add: "Add more details",
          close: "Hide more details",
          more: "Tell us more",
          references: "Anything you would like us to see?",
          referencesHelp: "Google Drive, Pinterest, Instagram, Figma, Are.na, Dropbox, a website, a film, anything useful.",
          anythingElse: "Anything else we should know?",
          received: "Received.",
          thanks: "Thank you.",
          confirmation: "Your message has reached House Adel. We will reply using the contact details provided.",
          inquiry: "Inquiry ID",
        },
    [id],
  );

  const methods = useForm<ApplicationValues>({
    defaultValues: APPLICATION_DEFAULTS,
    mode: "onBlur",
    reValidateMode: "onChange",
    resolver: applicationResolver,
    shouldFocusError: true,
  });
  const { register, formState: { errors } } = methods;
  const [status, setStatus] = useState("");
  const [statusTone, setStatusTone] = useState<StatusTone>("neutral");
  const [submitting, setSubmitting] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const formStartedAt = useRef(new Date());
  const pendingSubmissionId = useRef<string | null>(null);
  const activeRequest = useRef<AbortController | null>(null);
  const submissionInFlight = useRef(false);

  useEffect(
    () => () => {
      activeRequest.current?.abort();
    },
    [],
  );

  const handleInvalid = (fieldErrors: FieldErrors<ApplicationValues>) => {
    setStatusTone("error");
    setStatus(copy.invalid);
    const firstInvalid = REQUIRED_ORDER.find((field) => fieldErrors[field]);
    if (!firstInvalid) return;
    window.requestAnimationFrame(() => {
      const field = document.querySelector<HTMLElement>(`[name="${firstInvalid}"]`);
      if (field && typeof field.scrollIntoView === "function") {
        field.scrollIntoView({ block: "center", behavior: "smooth" });
      }
      field?.focus({ preventScroll: true });
    });
  };

  const send = async (validated: ApplicationValues) => {
    if (submissionInFlight.current || successId) return;
    submissionInFlight.current = true;
    const request = new AbortController();
    activeRequest.current = request;
    setSubmitting(true);
    setStatusTone("neutral");
    setStatus(copy.sending);

    const submittedAt = new Date();
    if (!pendingSubmissionId.current || !pendingSubmissionId.current.startsWith(`HA-I-${submittedAt.getUTCFullYear()}-`)) {
      pendingSubmissionId.current = generateInquiryId(submittedAt);
    }
    const payload = createCommissionPayload(validated, {
      submissionId: pendingSubmissionId.current,
      submittedAt,
      formStartedAt: formStartedAt.current,
    });

    try {
      const result = await submitApplication(payload, request.signal);
      setSuccessId(result.submissionId);
      setStatus("");
    } catch {
      setStatusTone("error");
      setStatus(copy.error);
    } finally {
      if (activeRequest.current === request) activeRequest.current = null;
      submissionInFlight.current = false;
      setSubmitting(false);
    }
  };

  if (successId) {
    return (
      <section className={styles.success} aria-live="polite" aria-labelledby="inquiry-received-title">
        <p className={styles.successEyebrow}>{copy.received}</p>
        <h2 id="inquiry-received-title">{copy.thanks}</h2>
        <p className={styles.successMessage}>{copy.confirmation}</p>
        <p className={styles.successId}>{copy.inquiry}: {successId}</p>
      </section>
    );
  }

  const textarea = (name: "planning" | "websitePurpose" | "projectMeaning" | "moreDetails" | "references" | "anythingElse") => {
    const registration = register(name);
    return { ...registration, onInput: growTextarea };
  };

  return (
    <FormProvider {...methods}>
      <form className={styles.form} onSubmit={methods.handleSubmit(send, handleInvalid)} noValidate aria-busy={submitting}>
        {status ? (
          <div className={styles.status} data-tone={statusTone} role={statusTone === "error" ? "alert" : "status"} aria-live="polite">
            {status}
          </div>
        ) : null}

        <div className={styles.coreFields}>
          <FieldShell id="enquiry-name" label={copy.name} description={copy.nameHelp} error={errors.name?.message} required index={0}>
            {(describedBy) => <input className={styles.input} id="enquiry-name" type="text" autoComplete="name" maxLength={160} required aria-invalid={Boolean(errors.name)} aria-describedby={describedBy || undefined} {...register("name")} />}
          </FieldShell>

          <ContactMethodField index={1} />

          <FieldShell id="enquiry-planning" label={copy.planning} error={errors.planning?.message} required index={2}>
            {(describedBy) => <textarea className={styles.textarea} id="enquiry-planning" rows={3} maxLength={4000} required aria-invalid={Boolean(errors.planning)} aria-describedby={describedBy || undefined} {...textarea("planning")} />}
          </FieldShell>

          <FieldShell id="enquiry-date" label={copy.date} description={copy.dateHelp} error={errors.eventDate?.message} index={3}>
            {(describedBy) => <input className={styles.input} id="enquiry-date" type="date" autoComplete="off" aria-invalid={Boolean(errors.eventDate)} aria-describedby={describedBy || undefined} {...register("eventDate")} />}
          </FieldShell>

          <FieldShell id="enquiry-purpose" label={copy.purpose} error={errors.websitePurpose?.message} required index={4}>
            {(describedBy) => <textarea className={styles.textarea} id="enquiry-purpose" rows={3} maxLength={4000} required aria-invalid={Boolean(errors.websitePurpose)} aria-describedby={describedBy || undefined} {...textarea("websitePurpose")} />}
          </FieldShell>

          <FieldShell id="enquiry-meaning" label={copy.meaning} description={copy.meaningHelp} error={errors.projectMeaning?.message} required index={5}>
            {(describedBy) => <textarea className={styles.textarea} id="enquiry-meaning" rows={3} maxLength={4000} required aria-invalid={Boolean(errors.projectMeaning)} aria-describedby={describedBy || undefined} {...textarea("projectMeaning")} />}
          </FieldShell>
        </div>

        {/*
          One line, not a chapter. What used to be here announced an optional
          extra with a headline larger than any of the questions above it.
        */}
        <div className={styles.more}>
          <button className={styles.moreToggle} type="button" aria-expanded={detailsOpen} aria-controls="more-details-panel" onClick={() => setDetailsOpen((open) => !open)}>
            {detailsOpen ? copy.close : copy.add}
            <span aria-hidden="true">{detailsOpen ? "−" : "+"}</span>
          </button>
          <div className={styles.morePanel} id="more-details-panel" hidden={!detailsOpen}>
            <FieldShell id="enquiry-more-details" label={copy.more} error={errors.moreDetails?.message} index={6}>
              {(describedBy) => <textarea className={styles.textarea} id="enquiry-more-details" rows={4} maxLength={4000} aria-invalid={Boolean(errors.moreDetails)} aria-describedby={describedBy || undefined} {...textarea("moreDetails")} />}
            </FieldShell>
          </div>
        </div>

        <div className={styles.closingFields}>
          <FieldShell id="enquiry-references" label={copy.references} description={copy.referencesHelp} error={errors.references?.message} index={7}>
            {(describedBy) => <textarea className={styles.textarea} id="enquiry-references" rows={3} maxLength={4000} inputMode="url" aria-invalid={Boolean(errors.references)} aria-describedby={describedBy || undefined} {...textarea("references")} />}
          </FieldShell>

          <FieldShell id="enquiry-anything-else" label={copy.anythingElse} error={errors.anythingElse?.message} index={8}>
            {(describedBy) => <textarea className={styles.textarea} id="enquiry-anything-else" rows={3} maxLength={4000} aria-invalid={Boolean(errors.anythingElse)} aria-describedby={describedBy || undefined} {...textarea("anythingElse")} />}
          </FieldShell>
        </div>

        <div className={styles.honeypot} aria-hidden="true">
          <label htmlFor="website">{id ? "Biarkan bidang ini kosong" : "Leave this field empty"}</label>
          <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
        </div>

        {/*
          The action first, the note about it second.

          These were the other way round, which put a paragraph of small print
          between the last question and the control that sends it. The
          acknowledgement is not a step in the enquiry; it is a fact about
          pressing the button, so it belongs under the button.
        */}
        <div className={styles.formActions}>
          <button className={`${styles.primaryButton} action`} type="submit" disabled={submitting}>
            {submitting ? copy.sending : copy.submit}
            <i aria-hidden="true">→</i>
          </button>
          {/*
            Concerns handling this enquiry, and says only that. It is deliberately
            not a grant of anything else: permission to show finished work
            publicly is a separate matter for a client agreement, and quietly
            folding it into a privacy acknowledgement on an enquiry form would be
            taking it without asking.
          */}
          <p className={styles.consent}>
            {isEnglish ? (
              <>
                By submitting this enquiry, you acknowledge our{" "}
                <Link to="/privacy" data-sonic>Privacy Policy</Link>.
              </>
            ) : (
              <>
                Dengan mengirim pertanyaan ini, Anda menyetujui{" "}
                <Link to="/privacy" data-sonic>Kebijakan Privasi</Link> kami.
              </>
            )}
          </p>
        </div>
      </form>
    </FormProvider>
  );
}
