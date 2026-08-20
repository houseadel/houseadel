/**
 * The transition's clock, and the only thing that decides when a route commits.
 *
 * Deliberately separate from anything that draws. It advances a single progress
 * value, it calls the commit, and it finishes. The shader and the clip path
 * *read* this — they are never asked, and they are never waited for.
 *
 * That separation is the whole reliability story. If WebGL is unavailable, if
 * the context is lost mid-navigation, if the driver refuses the shader, if a
 * route chunk is slow — the clock does not know and does not care, the commit
 * happens on time, and the visitor reaches the page they asked for. A transition
 * that can strand someone on the wrong URL is not a transition, it is a bug with
 * an animation attached.
 *
 * Progress is driven by a GSAP timeline, which is what the rest of the site
 * animates with. GSAP's ticker is one shared `requestAnimationFrame` loop, so
 * this movement is scheduled alongside every other timeline on the page rather
 * than competing with them from a loop of its own.
 */

import { motionIsReduced } from "../../lib/preferences";

type GsapRuntime = (typeof import("../../lib/motion"))["gsap"];

/**
 * Forward, or back through history.
 *
 * There used to be a third mode that carried the pressed project's own image
 * into the transition as a texture. It existed to clothe a displaced relief
 * surface, and that surface is gone: this dissolve is entirely procedural and
 * has no material to wear. Direction is now the only thing a navigation varies.
 */
export type TransitionMode = "forward" | "back";

export type TransitionState = {
  /** 0 while idle. 0→1 across the whole movement while running. */
  progress: number;
  running: boolean;
  mode: TransitionMode;
  /** Where the movement is centred, in normalised device coordinates. */
  originX: number;
  originY: number;
  /** Which way the breakup travels, in document coordinates: x right, y down. */
  directionX: number;
  directionY: number;
  /** Varies the field per navigation so no two dissolves are the same shape. */
  seed: number;
  /** True once the route has been committed and the incoming page exists. */
  committed: boolean;
};

const state: TransitionState = {
  progress: 0,
  running: false,
  mode: "forward",
  originX: 0,
  originY: 0,
  directionX: 1,
  directionY: 0,
  seed: 1,
  committed: false,
};

export function transitionState(): Readonly<TransitionState> {
  return state;
}

const listeners = new Set<() => void>();

/** Told on every frame of a running transition, and once when it stops. */
export function onTransitionFrame(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function announce() {
  listeners.forEach((callback) => callback());
}

function compact() {
  return window.matchMedia("(max-width: 47.99rem)").matches;
}

/**
 * The shape of the movement.
 *
 * A little over a second on a desktop, appreciably shorter on a phone. Quick
 * enough to sit through on every click; long enough for a boundary to travel
 * across a screen and be read as travelling rather than as a cut.
 *
 * Reduced motion keeps a short crossfade and nothing else — no travelling
 * boundary, no spectral edge, no camera feel.
 */
export function timings() {
  if (motionIsReduced()) return { total: 320 };
  return compact() ? { total: 880 } : { total: 1120 };
}

/*
 * GSAP is loaded lazily by the rest of the site, so it is asked for early rather
 * than at the moment of a click. If a visitor manages to navigate before it
 * lands, that one navigation runs on a plain frame loop with the same easing and
 * the same duration, and looks identical.
 */
let runtime: GsapRuntime | null = null;

export function primeTransitionRuntime() {
  if (runtime) return;
  void import("../../lib/motion")
    .then((module) => {
      runtime = module.gsap;
    })
    .catch(() => undefined);
}

/** Slow in, quick through the middle, settling out. */
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

let safety = 0;
/** Abandons the transition in flight, without letting its commit fire. */
let abandon: (() => void) | null = null;

/**
 * Drops a running transition on the floor.
 *
 * A second navigation can arrive while the first is still in the air — rapid
 * clicking, or a link pressed during the movement. Cancelling clears the pending
 * work and resets the visual state so the new movement starts from a clean page.
 */
export function cancelTransition() {
  abandon?.();
}

export function transitionIsRunning() {
  return state.running;
}

/**
 * Runs one transition.
 *
 * `commit` publishes the new route. It is called exactly once, immediately, so
 * the incoming page is mounted and can be revealed *through* the boundary rather
 * than appearing after it. A belt-and-braces timer tears the movement down even
 * if no animation frames arrive at all, which is what a backgrounded tab does.
 */
export function runTransition(options: {
  commit: () => void;
  mode: TransitionMode;
  origin?: { x: number; y: number } | null;
  direction: { x: number; y: number };
  /**
   * Told how the movement ended. `false` means it was abandoned part-way — a
   * second navigation arrived — and anything that would settle the reader into
   * the destination must not run, because that destination is no longer where
   * they are going.
   */
  onFinish?: (completed: boolean) => void;
}) {
  const { total } = timings();
  const origin = options.origin ?? null;

  state.running = true;
  state.committed = false;
  state.progress = 0;
  state.mode = options.mode;
  state.seed = (Math.random() * 0x7fffffff) | 0;
  state.directionX = options.direction.x;
  state.directionY = options.direction.y;

  // Normalised device coordinates, y up.
  state.originX = origin ? (origin.x / window.innerWidth) * 2 - 1 : 0;
  state.originY = origin ? -((origin.y / window.innerHeight) * 2 - 1) : 0;

  let cancelled = false;
  let settled = false;
  let timeline: ReturnType<GsapRuntime["timeline"]> | null = null;
  let frame = 0;

  /*
   * The commit happens first, not in the middle.
   *
   * The incoming route has to be in the document from the beginning, because the
   * boundary reveals it: at any moment part of the frame is the outgoing page
   * and part of it is the incoming one. Committing halfway would mean the first
   * half of the movement had nothing to reveal.
   */
  state.committed = true;
  try {
    options.commit();
  } catch {
    // A failed commit must not strand the animation; the teardown below still
    // runs and the router is left where it was.
  }

  const teardown = () => {
    if (settled) return;
    settled = true;
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    window.clearTimeout(safety);
    timeline?.kill();
    timeline = null;
    if (abandon === stop) abandon = null;
    state.running = false;
    state.progress = 0;
    announce();
    options.onFinish?.(!cancelled);
  };

  function stop() {
    cancelled = true;
    teardown();
  }
  abandon = stop;

  const advance = (value: number) => {
    if (cancelled) return;
    state.progress = value;
    announce();
  };

  // Fires whatever happens: starved frame loop, hidden tab, dead GPU.
  window.clearTimeout(safety);
  safety = window.setTimeout(teardown, total + 500);

  if (runtime) {
    const driver = { value: 0 };
    timeline = runtime.timeline({
      onUpdate: () => advance(driver.value),
      onComplete: teardown,
    });
    timeline.to(driver, {
      value: 1,
      duration: total / 1000,
      // The same shape as the site's other long moves: unhurried at both ends,
      // decisive through the middle, where the boundary is crossing the frame.
      ease: "power2.inOut",
    });
  } else {
    const start = performance.now();
    const step = () => {
      const t = Math.min((performance.now() - start) / total, 1);
      advance(easeInOutCubic(t));
      if (t < 1) {
        frame = window.requestAnimationFrame(step);
        return;
      }
      teardown();
    };
    frame = window.requestAnimationFrame(step);
  }

  return teardown;
}
