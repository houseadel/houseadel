import { useEffect, useRef } from "react";
import { motionIsReduced } from "../../lib/preferences";
import { rayIntensity } from "../../lib/godRays";
import styles from "./GodRays.module.css";

/**
 * The visible shafts of light entering from the top right corner.
 *
 * This is only half of the effect. The other half is in the relief's shader,
 * which brightens the particles the beam actually passes through — without it the
 * light is a sheet in front of the scene rather than something moving through it.
 * Both halves read their intensity from `lib/godRays` against the same wall clock,
 * so the shafts and the lit particles rise and fall together. A CSS animation
 * could not be relied on for that: it runs on its own timeline, and the two would
 * drift apart within a minute.
 *
 * Deliberately not `postprocessing`'s `GodRaysEffect`. That pass blurs an occluded
 * render of a bright source mesh, and this scene is a point cloud with no solid
 * geometry to occlude anything, so the rays would sample through the gaps between
 * particles and read as flicker. It would also add an `EffectComposer` and two
 * render targets to the page with the tightest frame budget on the site.
 */
export function GodRays({ submergeRef }: { submergeRef?: { current: number } }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (motionIsReduced()) {
      host.style.setProperty("--ray", "0.72");
      return;
    }

    let frame = 0;
    const tick = () => {
      const submerged = submergeRef?.current ?? 0;
      // Sunlight does not follow you under. The shafts go with the surface.
      const value = rayIntensity(performance.now()) * (1 - submerged);
      host.style.setProperty("--ray", value.toFixed(3));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [submergeRef]);

  return (
    <div ref={hostRef} className={styles.rays} aria-hidden="true">
      <span className={styles.source} />
      <span className={styles.shaft} />
      <span className={styles.shaft} />
      <span className={styles.shaft} />
      <span className={styles.shaft} />
    </div>
  );
}
