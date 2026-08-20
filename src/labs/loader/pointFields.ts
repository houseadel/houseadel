/**
 * Shapes, as clouds of two-dimensional points.
 *
 * The opening is one set of particles that has to be several things in sequence:
 * the House Adel mark filling up, and then — depending on how the opening is set
 * to end — the sculpture that stands on the landing page, or the headline that
 * sits over it. Each of those is a different source (an SVG file, a baked 3D
 * cloud, a line of type), and none of them is a list of points to begin with.
 *
 * They are all reduced to the same thing here: an alpha mask, sampled. That is
 * what lets the particle field treat "the mark", "the figure" and "the headline"
 * as interchangeable targets rather than three animation code paths, and it is
 * why the sculpture arrives through the same door as the logo despite being the
 * projection of a hundred and fifty thousand points in three dimensions.
 *
 * Every field comes back in one normalised space: centred on the origin, longest
 * axis spanning exactly 1, y increasing downward as a canvas measures it. The
 * caller scales that into pixels, so nothing here needs to know the viewport.
 */
import type { PointCloud } from "../../features/gallery/pointCloud";

export type PointField = {
  /** xy pairs, centred on the origin, longest axis spanning 1. */
  points: Float32Array;
  count: number;
  /** Width over height of the sampled shape, so a caller can fit it to a frame. */
  aspect: number;
};

const EMPTY: PointField = { points: new Float32Array(0), count: 0, aspect: 1 };

/**
 * The resolution shapes are rasterised at before being sampled.
 *
 * Large enough that the mark's thin inner counters survive — below about 160 the
 * stroke that separates the two halves of the glyph closes up and the logo
 * samples as a solid blob — and small enough that reading the whole buffer back
 * is a single cheap operation during a load the visitor is already waiting on.
 */
const RASTER = 256;

/**
 * Turn an alpha mask into a normalised field.
 *
 * Sampling is uniform over the *covered pixels* rather than over the bounding
 * box, so a glyph that is mostly empty space still gets its particle budget spent
 * on the parts of it that are actually drawn.
 */
function fieldFromMask(
  alpha: Uint8ClampedArray,
  width: number,
  height: number,
  wanted: number,
): PointField {
  const covered: number[] = [];
  for (let i = 0; i < width * height; i += 1) {
    if (alpha[i * 4 + 3] > 128) covered.push(i);
  }
  if (covered.length === 0 || wanted <= 0) return EMPTY;

  const points = new Float32Array(wanted * 2);
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < wanted; i += 1) {
    const pixel = covered[(Math.random() * covered.length) | 0];
    // Jittered within the pixel it was drawn from. Without this a field with
    // fewer covered pixels than particles stacks duplicates on exact integer
    // coordinates, and the shape draws as a sparse grid rather than a form.
    const x = (pixel % width) + Math.random();
    const y = Math.floor(pixel / width) + Math.random();
    points[i * 2] = x;
    points[i * 2 + 1] = y;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  const spanX = Math.max(maxX - minX, 0.0001);
  const spanY = Math.max(maxY - minY, 0.0001);
  const scale = 1 / Math.max(spanX, spanY);
  const centreX = (minX + maxX) / 2;
  const centreY = (minY + maxY) / 2;
  for (let i = 0; i < wanted; i += 1) {
    points[i * 2] = (points[i * 2] - centreX) * scale;
    points[i * 2 + 1] = (points[i * 2 + 1] - centreY) * scale;
  }

  return { points, count: wanted, aspect: spanX / spanY };
}

function maskContext(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas.getContext("2d", { willReadFrequently: true });
}

/**
 * The mark, sampled from the SVG the site already ships.
 *
 * Read from the file rather than re-drawn as a path here, so the opening cannot
 * drift out of step with the logo used everywhere else: replacing
 * `public/adel-mark.svg` replaces this too.
 */
