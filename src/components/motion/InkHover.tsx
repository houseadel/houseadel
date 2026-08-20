import { useEffect, useRef, type ReactNode } from "react";
import { forcedColorsActive, motionIsReduced } from "../../lib/preferences";
import styles from "./InkHover.module.css";

/**
 * Hover resolves the word out of ink, letter by letter.
 *
 * This replaces the spectral particle glow the navigation used to carry. That
 * effect needed a canvas behind every item and read as decoration bolted on
 * beside the type; this borrows the gesture the whole site is built on instead —
 * the same blur the statements resolve out of, run quickly and in sequence — so
 * the navigation answers in the site's own language.
 *
 * Nothing moves. Only blur and brightness change, and the stagger is what carries
 * direction.
 */
export function InkHover({ children, className }: { children: ReactNode; className?: string }) {
  const hostRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    /*
     * Built for touch too.
     *
     * This used to bail out on any device without a fine pointer, which meant a
     * phone never even constructed the letters — so there was nothing for a
     * finger to resolve even once touch was being tracked. The gate is now only
     * about whether the effect is *wanted*: reduced motion and forced colours
     * turn it off, a coarse pointer does not.
     */
    if (motionIsReduced() || forcedColorsActive()) return;

    const text = host.textContent ?? "";
    if (!text.trim()) return;

    // Rebuilt as characters only once the effect runs, so the accessible name
    // stays the plain string React rendered until then.
    const label = document.createElement("span");
    label.className = "sr-only";
    label.textContent = text;
    const visual = document.createElement("span");
    visual.setAttribute("aria-hidden", "true");
    for (const [index, character] of Array.from(text).entries()) {
      const span = document.createElement("span");
      span.className = styles.char;
      span.textContent = character === " " ? "\u00a0" : character;
      span.style.setProperty("--index", String(index));
      visual.append(span);
    }
    host.replaceChildren(label, visual);

    return () => {
      host.replaceChildren(text);
    };
  }, [children]);

  return (
    <span ref={hostRef} className={[styles.host, className].filter(Boolean).join(" ")}>
      {children}
    </span>
  );
}
