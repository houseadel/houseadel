import { lazy, Suspense } from "react";
import { PageIntro } from "../components/layout/PageIntro";
import styles from "./ApplyPage.module.css";

const ApplicationForm = lazy(() =>
  import("../features/application/components/ApplicationForm").then((module) => ({
    default: module.ApplicationForm,
  })),
);

export function ApplyPage() {
  return (
    <>
      <PageIntro
        eyebrow="Apply for a project"
        title="Begin with what matters."
        lede="Share the practical outline and the few details that make the occasion unmistakably yours."
      >
        <div className={styles.introNotes}>
          <p>Five concise sections</p>
          <p>No file uploads</p>
          <p>Review before sending</p>
        </div>
      </PageIntro>
      <section className={`${styles.application} page-frame`} aria-label="Project application">
        <Suspense
          fallback={
            <p className={styles.formLoading} role="status">
              Preparing the application
            </p>
          }
        >
          <ApplicationForm />
        </Suspense>
      </section>
    </>
  );
}
