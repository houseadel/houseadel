import { useEffect, useRef } from "react";
import { motionIsReduced } from "../lib/preferences";

export function useParallax<T extends HTMLElement>(depth = 0.2) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || motionIsReduced()) return;

    let disposed = false;
    let context: { revert: () => void } | undefined;

    void import("../lib/motion").then(({ gsap }) => {
      if (disposed || !el) return;
      context = gsap.context(() => {
        gsap.matchMedia().add({ desktop: "(min-width: 48rem)" }, (mediaContext) => {
          const isDesktop = Boolean((mediaContext.conditions as { desktop?: boolean }).desktop);
          const distance = (isDesktop ? depth : depth * 0.35) * 100;
          gsap.fromTo(
            el,
            { yPercent: -distance },
            {
              yPercent: distance,
              ease: "none",
              scrollTrigger: {
                trigger: el,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.4,
              },
            },
          );
        });
      }, el);
    });

    return () => {
      disposed = true;
      context?.revert();
    };
  }, [depth]);

  return ref;
}
