/**
 * Bake an STL into a compact point cloud.
 *
 * The relief could be reduced to a height map because it is single-valued along
 * one axis. A free-standing sculpture cannot: it has sides, undercuts and a back,
 * so it needs real points in three dimensions.
 *
 * Points are sampled area-weighted across the triangles rather than taken from
 * the vertices. Vertex sampling inherits the tessellation, which on a scanned or
 * decimated mesh is wildly uneven — dense where the surface is fiddly, sparse
 * across flat panels — and the cloud ends up describing the mesher's decisions
 * rather than the form.
 *
 * Positions are quantised to 16 bits inside the bounding box. At this scale that
 * is well under a pixel of error and it halves the download.
 *
 * Every cloud in the output folder shares one convention: Z is up, X runs across
 * the subject and Y runs into depth, because that is what `reliefFromCloud`
 * stands the model up from. Exports do not all agree, and a model that arrives
 * with its width on Y stands side-on to the camera and draws as a wall rather
 * than as a form, so an optional yaw about the up axis can be applied here. It
 * is a rotation rather than an axis swap on purpose: swapping two axes mirrors
 * the model and turns every surface normal inward, which would leave the runtime
 * lighting the inside of the sculpture.
 *
 * Usage: node scripts/bake-point-cloud.mjs "assets/originals/open-access/3d work.stl" work 160000
 *        node scripts/bake-point-cloud.mjs "assets/originals/open-access/3d/davidd.stl" david 150000
 */
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";

/*
 * The output name is an argument, not a constant.
 *
 * It used to be fixed at work-cloud.bin, so baking any second model silently
 * overwrote the first. Nothing at the command line reports it; the only symptom
 * is the wrong shape appearing on the page later.
 */
const OUT_DIR = "public/assets/house-adel";

function readBinarySTL(buffer) {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const triangles = view.getUint32(80, true);
  if (84 + triangles * 50 !== buffer.byteLength) {
    throw new Error("Not a binary STL, or it is truncated.");
  }

  const positions = new Float32Array(triangles * 9);
  const normals = new Float32Array(triangles * 3);
  let offset = 84;
  for (let i = 0; i < triangles; i += 1) {
    normals[i * 3] = view.getFloat32(offset, true);
    normals[i * 3 + 1] = view.getFloat32(offset + 4, true);
    normals[i * 3 + 2] = view.getFloat32(offset + 8, true);
    offset += 12;
    for (let v = 0; v < 3; v += 1) {
      positions[i * 9 + v * 3] = view.getFloat32(offset, true);
      positions[i * 9 + v * 3 + 1] = view.getFloat32(offset + 4, true);
      positions[i * 9 + v * 3 + 2] = view.getFloat32(offset + 8, true);
      offset += 12;
    }
    offset += 2;
  }
  return { positions, normals, triangles };
}

