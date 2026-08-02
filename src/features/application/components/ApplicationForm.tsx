import { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
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
  const [status, setStatus] = useState("Nothing has been sent. Review is required before submission.");
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
    setStatus("Some required answers need attention. Nothing has been sent.");
  };

  const showReview = (validated: ApplicationValues) => {
    const normalized = normalizeApplicationInput(validated);
    methods.reset(normalized);
    setView("review");
    setStatusTone("neutral");
    setStatus("Review mode. Check each answer before sending; nothing has been sent yet.");
  };

  const editSection = (sectionId: string) => {
    setView("edit");
    setStatusTone("neutral");
    setStatus("Editing resumed. Nothing has been sent.");
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
        ? "Sending to the local mock endpoint. Receipt still requires an explicit server confirmation."
        : `Sending through ${getApplicationModeLabel(mode)}.`,
    );

    try {
      const result = await submitApplication(normalizeApplicationInput(validated), request.signal);
      clearApplicationDraft();
      navigate(`/application-received?confirmed=1&mode=${encodeURIComponent(result.mode)}`);
    } catch (error) {
      setStatusTone("error");
      setStatus(error instanceof Error ? error.message : "The application was not accepted. Nothing was sent.");
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
            aria-label="Application submission mode"
          >
            <span>Submission provider</span>
            <strong>{getApplicationModeLabel(mode)}</strong>
            <p>
              {mode === "mock"
                ? "Development mode is active. A mock receipt is shown only if the local endpoint explicitly accepts the application."
                : "The application is recorded only after the configured endpoint confirms acceptance."}
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
                <p>Reviewing does not send the application.</p>
                <button className={styles.primaryButton} type="submit">
                  Review application
                </button>
              </div>
            </>
          ) : (
            <section className={styles.review} aria-labelledby="application-review-title">
              <header className={styles.reviewHeader}>
                <p>Final check</p>
                <h2 id="application-review-title" ref={reviewHeadingRef} tabIndex={-1}>
                  Review the living brief.
                </h2>
                <p>Nothing is sent until you use the final button below.</p>
              </header>
              <ReviewSummary values={values} onEdit={editSection} />
              <div className={styles.formActions}>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={() => editSection("your-celebration")}
                  disabled={submitting}
                >
                  Return to editing
                </button>
                <button className={styles.primaryButton} type="submit" disabled={submitting}>
                  {submitting ? "Sending application…" : "Send application"}
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

