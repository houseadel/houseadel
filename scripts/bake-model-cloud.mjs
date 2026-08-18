/**
 * Bake a GLB into the same point-cloud format the sculpture uses.
 *
 * Shares its output format with `bake-point-cloud.mjs` so the runtime loader does
 * not care where a cloud came from, and shares its sampling rule: points are
 * scattered area-weighted across the triangles rather than taken from vertices,
 * because vertex sampling inherits the tessellation and ends up describing the
 * modeller's topology instead of the form.
 *
 * Usage: node scripts/bake-model-cloud.mjs <input.glb> <output-name> [points]
 */
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";
import { trianglesFromGLB } from "./lib/glb.mjs";

const OUT_DIR = "public/assets/house-adel";

function area(p, i) {
  const ax = p[i + 3] - p[i], ay = p[i + 4] - p[i + 1], az = p[i + 5] - p[i + 2];
  const bx = p[i + 6] - p[i], by = p[i + 7] - p[i + 1], bz = p[i + 8] - p[i + 2];
  const cx = ay * bz - az * by, cy = az * bx - ax * bz, cz = ax * by - ay * bx;
  return Math.hypot(cx, cy, cz) * 0.5;
}

function normal(p, i) {
  const ax = p[i + 3] - p[i], ay = p[i + 4] - p[i + 1], az = p[i + 5] - p[i + 2];
  const bx = p[i + 6] - p[i], by = p[i + 7] - p[i + 1], bz = p[i + 8] - p[i + 2];
  const cx = ay * bz - az * by, cy = az * bx - ax * bz, cz = ax * by - ay * bx;
  const length = Math.hypot(cx, cy, cz) || 1;
  return [cx / length, cy / length, cz / length];
}

async function main() {
  const source = process.argv[2];
  const name = process.argv[3];
  const target = Number(process.argv[4] ?? 90_000);
  if (!source || !name) throw new Error("Usage: bake-model-cloud.mjs <input.glb> <name> [points]");

  const triangles = trianglesFromGLB(await readFile(resolve(source)));
  const count = triangles.length / 9;
  if (!count) throw new Error("No triangles found in the model.");

  const cumulative = new Float64Array(count);
  let total = 0;
  for (let i = 0; i < count; i += 1) {
    total += area(triangles, i * 9);
    cumulative[i] = total;
  }

  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < triangles.length; i += 3) {
    if (triangles[i] < minX) minX = triangles[i];
    if (triangles[i + 1] < minY) minY = triangles[i + 1];
    if (triangles[i + 2] < minZ) minZ = triangles[i + 2];
    if (triangles[i] > maxX) maxX = triangles[i];
    if (triangles[i + 1] > maxY) maxY = triangles[i + 1];
    if (triangles[i + 2] > maxZ) maxZ = triangles[i + 2];
  }
  const spanX = maxX - minX, spanY = maxY - minY, spanZ = maxZ - minZ;
  const scale = Math.max(spanX, spanY, spanZ) || 1;
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2, cz = (minZ + maxZ) / 2;

  const pick = (value) => {
    let low = 0;
    let high = count - 1;
    while (low < high) {
      const mid = (low + high) >> 1;
      if (cumulative[mid] < value) low = mid + 1;
      else high = mid;
    }
    return low;
  };

  const quantised = new Uint16Array(target * 3);
  const packed = new Int8Array(target * 3);

  for (let i = 0; i < target; i += 1) {
    const face = pick(Math.random() * total);
    const o = face * 9;
    let u = Math.random();
    let v = Math.random();
    if (u + v > 1) {
      u = 1 - u;
      v = 1 - v;
    }
    const w = 1 - u - v;

    const x = triangles[o] * w + triangles[o + 3] * u + triangles[o + 6] * v;
    const y = triangles[o + 1] * w + triangles[o + 4] * u + triangles[o + 7] * v;
    const z = triangles[o + 2] * w + triangles[o + 5] * u + triangles[o + 8] * v;

    quantised[i * 3] = Math.round(Math.min(Math.max((x - cx) / scale + 0.5, 0), 1) * 65_535);
    quantised[i * 3 + 1] = Math.round(Math.min(Math.max((y - cy) / scale + 0.5, 0), 1) * 65_535);
    quantised[i * 3 + 2] = Math.round(Math.min(Math.max((z - cz) / scale + 0.5, 0), 1) * 65_535);

    const [nx, ny, nz] = normal(triangles, o);
    packed[i * 3] = Math.round(nx * 127);
    packed[i * 3 + 1] = Math.round(ny * 127);
    packed[i * 3 + 2] = Math.round(nz * 127);
  }

  const header = new ArrayBuffer(24);
  const view = new DataView(header);
  view.setUint32(0, 0x48414331, false); // "HAC1"
  view.setUint32(4, target, true);
  view.setFloat32(8, spanX / scale, true);
  view.setFloat32(12, spanY / scale, true);
  view.setFloat32(16, spanZ / scale, true);
  view.setUint32(20, 0, true);

  const out = Buffer.concat([
    Buffer.from(header),
    Buffer.from(quantised.buffer),
    Buffer.from(packed.buffer),
  ]);
  const file = `${OUT_DIR}/${name}-cloud.bin`;
  await writeFile(resolve(file), out);

  console.log(
    `${name}: ${count.toLocaleString()} triangles, bounds ${spanX.toFixed(2)}/${spanY.toFixed(2)}/${spanZ.toFixed(2)}, ` +
      `${target.toLocaleString()} points, ${(out.byteLength / 1024).toFixed(0)} KiB`,
  );
}

await main();