/** Turn the model about the up axis, in place, positions and normals alike. */
function yawAboutZ(positions, normals, degrees) {
  if (!degrees) return;
  const radians = (degrees * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  for (const array of [positions, normals]) {
    for (let i = 0; i < array.length; i += 3) {
      const x = array[i];
      const y = array[i + 1];
      array[i] = x * cos - y * sin;
      array[i + 1] = x * sin + y * cos;
    }
  }
}

function triangleArea(p, i) {
  const ax = p[i + 3] - p[i];
  const ay = p[i + 4] - p[i + 1];
  const az = p[i + 5] - p[i + 2];
  const bx = p[i + 6] - p[i];
  const by = p[i + 7] - p[i + 1];
  const bz = p[i + 8] - p[i + 2];
  const cx = ay * bz - az * by;
  const cy = az * bx - ax * bz;
  const cz = ax * by - ay * bx;
  return Math.hypot(cx, cy, cz) * 0.5;
}

async function main() {
  const source = process.argv[2] ?? "assets/originals/open-access/3d work.stl";
  const name = process.argv[3];
  const target = Number(process.argv[4] ?? 160_000);
  const yaw = Number(process.argv[5] ?? 0);
  if (!name) throw new Error("Usage: bake-point-cloud.mjs <input.stl> <name> [points] [yaw]");
  const OUT = `${OUT_DIR}/${name}-cloud.bin`;
  const { positions, normals, triangles } = readBinarySTL(await readFile(resolve(source)));
  yawAboutZ(positions, normals, yaw);

  // Cumulative area, so a uniform random draw picks a triangle in proportion to
  // how much surface it actually covers.
  const cumulative = new Float64Array(triangles);
  let total = 0;
  for (let i = 0; i < triangles; i += 1) {
    total += triangleArea(positions, i * 9);
    cumulative[i] = total;
  }

  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < positions.length; i += 3) {
    if (positions[i] < minX) minX = positions[i];
    if (positions[i + 1] < minY) minY = positions[i + 1];
    if (positions[i + 2] < minZ) minZ = positions[i + 2];
    if (positions[i] > maxX) maxX = positions[i];
    if (positions[i + 1] > maxY) maxY = positions[i + 1];
    if (positions[i + 2] > maxZ) maxZ = positions[i + 2];
  }
  const spanX = maxX - minX;
  const spanY = maxY - minY;
  const spanZ = maxZ - minZ;
  const scale = Math.max(spanX, spanY, spanZ) || 1;
  const centreX = (minX + maxX) / 2;
  const centreY = (minY + maxY) / 2;
  const centreZ = (minZ + maxZ) / 2;

  const pick = (value) => {
    let low = 0;
    let high = triangles - 1;
    while (low < high) {
      const mid = (low + high) >> 1;
      if (cumulative[mid] < value) low = mid + 1;
      else high = mid;
    }
    return low;
  };

  const quantised = new Uint16Array(target * 3);
  const packedNormals = new Int8Array(target * 3);

  for (let i = 0; i < target; i += 1) {
    const face = pick(Math.random() * total);
    const o = face * 9;

    // Uniform barycentric sample. The square roots are what keep the points even
    // across the triangle instead of bunching toward one corner.
    let u = Math.random();
    let v = Math.random();
    if (u + v > 1) {
      u = 1 - u;
      v = 1 - v;
    }
    const w = 1 - u - v;

    const x = positions[o] * w + positions[o + 3] * u + positions[o + 6] * v;
    const y = positions[o + 1] * w + positions[o + 4] * u + positions[o + 7] * v;
    const z = positions[o + 2] * w + positions[o + 5] * u + positions[o + 8] * v;

    // Centred on the model and normalised to a unit box, so the scene can place
    // it without knowing anything about the units the sculpture was made in.
    const nx = (x - centreX) / scale + 0.5;
    const ny = (y - centreY) / scale + 0.5;
    const nz = (z - centreZ) / scale + 0.5;

    quantised[i * 3] = Math.round(Math.min(Math.max(nx, 0), 1) * 65_535);
    quantised[i * 3 + 1] = Math.round(Math.min(Math.max(ny, 0), 1) * 65_535);
    quantised[i * 3 + 2] = Math.round(Math.min(Math.max(nz, 0), 1) * 65_535);

    packedNormals[i * 3] = Math.round(Math.min(Math.max(normals[face * 3], -1), 1) * 127);
    packedNormals[i * 3 + 1] = Math.round(Math.min(Math.max(normals[face * 3 + 1], -1), 1) * 127);
    packedNormals[i * 3 + 2] = Math.round(Math.min(Math.max(normals[face * 3 + 2], -1), 1) * 127);
  }

  // Header: magic, count, then the three spans so the runtime can restore the
  // model's proportions from the unit box.
  const header = new ArrayBuffer(24);
  const headerView = new DataView(header);
  headerView.setUint32(0, 0x48414331, false); // "HAC1"
  headerView.setUint32(4, target, true);
  headerView.setFloat32(8, spanX / scale, true);
  headerView.setFloat32(12, spanY / scale, true);
  headerView.setFloat32(16, spanZ / scale, true);
  headerView.setUint32(20, 0, true);

  const out = Buffer.concat([
    Buffer.from(header),
    Buffer.from(quantised.buffer),
    Buffer.from(packedNormals.buffer),
  ]);
  await writeFile(resolve(OUT), out);

  console.log(`triangles: ${triangles.toLocaleString()}${yaw ? `, yawed ${yaw}°` : ""}`);
  console.log(`bounds x ${spanX.toFixed(2)}  y ${spanY.toFixed(2)}  z ${spanZ.toFixed(2)}`);
  console.log(`points: ${target.toLocaleString()}`);
  console.log(`wrote ${OUT} (${(out.byteLength / 1024).toFixed(0)} KiB)`);
}

await main();
