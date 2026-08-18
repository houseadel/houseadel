/**
 * One pointer, whatever is doing the pointing.
 *
 * The site's interactive layers — the wireframe backdrop, the forest ripple, the
 * relief, the lens — were each written against `pointermove` and each gated on
 * `pointer: fine`. On a phone that gate is false, so a finger drove none of them
 * and mobile lost the whole interaction system rather than a mouse-shaped part
 * of it.
 *
 * This is that input, published once. A mouse feeds it, and so does a finger,
 * and the layers downstream cannot tell which. The finger is not asked to choose
 * between scrolling and interacting: every touch listener here is passive and
 * nothing calls `preventDefault`, so the browser's own scrolling happens exactly
 * as it would on a page that had never heard of this file, and the position of
 * the finger is read on the way past.
 *
 * Presence is the part that makes a finger usable as a pointer at all. A mouse
 * is always somewhere; a finger exists only while it is down. So the signal
 * carries how *present* the pointer is, and lifting a finger fades that to zero
 * over about half a second rather than teleporting the reaction away — which is
 * what "dissipate gracefully" has to mean when the input itself is discontinuous.
 */

export type PointerSignal = {
  /** Normalised device coordinates: -1..1, y up. What shaders want. */
  x: number;
  y: number;
  /** Viewport pixels. What `elementFromPoint` and DOM effects want. */
  clientX: number;
  clientY: number;
  /** 0 when nothing is pointing, 1 when something is. Touch fades; mouse snaps. */
  presence: number;
  /** Which kind of input last moved it. */
  source: "none" | "mouse" | "touch";
};

const signal: PointerSignal = {
  x: 4,
  y: 4,
  clientX: -1,
  clientY: -1,
  presence: 0,
  source: "none",
};

/**
 * Read-only view of the live signal. The same object every time, mutated in
 * place: this is read from render loops sixty times a second, and allocating a
 * fresh one per frame is the kind of garbage that shows up as jitter.
 */
export function pointerSignal(): Readonly<PointerSignal> {
  return signal;
}

/** Off-screen sentinel. Shaders treat anything outside -1..1 as "no pointer". */
const AWAY = 4;

const target = { x: AWAY, y: AWAY, clientX: -1, clientY: -1 };
let presenceTarget = 0;
/** Set while a finger is down, so lifting it can start the fade. */
let touching = false;

let frame = 0;
let last = 0;
let started = false;

const subscribers = new Set<() => void>();

/**
 * Told when the pointer moves. Used by anything that needs a frame scheduled on
 * demand — the mobile canvases run `frameloop="demand"` and would otherwise
 * never draw the reaction they just received.
 */
