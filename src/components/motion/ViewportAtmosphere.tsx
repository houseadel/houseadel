import { forcedColorsActive } from "../../lib/preferences";
import styles from "./ViewportAtmosphere.module.css";

/**
 * Air in the viewport.
 *
 * The site was reading as objects placed on literal black — the ground was flat,
 * so nothing in front of it had anywhere to be. This gives the frame a very
 * slight tonal structure: the middle stays as dark as it was, the corners fall a
 * little further, and the extreme edges lift a trace toward cool grey so the
 * frame has air at its boundary instead of falling off a cliff.
 *
 * It is deliberately close to invisible. The measure of it is that the page
 * should look the same until the two are put side by side, at which point the
 * old one looks like a rectangle and this one looks like a space.
 *
 * Static, and pure CSS. There is no render loop here: a layer this faint that
 * moved would be a layer that could be noticed, and holding the compositor awake
 * for something nobody can see is the wrong trade twice over.
 */
export function ViewportAtmosphere() {
  if (forcedColorsActive()) return null;

  return (
    <div className={styles.atmosphere} aria-hidden="true" data-viewport-atmosphere>
      <span className={styles.vignette} />
      <span className={styles.haze} />
      <span className={styles.grain} />
    </div>
  );
}
