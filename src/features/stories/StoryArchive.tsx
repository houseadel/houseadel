import { useEffect, useRef, useState } from "react";
import type { Story } from "../../data/stories";
import { deferMotion } from "../../lib/deferredMotion";
import { Link } from "../../lib/router";
import { StoryPlate } from "./StoryPlate";
import styles from "./StoryArchive.module.css";

export function StoryArchive({ stories }: { stories: readonly Story[] }) {
  const [activeSlug, setActiveSlug] = useState(stories[0]?.slug ?? "");
  const activeStory = stories.find((story) => story.slug === activeSlug) ?? stories[0];
  const stageRef = useRef<HTMLElement>(null);
  const previousSlug = useRef(activeSlug);

  useEffect(() => {
    const stage = stageRef.current;
    const changed = previousSlug.current !== activeSlug;
    previousSlug.current = activeSlug;
    if (!stage || !changed) return;

    return deferMotion((gsap) => {
      const media = gsap.matchMedia();
      const context = gsap.context(() => {
        media.add(
          {
            desktop: "(min-width: 64.01rem)",
            motion: "(prefers-reduced-motion: no-preference)",
          },
          ({ conditions }) => {
            const { desktop, motion } = conditions ?? {};
            const plane = stage.querySelector<HTMLElement>("[data-story-stage-plane]");
            const drawing = stage.querySelector<SVGElement>("svg");
            if (!plane || !desktop || !motion) {
              if (plane) gsap.set(plane, { clearProps: "all" });
              if (drawing) gsap.set(drawing, { clearProps: "all" });
              return;
            }

            const timeline = gsap.timeline({ defaults: { overwrite: "auto" } });
            timeline.fromTo(
              plane,
              { autoAlpha: 0.56, y: 10, scale: 0.985, rotateX: -1.4 },
              { autoAlpha: 1, y: 0, scale: 1, rotateX: 0, duration: 0.52, ease: "power2.out" },
            );
            if (drawing) {
              timeline.fromTo(
                drawing,
                { xPercent: -1.2, scale: 1.018 },
                { xPercent: 0, scale: 1, duration: 0.7, ease: "power2.out" },
                0,
              );
            }
          },
        );
      }, stage);

      return () => {
        media.revert();
        context.revert();
      };
    });
  }, [activeSlug]);

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
        <aside ref={stageRef} className={styles.stage} aria-label={`Visual plate for ${activeStory.title}`}>
          <div className={styles.stagePlane} data-story-stage-plane>
            <StoryPlate story={activeStory} />
            <p className={styles.stageTitle}>{activeStory.title}</p>
            <p>{activeStory.studyLabel}</p>
          </div>
        </aside>
      ) : null}
    </section>
  );
}
