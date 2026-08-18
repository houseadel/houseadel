import { useEffect, useRef } from "react";
import { motionIsReduced } from "../lib/preferences";

type SplitRevealOptions = {
  type?: "lines" | "words";
  stagger?: number;
  start?: string;
};

export function useSplitReveal<T extends HTMLElement>(options: SplitRevealOptions = {}) {
  const ref = useRef<T>(null);
  const type = options.type ?? "lines";
  const stagger = options.stagger ?? 0.05;
  const start = options.start ?? "top 85%";

  useEffect(() => {
    const el = ref.current;
    if (!el || motionIsReduced()) return;

    let disposed = false;
    let context: { revert: () => void } | undefined;
    let split: { revert: () => void } | undefined;

    void import("../lib/motion").then(({ gsap, SplitText }) => {
      if (disposed || !el) return;
      context = gsap.context(() => {
        const instance = new SplitText(el, { type, mask: type });
        split = instance;
        const targets = type === "words" ? instance.words : instance.lines;
        const revealTargets = targets.length ? targets : [el];
        gsap.set(revealTargets, { yPercent: 110, autoAlpha: 0 });
        gsap.to(revealTargets, {
          yPercent: 0,
          autoAlpha: 1,
          duration: 0.62,
          ease: "power2.out",
          stagger,
          scrollTrigger: {
            trigger: el,
            start,
            once: true,
          },
        });
      }, el);
    });

    return () => {
      disposed = true;
      context?.revert();
      split?.revert();
    };
  }, [type, stagger, start]);

  return ref;
}
