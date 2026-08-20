import { useEffect, type RefObject } from "react";

/**
 * Anything that should arrive rather than be found already there.
 *
 * One observer per document tree, and one convention: a section marks itself
 * `data-arrives`, is given `data-shown` as it reaches the middle of the screen,
 * and styles itself from that. Nothing here knows what any of those sections are.
 *
 * It began as the work index's own effect, keyed to `data-project` and scoped to
 * that one chapter. Two more places wanted the same behaviour — the studies page
 * and the doorway to it — and each would have meant another observer with another
 * copy of the same rootMargin, which is three places to change one decision about
 * how things appear.
 *
 * The band is deliberately tall: the entry is shown when it holds the screen, not
 * when its first pixel appears.
 */
export function useArrivals(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const arriving = Array.from(element.querySelectorAll<HTMLElement>("[data-arrives]"));
    if (!arriving.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          (entry.target as HTMLElement).dataset.shown = entry.isIntersecting ? "true" : "false";
        }
      },
      { rootMargin: "-25% 0px -25% 0px" },
    );
    arriving.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [root]);
}
