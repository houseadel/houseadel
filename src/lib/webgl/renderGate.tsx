import type { EventManager, RootState } from "@react-three/fiber";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

/**
 * How a House Adel scene stops drawing, and how it starts again.
 *
 * Every stage on this site is allowed to go quiet — scrolled past, tab in the
 * background, motion reduced. What none of them may do is *cease to exist* while
 * they are quiet, and that distinction is the whole of this file.
 *
 * The stages used to gate the `<Canvas>` element itself on a visibility flag.
 * When the flag went false React unmounted the canvas, which destroyed the
 * renderer, released the WebGL context, discarded the compiled shaders and freed
 * a hundred and fifty thousand points of vertex buffer. Coming back rebuilt all
 * of it. Measured over ten Home → Work → Contact → Home cycles that came to
 * thirty-seven contexts created and thirty-four destroyed, for three that were
 * ever live at once — and every one of those rebuilds is a stretch of frames
 * where the sculpture is genuinely not there yet. That is the blink.
 *
 * So visibility now decides the *frameloop* and nothing else:
 *
 * - `"always"` while the scene should animate;
 * - `"demand"` while it should hold still.
 *
 * Never `"never"`. It reads like the strongest form of "stop", and it is
 * actually a trap: r3f's `invalidate()` returns early when the loop is `never`,
 * so a scene parked that way cannot be woken by anything at all. The forest was
 * parked that way whenever it was not the active chapter.
 *
 * `demand` is the honest pause. The loop idles at zero cost and one call to
 * `invalidate()` paints one frame, which is exactly what a paused scene needs
 * when the reason for pausing goes away.
 */

/**
 * Paints one frame whenever the reason a scene was holding still changes.
 *
 * This is what makes a pointer unnecessary. Coming back to a tab, scrolling a
 * stage into view, or finishing a route transition all flip `active`, and the
 * frame that flip schedules is the one that puts the scene back on screen. The
 * effect deliberately runs on mount too, so a stage that arrives already paused
 * still draws itself once rather than presenting an empty canvas.
 *
 * A scene under `prefers-reduced-motion` lives permanently on this path: it is
 * always in `demand`, and these are the only frames it ever draws.
 */
export function RenderGate({ active }: { active: boolean }) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    invalidate();
  }, [active, invalidate]);

  /*
   * A resize changes the drawing buffer, and a paused scene that does not repaint
   * after one is a stretched or blank canvas until something else happens to wake
   * it. r3f resizes the buffer itself; this only asks for the frame that fills it.
   */
  useEffect(() => {
    const repaint = () => invalidate();
    window.addEventListener("resize", repaint, { passive: true });
    window.addEventListener("orientationchange", repaint, { passive: true });
    return () => {
      window.removeEventListener("resize", repaint);
      window.removeEventListener("orientationchange", repaint);
    };
  }, [invalidate]);

  return null;
}

/**
 * The frameloop a stage should be running, from the two facts that decide it.
 *
 * Kept here rather than written out at each `<Canvas>` so that "paused means
 * demand, never never" is stated once and cannot drift between stages.
 */
export function frameloopFor(active: boolean, reduced: boolean): "always" | "demand" {
  return active && !reduced ? "always" : "demand";
}

/**
 * An event manager that does nothing, for canvases that need nothing.
 *
 * Every WebGL scene on this site is decorative — each one is `aria-hidden`, none
 * of them has an `onPointerOver` or an `onClick`, and the pointer they respond
 * to arrives through the shared signal in `lib/pointerSignal` rather than
 * through a raycast. r3f does not know that, so by default it attaches its full
 * DOM event layer to each canvas's container: roughly a dozen pointer, wheel and
 * touch listeners per canvas, each of which raycasts the scene when it fires.
 * Four canvases were paying that for a feature not one of them uses.
 *
 * It also removes a crash. r3f connects those listeners from inside an *async*
 * `configure()`, and connects them to `divRef.current` — the container it
 * rendered — read at the moment that promise settles rather than when it was
 * scheduled. A canvas that unmounts in between leaves that ref null, and r3f
 * calls `null.addEventListener`. Rapid Back/Forward does exactly that: a route
 * mounts its scenes and the next navigation discards them before r3f has
 * finished setting them up, and the console fills with
 * "Cannot read properties of null (reading 'addEventListener')".
 *
 * Handing r3f a manager with no handlers means there is nothing to attach and
 * nothing to attach it to, so the race has no target to lose.
 */
export const inertEvents = (): EventManager<HTMLElement> => ({
  enabled: false,
  priority: 0,
  // Left unset rather than false: the type says this is the element the manager
  // is attached to, and this manager is attached to nothing.
  connected: undefined,
  handlers: undefined,
  compute: () => undefined,
  update: () => undefined,
  connect: () => undefined,
  disconnect: () => undefined,
});

/** r3f asks for a factory, and hands it the store it does not need. */
export const noPointerEvents = (_store?: unknown): EventManager<HTMLElement> => inertEvents();

export type { RootState };