export function onPointerActivity(callback: () => void) {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

function wake() {
  if (!frame) {
    last = performance.now();
    frame = window.requestAnimationFrame(tick);
  }
}

function tick(now: number) {
  const step = Math.min((now - last) / 1000, 0.05);
  last = now;

  // Touch gets a little inertia so a fast swipe does not make the reaction
  // strobe across the frame; a mouse is already continuous and is followed
  // almost exactly. Both are framerate-independent, so a 120Hz display and a
  // 60Hz one settle over the same wall-clock time.
  const follow = signal.source === "touch" ? 1 - Math.pow(0.0004, step) : 1 - Math.pow(1e-7, step);

  if (target.x !== AWAY) {
    signal.x += (target.x - signal.x) * follow;
    signal.y += (target.y - signal.y) * follow;
    signal.clientX += (target.clientX - signal.clientX) * follow;
    signal.clientY += (target.clientY - signal.clientY) * follow;
  }

  // Presence rises fast and falls slowly. The rise is a response; the fall is
  // the thing settling after the hand has gone.
  const presenceRate = presenceTarget > signal.presence ? 1 - Math.pow(1e-6, step) : 1 - Math.pow(0.02, step);
  signal.presence += (presenceTarget - signal.presence) * presenceRate;

  subscribers.forEach((callback) => callback());

  const settled =
    Math.abs(target.x - signal.x) < 0.001 &&
    Math.abs(target.y - signal.y) < 0.001 &&
    Math.abs(presenceTarget - signal.presence) < 0.002;

  if (settled) {
    signal.presence = presenceTarget;
    // A pointer that has left is parked all the way off-screen, so a shader
    // reading it cannot find a stale hotspot sitting where the hand used to be.
    if (presenceTarget === 0) {
      signal.x = AWAY;
      signal.y = AWAY;
      target.x = AWAY;
      target.y = AWAY;
      subscribers.forEach((callback) => callback());
    }
    frame = 0;
    return;
  }

  frame = window.requestAnimationFrame(tick);
}

function setFrom(clientX: number, clientY: number, source: "mouse" | "touch") {
  const width = window.innerWidth || 1;
  const height = window.innerHeight || 1;
  // First contact after an absence is placed rather than travelled to, so a
  // finger touching down does not drag the reaction across the whole screen
  // from wherever the last one ended.
  const placing = signal.source !== source || signal.presence < 0.01;

  target.x = (clientX / width) * 2 - 1;
  target.y = -((clientY / height) * 2 - 1);
  target.clientX = clientX;
  target.clientY = clientY;
  signal.source = source;
  presenceTarget = 1;

  if (placing) {
    signal.x = target.x;
    signal.y = target.y;
    signal.clientX = clientX;
    signal.clientY = clientY;
  }

  wake();
}

/* ------------------------------------------------------------------ *
 * Touch hover
 *
 * A finger passing over a link should light it the way a mouse would. There is
 * no `:hover` to borrow on a touchscreen, so the element under the finger is
 * found and marked, and the stylesheet answers `[data-touch-hover]` wherever it
 * answers `:hover`.
 *
 * `elementFromPoint` forces layout, so it is rationed twice over: only after the
 * finger has actually moved a meaningful distance, and never more than once per
 * interval. During a flick this reduces to a handful of calls for the whole
 * gesture instead of one per touchmove event.
 * ------------------------------------------------------------------ */

const HOVER_SELECTOR = "a, button, [data-touch-hover-target]";
const HIT_TEST_INTERVAL = 90;
const HIT_TEST_DISTANCE = 14;

let hovered: Element | null = null;
let lastHitAt = 0;
let lastHitX = -999;
let lastHitY = -999;

function clearTouchHover() {
  if (hovered instanceof HTMLElement) delete hovered.dataset.touchHover;
  hovered = null;
}

function hitTest(clientX: number, clientY: number) {
  const now = performance.now();
  const moved = Math.hypot(clientX - lastHitX, clientY - lastHitY);
  if (now - lastHitAt < HIT_TEST_INTERVAL || moved < HIT_TEST_DISTANCE) return;
  lastHitAt = now;
  lastHitX = clientX;
  lastHitY = clientY;

  const found = document.elementFromPoint(clientX, clientY)?.closest(HOVER_SELECTOR) ?? null;
  if (found === hovered) return;
  clearTouchHover();
  if (found instanceof HTMLElement) {
    found.dataset.touchHover = "true";
    hovered = found;
  }
}

/**
 * Starts the shared pointer. Safe to call more than once; only the first call
 * attaches anything.
 */
export function startPointerSignal() {
  if (started || typeof window === "undefined") return () => undefined;
  started = true;

  const onPointerMove = (event: PointerEvent) => {
    // Touch is handled by the touch listeners, which see the whole gesture
    // including its end. A pointer event of type "touch" would double-report it.
    if (event.pointerType !== "mouse") return;
    setFrom(event.clientX, event.clientY, "mouse");
  };

  const onPointerLeave = () => {
    if (signal.source !== "mouse") return;
    presenceTarget = 0;
    wake();
  };

  const readTouch = (event: TouchEvent) => {
    const touch = event.touches[0] ?? event.changedTouches[0];
    if (!touch) return;
    setFrom(touch.clientX, touch.clientY, "touch");
    hitTest(touch.clientX, touch.clientY);
  };

  const onTouchStart = (event: TouchEvent) => {
    touching = true;
    // Forces the first hit test of a new gesture rather than waiting for the
    // finger to travel: a tap that never moves should still light what it is on.
    lastHitX = -999;
    lastHitY = -999;
    lastHitAt = 0;
    readTouch(event);
  };

  const onTouchMove = (event: TouchEvent) => {
    // Deliberately no preventDefault. The page scrolls; this only watches.
    readTouch(event);
  };

  const onTouchEnd = () => {
    touching = false;
    presenceTarget = 0;
    clearTouchHover();
    wake();
  };

  // All passive. On iOS Safari in particular a non-passive touchmove listener on
  // the document is enough to make scrolling feel bound to the main thread, and
  // that is precisely the failure this whole file exists to avoid.
  const passive = { passive: true } as const;
  window.addEventListener("pointermove", onPointerMove, passive);
  window.addEventListener("pointerdown", onPointerMove, passive);
  document.addEventListener("pointerleave", onPointerLeave, passive);
  window.addEventListener("touchstart", onTouchStart, passive);
  window.addEventListener("touchmove", onTouchMove, passive);
  window.addEventListener("touchend", onTouchEnd, passive);
  window.addEventListener("touchcancel", onTouchEnd, passive);

  const onBlur = () => {
    if (!touching) return;
    onTouchEnd();
  };
  window.addEventListener("blur", onBlur);

  return () => {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerdown", onPointerMove);
    document.removeEventListener("pointerleave", onPointerLeave);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", onTouchEnd);
    window.removeEventListener("touchcancel", onTouchEnd);
    window.removeEventListener("blur", onBlur);
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    clearTouchHover();
    started = false;
  };
}
