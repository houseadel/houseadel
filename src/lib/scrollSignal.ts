/**
 * How fast the page is moving, published once.
 *
 * Several layers want to lean on scroll velocity — the atmosphere drifts, media
 * lags a little behind its frame, the forest settles after the reader stops.
 * Each of them measuring it separately means several scroll listeners racing to
 * read `scrollY` and disagreeing about what frame they are on, so it is measured
 * in one place and read from everywhere.
 *
 * Two numbers, because they are used for different things. `velocity` is raw
 * pixels per second and is what you want for a threshold. `lag` is a smoothed,
 * signed, normalised version — roughly -1..1, saturating rather than clipping —
 * and is what you want to drive a transform, because it keeps moving for a
 * moment after the input stops, which is the whole quality being reached for.
 *
 * Typography and UI should read `lag` scaled down, or not at all; the 3D and
 * atmospheric layers are the ones meant to trail. That difference is what makes
 * the page feel like it has depth rather than like everything is loose.
 */

export type ScrollSignal = {
  /** Pixels per second, signed. Positive is downward. */
  velocity: number;
  /** Smoothed and saturated, about -1..1. Trails the input on purpose. */
  lag: number;
  /** Absolute scroll position the signal was last measured at. */
  position: number;
  /** 1 while moving, easing to 0 once the page has come to rest. */
  moving: number;
};

const signal: ScrollSignal = { velocity: 0, lag: 0, position: 0, moving: 0 };

export function scrollSignal(): Readonly<ScrollSignal> {
  return signal;
}

/** Velocity at which `lag` reaches most of its range. Chosen by feel, not physics. */
const SATURATION = 2200;

let frame = 0;
let last = 0;
let lastPosition = 0;
let started = false;

function tick(now: number) {
  const step = Math.min(Math.max((now - last) / 1000, 1 / 240), 0.05);
  last = now;

  const position = window.scrollY;
  const raw = (position - lastPosition) / step;
  lastPosition = position;
  signal.position = position;

  // The instantaneous figure is noisy — a single dropped frame doubles it — so
  // it is smoothed before anyone sees it.
  signal.velocity += (raw - signal.velocity) * (1 - Math.pow(0.001, step));

  // `tanh`-ish saturation: responsive in the range real scrolling occupies, and
  // incapable of producing an absurd transform during a flick or a jump.
  const normalised = signal.velocity / SATURATION;
  const saturated = normalised / (1 + Math.abs(normalised));
  // Deliberately slower than the velocity it follows. This is the trailing
  // quality; making it faster makes the whole effect vanish.
  signal.lag += (saturated - signal.lag) * (1 - Math.pow(0.02, step));

  const busy = Math.abs(signal.velocity) > 8 || Math.abs(signal.lag) > 0.002;
  signal.moving += ((busy ? 1 : 0) - signal.moving) * (1 - Math.pow(0.01, step));

  if (!busy && signal.moving < 0.01) {
    signal.velocity = 0;
    signal.lag = 0;
    signal.moving = 0;
    frame = 0;
    return;
  }

  frame = window.requestAnimationFrame(tick);
}

function wake() {
  if (frame) return;
  last = performance.now();
  lastPosition = window.scrollY;
  frame = window.requestAnimationFrame(tick);
}

/**
 * Starts measuring. Driven by the native scroll event, so it is correct whether
 * the page is being moved by the desktop scroll authority, by a finger, by the
 * keyboard, or by `scrollIntoView`.
 */
export function startScrollSignal() {
  if (started || typeof window === "undefined") return () => undefined;
  started = true;
  lastPosition = window.scrollY;
  signal.position = lastPosition;

  const onScroll = () => wake();
  window.addEventListener("scroll", onScroll, { passive: true });

  return () => {
    window.removeEventListener("scroll", onScroll);
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    signal.velocity = 0;
    signal.lag = 0;
    signal.moving = 0;
    started = false;
  };
}
