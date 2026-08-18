import type { PointCloud } from "../gallery/pointCloud";

/**
 * The shape of a sculpture, as the width it occupies at each height.
 *
 * Everything that needs to know "is this point on the sculpture" used to answer
 * with one hardcoded ellipse — the hover test and the liquid lens's shelter both
 * asked `(x/0.583)² + (y/0.883)² < 1`. An ellipse is a poor stand-in for a
 * standing figure: it claims the empty air beside the ankles and between the
 * arms, and gives away the space above the shoulders, so the hand met a reduced
 * effect well before it reached anything and kept meeting it well after.
 *
 * This measures the real form instead. The models turn on their vertical axis,
 * so a silhouette taken from one angle would be wrong at every other one. What
 * is taken here is the *union over all rotations*: at each height, the greatest
 * distance any point reaches from the axis it spins about. That is exact for any
 * yaw by construction — nothing can ever swing outside it, and nothing well
 * inside it is ever claimed — which is what makes it safe to compute once and
 * reuse for the life of the cloud.
 */

/**
 * Bands up the model's height.
 *
 * Enough to separate a head from shoulders and shoulders from a waist; few
 * enough that four of them fit comfortably in the shader's uniform budget and
 * the whole profile is a rounding error to compute.
 */
export const SILHOUETTE_BANDS = 24;

/**
 * Half-widths per band, from the bottom of the model to the top, normalised so
 * the widest band is exactly 1 — which is the same space the framing constants
 * are already expressed in.
 */
export function silhouetteProfile(cloud: PointCloud): Float32Array {
  const bands = new Float32Array(SILHOUETTE_BANDS);
  const { positions, count, extent } = cloud;

  /*
   * Which axis the model stands on, and which two it turns in.
   *
   * The bake writes Z up, but that is a convention a future asset could arrive
   * without, and a profile taken along the wrong axis would be silently useless
   * rather than obviously broken. The tallest axis is the one to slice along.
   */
  const vertical = extent.z >= extent.x && extent.z >= extent.y ? 2 : extent.y >= extent.x ? 1 : 0;
  const radialA = vertical === 0 ? 1 : 0;
  const radialB = vertical === 2 ? 1 : 2;

  let low = Infinity;
  let high = -Infinity;
  for (let index = 0; index < count; index += 1) {
    const value = positions[index * 3 + vertical];
    if (value < low) low = value;
    if (value > high) high = value;
  }
  const span = high - low || 1;

  for (let index = 0; index < count; index += 1) {
    const base = index * 3;
    const height = (positions[base + vertical] - low) / span;
    const band = Math.min(SILHOUETTE_BANDS - 1, Math.max(0, Math.floor(height * SILHOUETTE_BANDS)));
    const a = positions[base + radialA];
    const b = positions[base + radialB];
    const radius = Math.sqrt(a * a + b * b);
    if (radius > bands[band]) bands[band] = radius;
  }

  /*
   * A band with nothing in it would cut a notch through the form — a gap in the
   * hand's reach where the sampling happened to be thin rather than where the
   * sculpture actually is. Empty bands inherit their neighbours.
   */
  for (let band = 1; band < SILHOUETTE_BANDS; band += 1) {
    if (bands[band] === 0) bands[band] = bands[band - 1];
  }
  for (let band = SILHOUETTE_BANDS - 2; band >= 0; band -= 1) {
    if (bands[band] === 0) bands[band] = bands[band + 1];
  }

  let widest = 0;
  for (const value of bands) if (value > widest) widest = value;
  if (widest > 0) for (let band = 0; band < SILHOUETTE_BANDS; band += 1) bands[band] /= widest;

  return bands;
}

/**
 * The half-width at a height, with the bands smoothed between.
 *
 * `height` is 0 at the foot of the model and 1 at the top. Outside that range
 * there is no sculpture, so there is no width.
 */
export function silhouetteWidthAt(profile: Float32Array, height: number): number {
  if (height < 0 || height > 1) return 0;
  const position = height * (SILHOUETTE_BANDS - 1);
  const index = Math.min(SILHOUETTE_BANDS - 2, Math.max(0, Math.floor(position)));
  const blend = position - index;
  return profile[index] * (1 - blend) + profile[index + 1] * blend;
}

/**
 * How far into the sculpture a point lies, 0 outside and 1 well within.
 *
 * `dx` and `dy` are offsets from the model's centre in units of its half
 * extents, y up. Used by the stage's own hover test, which is what decides
 * whether the particles answer the hand — a question about the form itself, and
 * the reason this outline is measured rather than assumed.
 */
export function coverageAt(dx: number, dy: number, profile: Float32Array | null) {
  const height = dy * 0.5 + 0.5;
  if (height < 0 || height > 1) return 0;
  const width = profile ? silhouetteWidthAt(profile, height) : 1;
  if (width <= 0) return 0;
  const across = Math.abs(dx) / width;
  const t = Math.min(Math.max((1 - across) / 0.22, 0), 1);
  const sides = t * t * (3 - 2 * t);
  const ends = Math.min(Math.max((1 - Math.abs(dy)) / 0.12, 0), 1);
  return sides * (ends * ends * (3 - 2 * ends));
}
