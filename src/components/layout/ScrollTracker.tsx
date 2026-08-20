import { useEffect, useRef, useState } from "react";
import styles from "./ScrollTracker.module.css";

/**
 * Where the reader is, as an instrument reading.
 *
 * A rail down the right edge with a travelling mark, and a count of which
 * section holds the screen out of how many. On a page built as one continuous
 * scroll there is no other way to know how far in you are or how much is left,
 * which a paginated site gets for free.
 *
 * Sections opt in with `data-track` and give their own label, so the readout
 * names where you are rather than only counting. Adding a section anywhere on the
 * page changes the total without this needing to know about it.
 */
export function ScrollTracker() {
  const railRef = useRef<HTMLDivElement>(null);
  const [total, setTotal] = useState(0);
  const [label, setLabel] = useState("");

  useEffect(() => {
    let frame = 0;
    let sections: HTMLElement[] = [];

    const collect = () => {
      sections = Array.from(document.querySelectorAll<HTMLElement>("[data-track]"));
      setTotal(sections.length);
    };

    const measure = () => {
      frame = 0;
      const rail = railRef.current;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = height > 0 ? Math.min(Math.max(window.scrollY / height, 0), 1) : 0;
      // Written straight to the element: this runs on every scroll frame, and a
      // state update per frame would re-render the tree for a line's length.
      rail?.style.setProperty("--progress", progress.toFixed(4));

      const middle = window.innerHeight * 0.5;
      let active = 0;
      sections.forEach((section, position) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= middle && rect.bottom > 0) active = position;
      });
      setLabel(sections[active]?.dataset.track ?? "");
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    collect();
    measure();

    // Sections arrive with the route, so the list is rebuilt as the tree changes.
    const observer = new MutationObserver(() => {
      collect();
      onScroll();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  if (total < 2) return null;

  return (
    // Presentational: the label duplicates what the headings already say, and a
    // screen reader announcing it on every scroll would be noise.
    //
    // The rail is the whole instrument now. A count sat above it and changed
    // width as the figures changed, which moved the rail with it; the readout is
    // the travelling mark, and it reads better without a number arguing with it.
    <div className={styles.tracker} aria-hidden="true">
      <div className={styles.rail} ref={railRef}>
        <span className={styles.fill} />
        <span className={styles.mark} />
      </div>
      <p className={styles.label}>{label}</p>
    </div>
  );
}
