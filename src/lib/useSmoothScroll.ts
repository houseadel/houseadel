import { useEffect } from "react";
import { motionIsReduced } from "./preferences";
import { startScrollSignal } from "./scrollSignal";

/**
 * The site's one scrolling authority, and only on a desktop pointer.
 *
 * **Touch is never touched.** A finger moves the page through the browser's own
 * physics, with the browser's own rubber-banding, momentum and scroll-anchoring,
 * because a phone is a device where the content is under the hand and any
 * interpolation between the two reads as the page being slow. Nothing here
 * attaches to `touchmove`, so there is no interpolation to disable — the mobile
 * path is native by construction rather than by a flag that could be set wrong.
 *
 * On a mouse the wheel is a different instrument: it delivers discrete notches,
 * and the browser's own answer to a notch is a jump. That jump is what this
 * smooths.
 *
 * **The model.** Target position accumulates wheel delta; the real scroll
 * position chases it with framerate-independent exponential damping. Three
 * numbers decide how it feels, and the previous version of this file had two of
 * them set against the quality being asked for:
 *
 * - *Gain* is how far a notch travels, relative to the browser's own. At 1 the
 *   page covers the ground the reader expects it to.
 *
 * - *Damping* is the shape. `TAU` is the time constant: after `TAU` seconds
 *   roughly a third of the remaining distance is left. At about a sixth of a
 *   second the start of a movement is immediate and the end is long — quick to
 *   answer, slow to stop, which is the difference between smoothing and lag. The
 *   earlier value settled in about fifty milliseconds, which is fast enough that
 *   there is effectively no curve at all and the wheel reads as a jump with the
 *   corners rounded off.
 *
 * - *Reach* is how far ahead of the page the target may get. This is the one
 *   that matters most and the one that was previously wrong: at a couple of
 *   hundred pixels, a flick's excess was thrown away, and throwing it away is
 *   exactly what removes the coast. Deceleration *is* the surplus being spent.
 *   Held instead to something over a screen, a fast scroll keeps travelling
 *   after the hand stops without ever being able to run somewhere absurd.
 *
 * Two details keep it from stuttering. The position is held here as a float and
 * written every frame — easing toward a `window.scrollY` the browser has already
 * rounded to an integer is a per-frame judder. And the scroll is written
 * explicitly `instant`: the document carries `scroll-behavior: smooth`, and
 * without this the browser animates every one of these sixty-a-second writes on
 * top of this curve, which is the delay no amount of tuning here could remove.
 *
 * It moves the real scroll position rather than transforming a wrapper. That is
 * load-bearing: the site is built on `position: sticky`, which resolves against
 * the scroll container, and a transformed wrapper would leave the scroll position
 * untouched and break every sticky scene on the site.
 *
 * Keyboard, scrollbar dragging, touch and `scrollIntoView` all stay native.
 */

/** Distance travelled per unit of wheel, relative to the browser's own. */
const GAIN = 1;

/**
 * Seconds for the remaining distance to fall to about a third.
 *
 * A sixth of a second. Long enough to read as glide, short enough that the page
 * is always visibly answering the hand.
 */
const TAU = 0.16;

/**
 * How far ahead of the page the target may ever be, in screens.
 *
 * Generous, because this is the room the coast lives in. It is a sanity bound
 * against a trackpad flick queueing thousands of pixels, not a brake.
 */
const REACH_SCREENS = 1.25;

/** True when the primary input is a real pointing device with a wheel. */
function wheelPointer() {
  return (
    window.matchMedia("(pointer: fine)").matches &&
    window.matchMedia("(hover: hover)").matches &&
    !window.matchMedia("(pointer: coarse)").matches
  );
}

export function useSmoothScroll(enabled = true) {
  useEffect(() => {
    // The velocity signal runs everywhere, including mobile: the atmospheric
    // layers want to know how fast the page is moving whether or not this file
    // is the thing moving it.
    const stopSignal = startScrollSignal();

    if (!enabled || !wheelPointer() || motionIsReduced()) return stopSignal;

    let current = window.scrollY;
    let target = current;
    let frame = 0;
    let last = 0;

    const limit = () => Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);

    const tick = (now: number) => {
      const step = Math.min((now - last) / 1000, 0.05);
      last = now;

      const distance = target - current;
      if (Math.abs(distance) < 0.2) {
        current = target;
        window.scrollTo({ top: current, behavior: "instant" });
        frame = 0;
        return;
      }

      current += distance * (1 - Math.exp(-step / TAU));
      window.scrollTo({ top: current, behavior: "instant" });
      frame = window.requestAnimationFrame(tick);
    };

    const onWheel = (event: WheelEvent) => {
      // A pinch-zoom or a sideways gesture is not this tool's business.
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      // Anything with its own scrollport — a long field, an overflowing panel —
      // keeps the wheel for itself.
      if ((event.target as Element | null)?.closest?.("[data-native-scroll]")) return;
      // Line and page modes report in lines and pages rather than pixels.
      const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;

      event.preventDefault();
      // Re-anchored whenever the page is at rest, so a scroll by any other means
      // in between never leaves this working from a stale position.
      if (!frame) {
        current = window.scrollY;
        target = current;
      }

      target += event.deltaY * scale * GAIN;
      const reach = window.innerHeight * REACH_SCREENS;
      target = Math.max(Math.min(target, current + reach), current - reach);
      target = Math.max(Math.min(target, limit()), 0);

      if (!frame) {
        last = performance.now();
        // Started on this frame rather than the next: the first movement lands
        // with the notch, which is what makes it feel like a response and not a
        // reaction.
        frame = window.requestAnimationFrame(tick);
      }
    };

    const resync = () => {
      if (!frame) {
        current = window.scrollY;
        target = current;
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scrollend", resync);
    window.addEventListener("resize", resync);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scrollend", resync);
      window.removeEventListener("resize", resync);
      stopSignal();
    };
  }, [enabled]);
}
