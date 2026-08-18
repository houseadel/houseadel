/**
 * The field the dissolve is cut from, and the one place its shape is decided.
 *
 * A navigation needs the same boundary in two completely different renderers:
 * the document, which has to clip the incoming page along it, and the shader,
 * which has to draw the material breaking apart around it. If those two derived
 * the boundary independently they would disagree — GLSL `sin`-based hashing is
 * not bit-identical across drivers, and a rim drawn a few centimetres away from
 * the cut it is supposed to belong to is worse than no rim at all.
 *
 * So the field is generated exactly once, here, on a coarse grid. The document
 * reads it through marching squares and gets a *vector* contour. The shader
 * reads the same grid as a texture and gets a smooth interpolation of it. One
 * source, two consumers, no drift.
 *
 * The grid is coarse on purpose. It carries the large and medium structure —
 * the part that decides where the page comes apart — and the fine breakup at the
 * very edge is added by the shader, where per-pixel detail is free. Putting that
 * detail in the grid instead would mean a contour with tens of thousands of
 * segments for something the eye reads as grain.
 */

/** Normalised field values, with the geometry needed to read them. */
export type DissolveField = {
  columns: number;
  rows: number;
  /**
   * `(columns + 1) * (rows + 1)` samples in row-major order, rescaled so the
   * field's own minimum is 0 and its maximum is 1. That rescaling is what lets
   * progress map straight onto a threshold without knowing anything about the
   * noise: at 0 nothing has gone, at 1 everything has, whatever the field did.
   */
  samples: Float32Array;
};

/**
 * How far past the field's range the threshold travels at each end.
 *
 * Without it, progress 0 leaves the single lowest sample already cut and
 * progress 1 leaves the single highest sample still standing — one stray speck
 * at each end of every navigation.
 */
const THRESHOLD_PAD = 0.02;

/** The threshold this progress corresponds to, in the field's normalised range. */
export function thresholdFor(progress: number): number {
  return -THRESHOLD_PAD + progress * (1 + 2 * THRESHOLD_PAD);
}

/*
 * Integer hash. No `sin`, no lookup table, no shared mutable state.
 *
 * `Math.imul` keeps every step in 32-bit integer arithmetic, so this is
 * deterministic for a given seed and cheap enough to call a quarter of a million
 * times inside one animation frame.
 */
