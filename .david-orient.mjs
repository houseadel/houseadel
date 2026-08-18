// Throwaway: orthographic silhouettes of a baked cloud, to see which way the
// model faces before choosing a bake yaw.
import { readFileSync } from "node:fs";
import sharp from "sharp";

const name = process.argv[2] ?? "david";
const buffer = readFileSync(`public/assets/house-adel/${name}-cloud.bin`);
const view = new DataView(buffer.buffer, buffer.byteOffset, 24);
const count = view.getUint32(4, true);
console.log(name, {
  count,
  x: view.getFloat32(8, true),
  y: view.getFloat32(12, true),
  z: view.getFloat32(16, true),
});

const quantised = new Uint16Array(buffer.buffer, buffer.byteOffset + 24, count * 3);
const p = new Float32Array(count * 3);
for (let i = 0; i < count * 3; i += 1) p[i] = quantised[i] / 65535 - 0.5;

const W = 220;
const H = 420;

async function project(label, ai, flip) {
  const pixels = new Uint8Array(W * H).fill(0);
  for (let i = 0; i < count; i += 1) {
    const a = (flip ? -1 : 1) * p[i * 3 + ai];
    const b = p[i * 3 + 2];
    const x = Math.round((a + 0.5) * (W - 1));
    const y = Math.round((0.5 - b) * (H - 1));
    if (x < 0 || x >= W || y < 0 || y >= H) continue;
    const at = y * W + x;
    pixels[at] = Math.min(255, pixels[at] + 40);
  }
  await sharp(Buffer.from(pixels), { raw: { width: W, height: H, channels: 1 } })
    .png()
    .toFile(`${process.env.OUT_DIR}/${name}-${label}.png`);
  console.log("wrote", label);
}

// Looking down -Y (what the runtime camera sees) and down -X (the profile).
await project("front", 0, false);
await project("side", 1, false);
