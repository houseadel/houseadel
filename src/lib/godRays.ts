/**
 * One description of the light, read by both the CSS shafts and the relief's
 * shader.
 *
 * The overlay alone could never look three-dimensional: it is a layer in front of
 * the particles, so it washes over them evenly no matter how bright it is. The
 * light has to also exist inside the scene, brightening the particles it actually
 * passes through and leaving the ones beside it dark. That means two renderers
 * agreeing on where the beam is and how strong it is right now, so both read from
 * here and both clock off `performance.now()` rather than off separate timelines.
 */

/** Beam origin in normalised device coordinates: just past the top right corner. */
export const RAY_ORIGIN: readonly [number, number] = [1.06, 1.14];

/** Direction of travel, down and to the left. */
export const RAY_DIRECTION: readonly [number, number] = [-0.55, -1];

/** Seconds for one full fade in and out. */
export const RAY_PERIOD = 11;

/**
 * Intensity at a moment, 0 to 1.
 *
 * Held near full for a stretch in the middle rather than peaking instantly, so
 * the light arrives, stays long enough to be looked at, and leaves.
 */
export function rayIntensity(nowMs: number): number {
  const phase = ((nowMs / 1000) % RAY_PERIOD) / RAY_PERIOD;
  // Two smoothsteps: up over the first third, down over the last third.
  const up = smoothstep(0.04, 0.36, phase);
  const down = 1 - smoothstep(0.62, 0.96, phase);
  return Math.min(up, down);
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}