function hash(x: number, y: number, seed: number): number {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(seed, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

const smooth = (t: number) => t * t * (3 - 2 * t);

/** Value noise: bilinear between four hashed lattice corners, smoothly faded. */
function valueNoise(x: number, y: number, seed: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = smooth(x - ix);
  const fy = smooth(y - iy);
  const a = hash(ix, iy, seed);
  const b = hash(ix + 1, iy, seed);
  const c = hash(ix, iy + 1, seed);
  const d = hash(ix + 1, iy + 1, seed);
  return (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy;
}

/** Fractal sum. Each octave doubles the frequency and halves the contribution. */
function fbm(x: number, y: number, octaves: number, seed: number): number {
  let sum = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let total = 0;
  for (let octave = 0; octave < octaves; octave += 1) {
    sum += valueNoise(x * frequency, y * frequency, seed + octave * 1013) * amplitude;
    total += amplitude;
    amplitude *= 0.5;
    // Not exactly two, so octaves never line their lattices up and the sum never
    // shows the grid it was built from.
    frequency *= 2.03;
  }
  return sum / total;
}

/**
 * How much of the field is the broad travelling gradient and how much is noise.
 *
 * This ratio is the whole character of the transition and the thing worth
 * tuning. All gradient is a straight wipe with a soft edge. All noise is
 * television static, dissolving everywhere at once with no sense of travel. The
 * boundary wanted here has an unmistakable direction and a thoroughly irregular
 * edge, which is a little more noise than gradient.
 */
const DIRECTIONAL_WEIGHT = 0.62;
const NOISE_WEIGHT = 0.86;

/**
 * Builds the field for one navigation.
 *
 * `direction` is the broad way the breakup travels, in the document's own
 * coordinates: x to the right, y downward. It does not need to be normalised.
 * `seed` varies the noise so that navigating repeatedly does not replay one
 * memorised shape.
 */
export function buildDissolveField(options: {
  columns: number;
  rows: number;
  aspect: number;
  direction: { x: number; y: number };
  seed: number;
}): DissolveField {
  const { columns, rows, aspect, direction, seed } = options;
  const length = Math.hypot(direction.x, direction.y) || 1;
  const dx = direction.x / length;
  const dy = direction.y / length;

  const samples = new Float32Array((columns + 1) * (rows + 1));
  let minimum = Infinity;
  let maximum = -Infinity;

  for (let row = 0; row <= rows; row += 1) {
    const v = row / rows;
    for (let column = 0; column <= columns; column += 1) {
      const u = column / columns;

      /*
       * The broad field, projected onto the travel direction and rescaled so a
       * corner-to-corner direction still spans the full 0..1. Without that
       * rescaling a diagonal transition would spend its first and last moments
       * doing nothing.
       */
      const directional = ((u - 0.5) * dx + (v - 0.5) * dy) / (Math.abs(dx) + Math.abs(dy)) + 0.5;

      /*
       * Two scales of noise here, and deliberately not a third.
       *
       * Large decides which regions go first; medium breaks those regions into
       * irregular masses. The fine breakup that grains the very edge is the
       * shader's job, not the grid's — it is a per-pixel effect, and putting it
       * here instead would buy the same appearance at the cost of a contour with
       * thousands of extra segments, since every wiggle finer than a cell turns
       * into boundary cells that have to be polygonised individually.
       *
       * Sampled against the aspect ratio so the masses stay round rather than
       * stretching with the window.
       */
      const nx = u * aspect;
      const structure = fbm(nx * 2.3, v * 2.3, 4, seed);
      const irregular = fbm(nx * 5.4 + 17.3, v * 5.4 + 5.1, 3, seed + 7919);
      const noise = structure * 0.63 + irregular * 0.37;

      const value = directional * DIRECTIONAL_WEIGHT + (noise - 0.5) * NOISE_WEIGHT;
      samples[row * (columns + 1) + column] = value;
      if (value < minimum) minimum = value;
      if (value > maximum) maximum = value;
    }
  }

  // Rescale into 0..1 so progress and threshold are the same number.
  const span = maximum - minimum || 1;
  for (let index = 0; index < samples.length; index += 1) {
    samples[index] = (samples[index] - minimum) / span;
  }

  return { columns, rows, samples };
}

/**
 * The contour of `field < threshold`, as a CSS `path()` body in pixels.
 *
 * This is the region the *incoming* page occupies: it starts empty, appears as
 * scattered openings, and grows until it is the whole frame. Marching squares
 * over the grid, with each cell contributing the polygon of itself that lies
 * inside the region — corners that qualify, plus points interpolated along the
 * edges where the threshold crosses.
 *
 * Two details matter for cost. Runs of fully-inside cells are merged along each
 * row into single rectangles, so the flat interior of the region costs a handful
 * of points rather than one polygon per cell; only the boundary is polygonised
 * in detail. And every polygon is wound the same way, so nonzero filling unions
 * them without any need to trace or join loops.
 *
 * The result is a vector boundary. It is resolution-independent by construction,
 * which is the answer to the pixelation that this transition is replacing: there
 * is no raster anywhere in the cut, at any device pixel ratio, on any display.
 */
export function contourPath(field: DissolveField, threshold: number, width: number, height: number) {
  const { columns, rows, samples } = field;
  const stride = columns + 1;
  const scaleX = width / columns;
  const scaleY = height / rows;
  const parts: string[] = [];

  const point = (x: number, y: number) => `${(x * scaleX).toFixed(1)} ${(y * scaleY).toFixed(1)}`;

  for (let row = 0; row < rows; row += 1) {
    let runStart = -1;
    const flushRun = (end: number) => {
      if (runStart < 0) return;
      parts.push(
        `M${point(runStart, row)}L${point(end, row)}L${point(end, row + 1)}L${point(runStart, row + 1)}Z`,
      );
      runStart = -1;
    };

    for (let column = 0; column < columns; column += 1) {
      const topLeft = samples[row * stride + column];
      const topRight = samples[row * stride + column + 1];
      const bottomRight = samples[(row + 1) * stride + column + 1];
      const bottomLeft = samples[(row + 1) * stride + column];

      const insideTopLeft = topLeft < threshold;
      const insideTopRight = topRight < threshold;
      const insideBottomRight = bottomRight < threshold;
      const insideBottomLeft = bottomLeft < threshold;

      if (insideTopLeft && insideTopRight && insideBottomRight && insideBottomLeft) {
        if (runStart < 0) runStart = column;
        continue;
      }
      flushRun(column);
      if (!insideTopLeft && !insideTopRight && !insideBottomRight && !insideBottomLeft) continue;

      // Where along an edge the threshold falls, between two samples.
      const cross = (from: number, to: number, at: number, span: number) =>
        at + span * ((threshold - from) / (to - from || 1e-6));

      const points: string[] = [];
      if (insideTopLeft) points.push(point(column, row));
      if (insideTopLeft !== insideTopRight) {
        points.push(point(cross(topLeft, topRight, column, 1), row));
      }
      if (insideTopRight) points.push(point(column + 1, row));
      if (insideTopRight !== insideBottomRight) {
        points.push(point(column + 1, cross(topRight, bottomRight, row, 1)));
      }
      if (insideBottomRight) points.push(point(column + 1, row + 1));
      if (insideBottomRight !== insideBottomLeft) {
        points.push(point(cross(bottomLeft, bottomRight, column, 1), row + 1));
      }
      if (insideBottomLeft) points.push(point(column, row + 1));
      if (insideBottomLeft !== insideTopLeft) {
        points.push(point(column, cross(topLeft, bottomLeft, row, 1)));
      }
      if (points.length < 3) continue;
      parts.push(`M${points.join("L")}Z`);
    }
    flushRun(columns);
  }

  return parts.join("");
}

/**
 * The grid the field is sampled on.
 *
 * Fine enough that the boundary reads as an organic edge rather than a chain of
 * facets, coarse enough that the path stays a few thousand characters and the
 * contour costs well under a millisecond to rebuild each frame. A phone gets
 * fewer cells: its screen is smaller, so the same cell count would be visibly
 * finer than it needs to be, and its budget is tighter.
 */
export function fieldResolution(compact: boolean, aspect: number) {
  const columns = compact ? 72 : 108;
  return { columns, rows: Math.max(24, Math.round(columns / Math.max(aspect, 0.35))) };
}