export async function fieldFromSvg(url: string, wanted: number): Promise<PointField> {
  const image = new Image();
  image.src = url;
  try {
    await image.decode();
  } catch {
    return EMPTY;
  }

  const context = maskContext(RASTER, RASTER);
  if (!context) return EMPTY;
  // Fitted rather than stretched: the mark is nearly square but not exactly, and
  // a stretched logo is a wrong logo.
  const ratio = image.naturalWidth / Math.max(image.naturalHeight, 1);
  const drawWidth = ratio >= 1 ? RASTER : RASTER * ratio;
  const drawHeight = ratio >= 1 ? RASTER / ratio : RASTER;
  context.drawImage(image, (RASTER - drawWidth) / 2, (RASTER - drawHeight) / 2, drawWidth, drawHeight);
  return fieldFromMask(context.getImageData(0, 0, RASTER, RASTER).data, RASTER, RASTER, wanted);
}

/**
 * Type, sampled from the font the page will actually set it in.
 *
 * The font is read off a live element rather than named here. The headline is set
 * in a token the design system owns, and a second copy of that value in a
 * TypeScript file is a copy that goes stale the first time the token changes.
 *
 * It wraps, because the headline does. Sampling the sentence as one long line and
 * scaling it to the width of a two-line heading produces a band of particles at a
 * third of the type's real size, which lands nowhere near the words that replace
 * it — the whole effect depends on the cloud and the type occupying the same
 * shape at the moment one becomes the other.
 */
export function fieldFromText(
  text: string,
  font: string,
  maxWidth: number,
  wanted: number,
): PointField {
  const measure = maskContext(8, 8);
  if (!measure) return EMPTY;
  measure.font = font;

  const lines: string[] = [];
  let current = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && measure.measureText(candidate).width > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  if (lines.length === 0) return EMPTY;

  const size = Number.parseFloat(font) || 48;
  const leading = size * 1.1;
  const width = Math.ceil(Math.max(...lines.map((line) => measure.measureText(line).width)));
  // Generous vertical room: descenders and the odd accent fall outside the em
  // box, and a mask that clips them samples a headline with its tails cut off.
  const height = Math.ceil(leading * lines.length + size * 0.6);
  if (width <= 0 || height <= 0) return EMPTY;

  const context = maskContext(width, height);
  if (!context) return EMPTY;
  context.font = font;
  context.textBaseline = "middle";
  context.fillStyle = "#fff";
  lines.forEach((line, index) => {
    context.fillText(line, 0, size * 0.3 + leading * (index + 0.5));
  });
  return fieldFromMask(context.getImageData(0, 0, width, height).data, width, height, wanted);
}

/**
 * The landing page's own sculpture, flattened to the silhouette it presents.
 *
 * The cloud is Z-up, as everything baked by `scripts/bake-point-cloud.mjs` is, so
 * standing it up for a screen is the same swap `reliefFromCloud` makes: x stays
 * across, z becomes the vertical, and the depth axis is simply dropped. Dropping
 * it is the point — this is the shape the figure *reads* as from the front, which
 * is what the particles have to arrive at for the handover to land.
 */
export function fieldFromCloud(cloud: PointCloud, wanted: number): PointField {
  if (cloud.count === 0 || wanted <= 0) return EMPTY;
  const points = new Float32Array(wanted * 2);
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < wanted; i += 1) {
    const source = (Math.random() * cloud.count) | 0;
    const x = cloud.positions[source * 3];
    // Negated: the cloud measures up, a canvas measures down.
    const y = -cloud.positions[source * 3 + 2];
    points[i * 2] = x;
    points[i * 2 + 1] = y;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  const spanX = Math.max(maxX - minX, 0.0001);
  const spanY = Math.max(maxY - minY, 0.0001);
  const scale = 1 / Math.max(spanX, spanY);
  const centreX = (minX + maxX) / 2;
  const centreY = (minY + maxY) / 2;
  for (let i = 0; i < wanted; i += 1) {
    points[i * 2] = (points[i * 2] - centreX) * scale;
    points[i * 2 + 1] = (points[i * 2 + 1] - centreY) * scale;
  }

  return { points, count: wanted, aspect: spanX / spanY };
}
