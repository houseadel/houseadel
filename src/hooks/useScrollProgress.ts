import { useEffect, useRef, type RefObject } from "react";

/**
 * How far the reader has travelled through one element, 0 to 1.
 *
 * The one number every scene on the site reads: Home turns the relief with it,
 * Work descends through the forest with it, and Contact carries Cupid down the
 * page with it. It is returned as a ref rather than as state on purpose — the
 * scenes want it per frame, and re-rendering a page sixty times a second to
 * deliver a float is the thing this avoids.
 *
 * The measurement is coalesced onto an animation frame, so a burst of scroll
 * events costs one layout read rather than one each. Elements shorter than the
 * viewport have no travel to report and are left at whatever they last held,
 * which is what keeps a page that briefly measures small from snapping its scene
 * back to zero.
 */
export function useScrollProgress(elementRef: RefObject<HTMLElement | null>) {
  const progress = useRef(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      if (travel > 0) progress.current = Math.min(Math.max(-rect.top / travel, 0), 1);
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [elementRef]);

  return progress;
}
