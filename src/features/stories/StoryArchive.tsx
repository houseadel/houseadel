import { useState } from "react";
import type { Story } from "../../data/stories";
import { Link } from "../../lib/router";
import { StoryPlate } from "./StoryPlate";
import styles from "./StoryArchive.module.css";

export function StoryArchive({ stories }: { stories: readonly Story[] }) {
  const [activeSlug, setActiveSlug] = useState(stories[0]?.slug ?? "");
  const activeStory = stories.find((story) => story.slug === activeSlug) ?? stories[0];

  return (
    <section className={styles.archive} aria-labelledby="story-index-heading">
      <div className={styles.index}>
        <h2 id="story-index-heading" className={styles.heading}>
          Story index
        </h2>
        <ol className={styles.list}>
          {stories.map((story, index) => (
            <li key={story.slug}>
              <article>
                <Link
                  to={`/stories/${story.slug}`}
                  className={styles.row}
                  onMouseEnter={() => setActiveSlug(story.slug)}
                  onFocus={() => setActiveSlug(story.slug)}
                >
                  <span className={styles.indexNumber}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.rowTitle}>{story.title}</span>
                  <span className={styles.meta}>
                    {story.category} · {story.year}
                  </span>
                  <span className={styles.open}>Read story</span>
                </Link>
                <div className={styles.mobilePlate}>
                  <StoryPlate story={story} />
                </div>
                <p className={styles.dek}>{story.dek}</p>
                <p className={styles.studyLabel}>{story.studyLabel}</p>
              </article>
            </li>
          ))}
        </ol>
      </div>

      {activeStory ? (
        <aside className={styles.stage} aria-label={`Visual plate for ${activeStory.title}`}>
          <StoryPlate story={activeStory} />
          <p className={styles.stageTitle}>{activeStory.title}</p>
          <p>{activeStory.studyLabel}</p>
        </aside>
      ) : null}
    </section>
  );
}
