import { PageIntro } from "../components/layout/PageIntro";
import { stories } from "../data/stories";
import { StoryArchive } from "../features/stories/StoryArchive";
import styles from "./StoriesPage.module.css";

export function StoriesPage() {
  return (
    <div className={styles.page}>
      <PageIntro
        eyebrow="Stories"
        title="The thinking inside the work."
        lede={
          <>
            Four studies tracing how an invitation takes form—from source material and reading
            order to the final guest encounter.
          </>
        }
      >
        <p className={styles.disclosure}>
          Every entry is labelled House Adel Study — Self-initiated. No client, commissioned
          wedding or measured result is represented.
        </p>
      </PageIntro>

      <div className={`${styles.archiveFrame} page-frame`}>
        <StoryArchive stories={stories} />
      </div>
    </div>
  );
}
