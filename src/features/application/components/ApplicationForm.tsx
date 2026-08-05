import { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useLanguage } from "../../../context/LanguageContext";
import { navigate } from "../../../lib/router";
import { getApplicationSteps } from "../applicationProgress";
import {
  APPLICATION_DEFAULTS,
  applicationResolver,
  normalizeApplicationInput,
  type ApplicationValues,
} from "../applicationSchema";
import {
  clearApplicationDraft,
  loadApplicationDraft,
  saveApplicationDraft,
} from "../applicationStorage";
import {
  getApplicationMode,
  getApplicationModeLabel,
  submitApplication,
} from "../submitApplication";
import { BriefCard } from "./BriefCard";
import { CelebrationFields } from "./CelebrationFields";
import { ContactFields } from "./ContactFields";
import { NeedsFields } from "./NeedsFields";
import { ProgressRail } from "./ProgressRail";
import { ReviewSummary } from "./ReviewSummary";
import { ScopeFields } from "./ScopeFields";
import { StoryFields } from "./StoryFields";
import styles from "./ApplicationForm.module.css";

type View = "edit" | "review";
type StatusTone = "neutral" | "error";

function createRestoredDefaults(): ApplicationValues {
  const draft = loadApplicationDraft();
  return {
    ...APPLICATION_DEFAULTS,
    ...draft,
    needs: draft.needs ?? APPLICATION_DEFAULTS.needs,
  };
}

