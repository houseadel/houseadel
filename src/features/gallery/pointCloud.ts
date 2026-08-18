/**
 * Loads a cloud baked by `scripts/bake-point-cloud.mjs`.
 *
 * The format is deliberately plain: a 24-byte header, then quantised positions,
 * then packed normals. No parser, no dependency, and the whole file is two typed
 * array views over one fetched buffer.
 */
export type PointCloud = {
  count: number;
  /** Unit-box positions, centred on the origin. */
  positions: Float32Array;
  normals: Float32Array;
  /** Proportions of the source model, longest axis normalised to 1. */
  extent: { x: number; y: number; z: number };
};

const MAGIC = 0x48414331;

/**
 * One decode per cloud, for the life of the tab.
 *
 * The bytes are cheap to fetch a second time — the browser has them — but every
 * mount was re-expanding a hundred and fifty thousand quantised triples into two
 * fresh Float32Arrays on the main thread, which is a visible stall each time a
 * reader leaves a sculpture's route and comes back to it. A decoded cloud is
 * read-only: the stage subsets and rearranges it into buffers of its own and
 * never writes through to this one, so the same object can be handed to every
 * caller that asks for the same file.
 *
 * A failure is not remembered. Caching a rejection would turn one bad response
 * into a sculpture that is missing for the rest of the visit.
 */
const decoded = new Map<string, Promise<PointCloud>>();

export function loadPointCloud(url: string): Promise<PointCloud> {
  const cached = decoded.get(url);
  if (cached) return cached;
  const task = fetchPointCloud(url).catch((error: unknown) => {
    decoded.delete(url);
    throw error;
  });
  decoded.set(url, task);
  return task;
}

async function fetchPointCloud(url: string): Promise<PointCloud> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Point cloud failed to load: ${response.status}`);
  const buffer = await response.arrayBuffer();

  const header = new DataView(buffer, 0, 24);
  if (header.getUint32(0, false) !== MAGIC) throw new Error("Not a House Adel point cloud.");
  const count = header.getUint32(4, true);
  const extent = {
    x: header.getFloat32(8, true),
    y: header.getFloat32(12, true),
    z: header.getFloat32(16, true),
  };

  const quantised = new Uint16Array(buffer, 24, count * 3);
  const packed = new Int8Array(buffer, 24 + count * 6, count * 3);

  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i += 1) {
    // Back to a unit box centred on the origin.
    positions[i] = quantised[i] / 65_535 - 0.5;
    normals[i] = packed[i] / 127;
  }

  return { count, positions, normals, extent };
}

/**
 * A scattered position for every point, used as the state the cloud arrives from.
 *
 * Scattered on a sphere rather than in a box: the sculpture gathers out of a
 * drifting shell, which reads as the same material Home's relief disperses into
 * rather than as a cube of noise collapsing.
 */
export function scatterFor(cloud: PointCloud, radius = 1.35): Float32Array {
  const scattered = new Float32Array(cloud.count * 3);
  for (let i = 0; i < cloud.count; i += 1) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radius * (0.72 + Math.random() * 0.5);
    scattered[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
    scattered[i * 3 + 1] = Math.cos(phi) * r * 0.8;
    scattered[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * r;
  }
  return scattered;
}
