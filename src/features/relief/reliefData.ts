import * as THREE from "three";

/**
 * The 3D relief ships as a single greyscale height map, not as a mesh.
 *
 * The source scan is a 143 MB / 3,000,000-triangle STL of a bas-relief: a thin
 * plate, flat at the back, sculpted at the front (Z spans only 5.9% of X). Any
 * geometry that thin is fully described by one height per (x, y), so the scan was
 * baked to a 207 KB PNG. Every render mode below rebuilds what it needs from that
 * one file, which is why the mesh, displacement and particle versions cost the
 * same download rather than three separate payloads.
 */

export const RELIEF_ASPECT = 1.27;

export type ReliefHeightField = {
  width: number;
  height: number;
  /** Normalised 0..1 heights, row-major, origin top-left. */
  data: Float32Array;
};

export async function loadHeightField(source: string): Promise<ReliefHeightField> {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.decoding = "async";
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`Relief height map failed to load: ${source}`));
    image.src = source;
  });

  const width = image.naturalWidth;
  const height = image.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("2D context unavailable for relief sampling.");
  context.drawImage(image, 0, 0);
  const { data: pixels } = context.getImageData(0, 0, width, height);

  const data = new Float32Array(width * height);
  for (let i = 0; i < data.length; i++) data[i] = pixels[i * 4] / 255;
  return { width, height, data };
}

/** Bilinear sample so geometry is not locked to the height map's pixel grid. */
export function sampleHeight(field: ReliefHeightField, u: number, v: number) {
  const x = Math.min(Math.max(u, 0), 1) * (field.width - 1);
  const y = Math.min(Math.max(v, 0), 1) * (field.height - 1);
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.min(x0 + 1, field.width - 1);
  const y1 = Math.min(y0 + 1, field.height - 1);
  const fx = x - x0;
  const fy = y - y0;
  const a = field.data[y0 * field.width + x0];
  const b = field.data[y0 * field.width + x1];
  const c = field.data[y1 * field.width + x0];
  const d = field.data[y1 * field.width + x1];
  return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
}

/**
 * Real geometry, not a displaced plane: vertices are placed at their sculpted
 * height on the CPU and normals are computed from the result, so the mesh has a
 * true silhouette at its edges.
 */
export function buildReliefGeometry(
  field: ReliefHeightField,
  segmentsX: number,
  depth: number,
): THREE.BufferGeometry {
  const segmentsY = Math.max(2, Math.round(segmentsX / RELIEF_ASPECT));
  const geometry = new THREE.PlaneGeometry(RELIEF_ASPECT, 1, segmentsX, segmentsY);
  const position = geometry.attributes.position as THREE.BufferAttribute;
  const uv = geometry.attributes.uv as THREE.BufferAttribute;

  for (let i = 0; i < position.count; i++) {
    // PlaneGeometry's V runs bottom-up; the height map's rows run top-down.
    const h = sampleHeight(field, uv.getX(i), 1 - uv.getY(i));
    position.setZ(i, h * depth);
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

export type ReliefPointCloud = {
  /** Resting positions: each particle sits on the sculpted surface. */
  settled: Float32Array;
  /** Dispersed positions the particles morph out to. */
  scattered: Float32Array;
  /** Per-particle height, used to shade and size the points. */
  heights: Float32Array;
  count: number;
};

/**
 * Particles sampled across the relief surface.
 *
 * Silhouette preservation is the whole point, so sampling is a jittered grid
 * rather than uniform-random: random sampling leaves visible clumps and gaps that
 * read as noise instead of as a sculpted form. Each particle keeps a second,
 * dispersed position so the cloud can morph back onto the surface.
 */
export function buildReliefPoints(
  field: ReliefHeightField,
  targetCount: number,
  depth: number,
): ReliefPointCloud {
  const columns = Math.round(Math.sqrt(targetCount * RELIEF_ASPECT));
  const rows = Math.max(1, Math.round(columns / RELIEF_ASPECT));
  const count = columns * rows;

  const settled = new Float32Array(count * 3);
  const scattered = new Float32Array(count * 3);
  const heights = new Float32Array(count);

  let i = 0;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const u = (x + 0.5 + (Math.random() - 0.5) * 0.85) / columns;
      const v = (y + 0.5 + (Math.random() - 0.5) * 0.85) / rows;
      const h = sampleHeight(field, u, v);
      const px = (u - 0.5) * RELIEF_ASPECT;
      const py = (0.5 - v);

      settled[i * 3] = px;
      settled[i * 3 + 1] = py;
      settled[i * 3 + 2] = h * depth;

      // Dispersal stays deliberately local. Pushing particles far from their
      // resting place destroys the silhouette outright: the relief simply blows
      // away. Held to a small neighbourhood, the same morph reads as the surface
      // loosening and catching light while the sculpture stays legible.
      // Because dispersal is applied by a local brush rather than globally, the
      // scatter can be generous: only the area under the pointer ever reaches it,
      // so the rest of the sculpture stays intact while the brushed patch blooms.
      const lift = 0.22 + Math.random() * 0.55;
      scattered[i * 3] = px + (Math.random() - 0.5) * 0.2;
      scattered[i * 3 + 1] = py + (Math.random() - 0.5) * 0.15;
      scattered[i * 3 + 2] = h * depth + lift * (0.4 + h);

      heights[i] = h;
      i++;
    }
  }

  return { settled, scattered, heights, count };
}

/**
 * The same build, off the main thread where possible.
 *
 * Falls back to building inline if workers are unavailable or the worker fails to
 * start: a slow first second is a far better outcome than no relief at all.
 */