export function ApplicationForm() {
  const { language } = useLanguage();
  const id = language === "id";
  const copy = id
    ? {
        initial: "Belum ada yang dikirim. Peninjauan diperlukan sebelum pengiriman.",
        invalid: "Beberapa jawaban wajib perlu diperiksa. Belum ada yang dikirim.",
        reviewStatus: "Mode tinjau. Periksa setiap jawaban sebelum mengirim; belum ada yang dikirim.",
        editing: "Penyuntingan dilanjutkan. Belum ada yang dikirim.",
        provider: "Penyedia pengiriman",
        mockNotice: "Mode pengembangan aktif. Tanda terima hanya ditampilkan jika endpoint lokal menerima pengajuan secara eksplisit.",
        providerNotice: "Pengajuan dicatat hanya setelah endpoint yang dikonfigurasi mengonfirmasi penerimaan.",
        reviewDoesNotSend: "Meninjau tidak mengirim pengajuan.",
        reviewButton: "Tinjau pengajuan",
        finalCheck: "Pemeriksaan akhir",
        reviewTitle: "Tinjau brief yang hidup.",
        finalNotice: "Tidak ada yang dikirim sampai tombol akhir di bawah digunakan.",
        return: "Kembali menyunting",
        send: "Kirim pengajuan",
        sending: "Mengirim pengajuan…",
      }
    : {
        initial: "Nothing has been sent. Review is required before submission.",
        invalid: "Some required answers need attention. Nothing has been sent.",
        reviewStatus: "Review mode. Check each answer before sending; nothing has been sent yet.",
        editing: "Editing resumed. Nothing has been sent.",
        provider: "Submission provider",
        mockNotice: "Development mode is active. A mock receipt is shown only if the local endpoint explicitly accepts the application.",
        providerNotice: "The application is recorded only after the configured endpoint confirms acceptance.",
        reviewDoesNotSend: "Reviewing does not send the application.",
        reviewButton: "Review application",
        finalCheck: "Final check",
        reviewTitle: "Review the living brief.",
        finalNotice: "Nothing is sent until you use the final button below.",
        return: "Return to editing",
        send: "Send application",
        sending: "Sending application…",
      };
  const defaults = useMemo(createRestoredDefaults, []);
  const methods = useForm<ApplicationValues>({
    defaultValues: defaults,
    mode: "onBlur",
    reValidateMode: "onChange",
    resolver: applicationResolver,
    shouldFocusError: true,
  });
  const watchedValues = useWatch({ control: methods.control });
  const values = {
    ...APPLICATION_DEFAULTS,
    ...watchedValues,
    needs: watchedValues.needs ?? [],
  } as ApplicationValues;
  const steps = getApplicationSteps(values);
  const mode = getApplicationMode();
  const [view, setView] = useState<View>("edit");
  const [status, setStatus] = useState(copy.initial);
  const [statusTone, setStatusTone] = useState<StatusTone>("neutral");
  const [submitting, setSubmitting] = useState(false);
  const reviewHeadingRef = useRef<HTMLHeadingElement>(null);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    const subscription = methods.watch((nextValues) => {
      saveApplicationDraft({
        ...APPLICATION_DEFAULTS,
        ...nextValues,
        needs: nextValues.needs ?? [],
      } as ApplicationValues);
    });
    return () => subscription.unsubscribe();
  }, [methods]);

  useEffect(
    () => () => {
      activeRequest.current?.abort();
    },
    [],
  );

  useEffect(() => {
    if (view === "review") reviewHeadingRef.current?.focus({ preventScroll: true });
  }, [view]);

  const handleInvalid = () => {
    setStatusTone("error");
    setStatus(copy.invalid);
  };

  const showReview = (validated: ApplicationValues) => {
    const normalized = normalizeApplicationInput(validated);
    methods.reset(normalized);
    setView("review");
    setStatusTone("neutral");
    setStatus(copy.reviewStatus);
  };

  const editSection = (sectionId: string) => {
    setView("edit");
    setStatusTone("neutral");
    setStatus(copy.editing);
    window.requestAnimationFrame(() => {
      const section = document.getElementById(sectionId);
      section?.scrollIntoView({ block: "start" });
      section?.querySelector<HTMLElement>("input, select, textarea, button")?.focus({ preventScroll: true });
    });
  };

  const send = async (validated: ApplicationValues) => {
    activeRequest.current?.abort();
    const request = new AbortController();
    activeRequest.current = request;
    setSubmitting(true);
    setStatusTone("neutral");
    setStatus(
      mode === "mock"
        ? id
          ? "Mengirim ke endpoint mock lokal. Tanda terima tetap memerlukan konfirmasi server yang eksplisit."
          : "Sending to the local mock endpoint. Receipt still requires an explicit server confirmation."
        : id
          ? `Mengirim melalui ${getApplicationModeLabel(mode)}.`
          : `Sending through ${getApplicationModeLabel(mode)}.`,
    );

    try {
      const result = await submitApplication(normalizeApplicationInput(validated), request.signal);
      clearApplicationDraft();
      navigate(`/application-received?confirmed=1&mode=${encodeURIComponent(result.mode)}`);
    } catch (error) {
      setStatusTone("error");
      setStatus(
        error instanceof Error
          ? error.message
          : id
            ? "Pengajuan tidak diterima. Tidak ada yang dikirim."
            : "The application was not accepted. Nothing was sent.",
      );
    } finally {
      if (activeRequest.current === request) activeRequest.current = null;
      setSubmitting(false);
    }
  };

  const submitHandler = methods.handleSubmit(view === "review" ? send : showReview, handleInvalid);

  return (
    <FormProvider {...methods}>
      <div className={styles.workspace}>
        <ProgressRail steps={steps} />

        <form className={styles.form} onSubmit={submitHandler} noValidate>
          <div
            className={styles.submissionNotice}
            data-mode={mode}
            aria-label={id ? "Mode pengiriman pengajuan" : "Application submission mode"}
          >
            <span>{copy.provider}</span>
            <strong>{getApplicationModeLabel(mode)}</strong>
            <p>
              {mode === "mock" ? copy.mockNotice : copy.providerNotice}
            </p>
          </div>

          <div
            className={styles.status}
            data-tone={statusTone}
            role={statusTone === "error" ? "alert" : "status"}
            aria-live="polite"
          >
            {status}
          </div>

          {view === "edit" ? (
            <>
              <CelebrationFields />
              <NeedsFields />
              <StoryFields />
              <ScopeFields />
              <ContactFields />
              <div className={styles.formActions}>
                <p>{copy.reviewDoesNotSend}</p>
                <button className={styles.primaryButton} type="submit">
                  {copy.reviewButton}
                </button>
              </div>
            </>
          ) : (
            <section className={styles.review} aria-labelledby="application-review-title">
              <header className={styles.reviewHeader}>
                <p>{copy.finalCheck}</p>
                <h2 id="application-review-title" ref={reviewHeadingRef} tabIndex={-1}>
                  {copy.reviewTitle}
                </h2>
                <p>{copy.finalNotice}</p>
              </header>
              <ReviewSummary values={values} onEdit={editSection} />
              <div className={styles.formActions}>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={() => editSection("your-celebration")}
                  disabled={submitting}
                >
                  {copy.return}
                </button>
                <button className={styles.primaryButton} type="submit" disabled={submitting}>
                  {submitting ? copy.sending : copy.send}
                </button>
              </div>
            </section>
          )}
        </form>

        <BriefCard values={values} />
      </div>
    </FormProvider>
  );
}
