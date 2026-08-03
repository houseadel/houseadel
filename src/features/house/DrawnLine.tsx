import { useEffect, useRef } from "react";
import { deferMotion } from "../../lib/deferredMotion";
import styles from "./DrawnLine.module.css";

export function DrawnLine() {
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const line = lineRef.current;
    const path = line?.querySelector<SVGPathElement>("[data-house-path]");
    const page = line?.parentElement;
    if (!line || !path || !page) return;

    return deferMotion((gsap) => {
      const media = gsap.matchMedia();
      const context = gsap.context(() => {
        media.add("(prefers-reduced-motion: reduce)", () => {
          gsap.set(path, { strokeDashoffset: 0 });
        });

        media.add(
          {
            desktop: "(min-width: 48rem)",
            mobile: "(max-width: 47.99rem)",
            motion: "(prefers-reduced-motion: no-preference)",
          },
          ({ conditions }) => {
            const { desktop, mobile, motion } = conditions ?? {};
            if (!motion) return;

            gsap.set(path, { strokeDashoffset: 1 });
            gsap.to(path, {
              strokeDashoffset: 0,
              ease: "none",
              scrollTrigger: {
                trigger: page,
                start: "top top",
                end: mobile ? "bottom 72%" : "bottom 66%",
                scrub: desktop ? 0.55 : 0.2,
                invalidateOnRefresh: true,
              },
            });
          },
        );
      }, line);

      return () => {
        media.revert();
        context.revert();
      };
    });
  }, []);

  return (
    <div ref={lineRef} className={styles.line} aria-hidden="true">
      <svg viewBox="0 0 1600 3600" preserveAspectRatio="none" role="presentation">
        <path
          data-house-path
          pathLength="1"
          d="M122 70H792v328H389v410h904v406H716v-176H251v734h1128v461H1002v-184H516v707h803v368H813v420H203"
        />
      </svg>
    </div>
  );
}
