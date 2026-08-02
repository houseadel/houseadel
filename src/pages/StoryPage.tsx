import { PageIntro } from "../components/layout/PageIntro";
import {
  getStory,
  storySectionLabels,
  storySectionOrder,
  type StoryInteraction,
} from "../data/stories";
import { StoryPlate } from "../features/stories/StoryPlate";
import { Link } from "../lib/router";
import styles from "./StoryPage.module.css";

const interactionLabels: Record<StoryInteraction, string> = {
  "aperture-sequence": "Aperture sequence",
  "letter-fold": "Letter fold",
  "map-path": "Map path draw",
  "light-register": "Light register",
};

const interactionDescriptions: Record<StoryInteraction, string> = {
  "aperture-sequence": "The frame opens to uncover the next part of the invitation.",
  "letter-fold": "A folded leaf uncovers the next passage without losing the reading order.",
  "map-path": "One drawn route gathers separate fragments into a legible sequence.",
  "light-register": "A change of light shifts emphasis while every detail remains readable.",
};

export function StoryPage({ slug }: { slug: string }) {
  const story = getStory(slug);

  if (!story) {
    return (
      <div className={styles.notFound}>
        <PageIntro
          eyebrow="Stories"
          title="This story is not in the archive."
          lede="The requested story may have moved or the address may be incomplete."
        />
        <div className="page-frame">
          <Link className={styles.textLink} to="/stories">
            Return to the Stories archive
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className={styles.page}>
      <nav className={`${styles.breadcrumbs} page-frame`} aria-label="Breadcrumb">
        <Link to="/stories">Stories</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{story.title}</span>
      </nav>

      <PageIntro eyebrow={`${story.category} · ${story.year}`} title={story.title} lede={story.dek}>
        <p className={styles.studyLabel}>{story.studyLabel}</p>
      </PageIntro>

      <div className={`${styles.storyBody} page-frame`}>
        <div className={styles.leadPlate}>
          <StoryPlate story={story} />
        </div>

        <div className={styles.caseStudy}>
          <aside className={styles.contents}>
            <nav aria-label="Story sections">
              <p>Contents</p>
              <ol>
                {storySectionOrder.map((key, index) => (
                  <li key={key}>
                    <a href={`#${key}`}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      {storySectionLabels[key]}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className={styles.interaction}>
              <p>Project gesture</p>
              <strong>{interactionLabels[story.interaction]}</strong>
              <span>{interactionDescriptions[story.interaction]}</span>
            </div>
          </aside>

          <div className={styles.sections}>
            {storySectionOrder.map((key, index) => (
              <section id={key} key={key} aria-labelledby={`${key}-heading`}>
                <p className={styles.sectionNumber}>{String(index + 1).padStart(2, "0")}</p>
                <h2 id={`${key}-heading`}>{storySectionLabels[key]}</h2>
                {story.sections[key].map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {key === "motionAndTechnology" ? (
                  <figure className={styles.interactionPlate}>
                    <div aria-hidden="true" data-interaction={story.interaction}>
                      <span />
                      <span />
                      <span />
                    </div>
                    <figcaption>
                      {interactionLabels[story.interaction]}. {interactionDescriptions[story.interaction]}
                    </figcaption>
                  </figure>
                ) : null}
              </section>
            ))}
          </div>
        </div>

        <footer className={styles.storyFooter}>
          <p>{story.studyLabel}</p>
          <Link className={styles.textLink} to="/stories">
            Return to all Stories
          </Link>
          <Link className={styles.applyLink} to="/apply">
            Apply for a project
          </Link>
        </footer>
      </div>
    </article>
  );
}