export function buildReliefPointsAsync(
  field: ReliefHeightField,
  targetCount: number,
  depth: number,
): Promise<ReliefPointCloud> {
  if (typeof Worker === "undefined") {
    return Promise.resolve(buildReliefPoints(field, targetCount, depth));
  }

  return new Promise<ReliefPointCloud>((resolve) => {
    let worker: Worker;
    try {
      worker = new Worker(new URL("./reliefPoints.worker.ts", import.meta.url), {
        type: "module",
      });
    } catch {
      resolve(buildReliefPoints(field, targetCount, depth));
      return;
    }

    const settle = (cloud: ReliefPointCloud) => {
      worker.terminate();
      resolve(cloud);
    };

    worker.onmessage = (event: MessageEvent<ReliefPointCloud>) => settle(event.data);
    worker.onerror = () => settle(buildReliefPoints(field, targetCount, depth));
    // The height field is copied rather than transferred: the caller still needs
    // it for the mesh and displacement modes.
    worker.postMessage({ field, targetCount, depth });
  });
}

/**
 * The relief cloud at an exact point count.
 *
 * The grid version returns whatever columns x rows lands nearest the target,
 * which is fine on its own but useless when the same particles have to morph into
 * a second form: the two clouds must agree on how many points there are, to the
 * point, or the correspondence is meaningless.
 */
export function buildReliefPointsFixed(
  field: ReliefHeightField,
  count: number,
  depth: number,
): ReliefPointCloud {
  const cloud = buildReliefPoints(field, count, depth);
  if (cloud.count === count) return cloud;

  const settled = new Float32Array(count * 3);
  const scattered = new Float32Array(count * 3);
  const heights = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    // Wrapped rather than truncated, so asking for more points than the grid
    // produced still fills the buffer instead of leaving a hole.
    const source = i % cloud.count;
    settled[i * 3] = cloud.settled[source * 3];
    settled[i * 3 + 1] = cloud.settled[source * 3 + 1];
    settled[i * 3 + 2] = cloud.settled[source * 3 + 2];
    scattered[i * 3] = cloud.scattered[source * 3];
    scattered[i * 3 + 1] = cloud.scattered[source * 3 + 1];
    scattered[i * 3 + 2] = cloud.scattered[source * 3 + 2];
    heights[i] = cloud.heights[source];
  }
  return { settled, scattered, heights, count };
}

/**
 * A baked point cloud, dressed as a relief cloud.
 *
 * Everything the particle stage does — the brush, the dispersal, the fall of
 * colour, the rain on the way out — is written against a settled position, a
 * scattered one and a height. A cloud baked from a mesh has only positions, so
 * the other two are derived here and the whole stage works on it unchanged
 * rather than growing a second code path for a second kind of source.
 *
 * The mesh arrives Z-up from the bake and is stood upright on the way in, which
 * is the same correction the sculpture already made inline.
 */
export function reliefFromCloud(
  positions: Float32Array,
  normals: Float32Array,
  count: number,
  extentZ: number,
  fit: number,
): ReliefPointCloud & { normals: Float32Array } {
  const scale = fit / Math.max(extentZ, 0.001);
  const settled = new Float32Array(count * 3);
  const scattered = new Float32Array(count * 3);
  const heights = new Float32Array(count);

  let lowest = Infinity;
  let highest = -Infinity;
  let leftmost = Infinity;
  let rightmost = -Infinity;
  let nearest = Infinity;
  let farthest = -Infinity;
  for (let i = 0; i < count; i += 1) {
    const x = positions[i * 3] * scale;
    const depth = positions[i * 3 + 1] * scale;
    const y = positions[i * 3 + 2] * scale;
    if (y < lowest) lowest = y;
    if (y > highest) highest = y;
    if (x < leftmost) leftmost = x;
    if (x > rightmost) rightmost = x;
    if (depth < nearest) nearest = depth;
    if (depth > farthest) farthest = depth;
  }
  const span = Math.max(highest - lowest, 0.0001);
  const middle = (lowest + highest) * 0.5;
  const middleX = (leftmost + rightmost) * 0.5;
  const middleDepth = (nearest + farthest) * 0.5;
  // Carried through as well as the positions: the surface normal is what tells
  // the shader whether a point sits square to the viewer or out on the
  // silhouette, and that distinction is the whole of the feathered edge.
  const facing = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const x = positions[i * 3] * scale - middleX;
    const y = positions[i * 3 + 1] * scale - middleDepth;
    const z = positions[i * 3 + 2] * scale;

    // Z-up to Y-up.
    const px = x;
    // Centre the standing form before the viewport fit is applied. STL exports
    // commonly sit on Z=0, which otherwise puts the sculpture's base at the
    // camera centre and crops the whole of its upper half out of the frame.
    const py = z - middle;
    const pz = -y;

    settled[i * 3] = px;
    settled[i * 3 + 1] = py;
    settled[i * 3 + 2] = pz;

    // Held to a small neighbourhood, as the relief's own scatter is: pushed far
    // from where it rests, a cloud stops being the form and becomes dust.
    const lift = 0.18 + Math.random() * 0.4;
    scattered[i * 3] = px + (Math.random() - 0.5) * 0.16;
    scattered[i * 3 + 1] = py + (Math.random() - 0.5) * 0.12;
    scattered[i * 3 + 2] = pz + lift * 0.35;

    // The same Z-up to Y-up turn applied to the normal, so it still points out
    // of the surface after the model has been stood upright.
    facing[i * 3] = normals[i * 3];
    facing[i * 3 + 1] = normals[i * 3 + 2];
    facing[i * 3 + 2] = -normals[i * 3 + 1];

    // Height runs 0 at the base to 1 at the top, which is what shades the cloud
    // and staggers every effect that leaves from one end.
    heights[i] = (z - lowest) / span;
  }

  return { settled, scattered, heights, normals: facing, count };
}
