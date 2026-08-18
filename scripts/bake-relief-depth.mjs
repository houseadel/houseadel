/**
 * Bake a bas-relief STL into a grayscale height map.
 *
 * The source model is a relief: the surface is single-valued along whichever axis
 * it is carved on, which makes it a heightfield wearing a mesh's clothing, and a
 * heightfield is a PNG. The scene ships a few hundred KB of image instead of a
 * ~150MB mesh, and the geometry, the displacement surface and the particle cloud
 * are all rebuilt from that one file at runtime.
 *
 * Nothing about the export is assumed. The carved axis, the crop and the depth
 * polarity are all detected, because the second model to come through here was
 * carved along a different axis, pointed away from the viewer, and carried loose
 * fragments around the slab.
 *
 * Usage: node scripts/bake-relief-depth.mjs "assets/originals/open-access/3d relief.stl"
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";
import sharp from "sharp";

const SIZES = [2048, 1024];
const OUT_DIR = "public/assets/house-adel";

function readBinarySTL(buffer) {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const triangles = view.getUint32(80, true);
  const expected = 84 + triangles * 50;
  if (expected !== buffer.byteLength) {
    throw new Error(
      `Not a binary STL, or it is truncated: header claims ${triangles} triangles ` +
        `(${expected} bytes) but the file is ${buffer.byteLength} bytes.`,
    );
  }

  const positions = new Float32Array(triangles * 9);
  let offset = 84;
  for (let i = 0; i < triangles; i += 1) {
    offset += 12; // face normal, unused: the runtime reconstructs normals itself
    for (let v = 0; v < 3; v += 1) {
      positions[i * 9 + v * 3] = view.getFloat32(offset, true);
      positions[i * 9 + v * 3 + 1] = view.getFloat32(offset + 4, true);
      positions[i * 9 + v * 3 + 2] = view.getFloat32(offset + 8, true);
      offset += 12;
    }
    offset += 2; // attribute byte count
  }
  return { positions, triangles };
}

function bounds(positions) {
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i], y = positions[i + 1], z = positions[i + 2];
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (z < minZ) minZ = z;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
    if (z > maxZ) maxZ = z;
  }
  return { minX, minY, minZ, maxX, maxY, maxZ };
}

/**
 * Work out which axis the relief is carved along.
 *
 * A bas-relief is shallow by definition, so its depth axis is whichever one has
 * far the smallest extent. Detecting it rather than assuming Z means a model
 * exported from a different tool, or laid down flat, bakes correctly without
 * anyone having to rotate it first.
 */
function orient(box) {
  const spans = [
    { axis: 0, span: box.maxX - box.minX, min: box.minX },
    { axis: 1, span: box.maxY - box.minY, min: box.minY },
    { axis: 2, span: box.maxZ - box.minZ, min: box.minZ },
  ];
  const depth = spans.reduce((a, b) => (b.span < a.span ? b : a));
  const plane = spans.filter((s) => s !== depth);
  // Wider of the two in-plane axes runs horizontally; the other is vertical.
  const [across, up] = plane[0].span >= plane[1].span ? [plane[0], plane[1]] : [plane[1], plane[0]];
  return { depth, across, up };
}

/**
 * Splat vertices into the grid, keeping the nearest surface at each cell.
 *
 * Vertex splatting rather than triangle rasterisation: at these triangle counts
 * the mesh is far denser than the grid, so every cell that the surface covers
 * receives several vertices anyway, and the few that do not are filled by the
 * dilation pass below. Rasterising would cost far more for no visible gain.
 */
function splat(positions, axes, width, height) {
  const grid = new Float32Array(width * height).fill(-Infinity);
  const { depth, across, up } = axes;
  const spanDepth = depth.span || 1;

  for (let i = 0; i < positions.length; i += 3) {
    const u = (positions[i + across.axis] - across.min) / across.span;
    // Image space runs downward; model space runs up.
    const v = 1 - (positions[i + up.axis] - up.min) / up.span;
    const h = (positions[i + depth.axis] - depth.min) / spanDepth;
    const x = Math.min(width - 1, Math.max(0, Math.round(u * (width - 1))));
    const y = Math.min(height - 1, Math.max(0, Math.round(v * (height - 1))));
    const index = y * width + x;
    if (h > grid[index]) grid[index] = h;
  }
  return grid;
}

/**
 * Crop away stray geometry outside the slab.
 *
 * The export carries loose fragments around the relief itself. Left in, they
 * survive dilation as a band of noise along every edge, and cover-fit puts that
 * band right at the edge of the screen. Rows and columns are kept only where the
 * surface actually sampled densely, which is the slab and nothing else.
 */
function trim(grid, width, height, threshold = 0.6) {
  const rowFilled = new Array(height).fill(0);
  const colFilled = new Array(width).fill(0);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (grid[y * width + x] === -Infinity) continue;
      rowFilled[y] += 1;
      colFilled[x] += 1;
    }
  }

  let top = 0;
  let bottom = height - 1;
  while (top < bottom && rowFilled[top] < width * threshold) top += 1;
  while (bottom > top && rowFilled[bottom] < width * threshold) bottom -= 1;

  let left = 0;
  let right = width - 1;
  while (left < right && colFilled[left] < height * threshold) left += 1;
  while (right > left && colFilled[right] < height * threshold) right -= 1;

  const w = right - left + 1;
  const h = bottom - top + 1;
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      out[y * w + x] = grid[(y + top) * width + (x + left)];
    }
  }
  return { grid: out, width: w, height: h };
}

/**
 * Put the background plate at black and the carving above it.
 *
 * Whether the model's depth axis points toward the viewer or away from them
 * depends on how it was exported, and getting it backwards renders the figures
 * as holes. The flat plate is by far the most common single depth in a relief,
 * so if the mode sits in the upper half of the range the axis is pointing away
 * and the field is flipped.
 */
function orientDepth(grid) {
  const bins = new Int32Array(64);
  let min = Infinity;
  let max = -Infinity;
  for (const value of grid) {
    if (value === -Infinity) continue;
    if (value < min) min = value;
    if (value > max) max = value;
  }
  const range = max - min || 1;
  for (const value of grid) {
    if (value === -Infinity) continue;
    bins[Math.min(63, Math.floor(((value - min) / range) * 64))] += 1;
  }
  let mode = 0;
  for (let i = 1; i < bins.length; i += 1) if (bins[i] > bins[mode]) mode = i;

  if (mode / 64 <= 0.5) return { grid, flipped: false };
  const flipped = grid.slice();
  for (let i = 0; i < flipped.length; i += 1) {
    if (flipped[i] !== -Infinity) flipped[i] = max - (flipped[i] - min);
  }
  return { grid: flipped, flipped: true };
}

/** Fill unsampled cells from their neighbours until none are left. */
function dilate(grid, width, height) {
  const filled = grid.slice();
  for (let pass = 0; pass < 6; pass += 1) {
    let holes = 0;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = y * width + x;
        if (filled[index] !== -Infinity) continue;
        let sum = 0;
        let count = 0;
        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
            const value = filled[ny * width + nx];
            if (value === -Infinity) continue;
            sum += value;
            count += 1;
          }
        }
        if (count) filled[index] = sum / count;
        else holes += 1;
      }
    }
    if (!holes) break;
  }
  for (let i = 0; i < filled.length; i += 1) if (filled[i] === -Infinity) filled[i] = 0;
  return filled;
}

/** 3x3 median. Kills isolated spikes without softening real edges. */
function despeckle(grid, width, height) {
  const out = grid.slice();
  const window = new Float32Array(9);
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      let n = 0;
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          window[n] = grid[(y + dy) * width + (x + dx)];
          n += 1;
        }
      }
      const sorted = Array.prototype.slice.call(window, 0, 9).sort((a, b) => a - b);
      out[y * width + x] = sorted[4];
    }
  }
  return out;
}

async function main() {
  const source = process.argv[2] ?? "assets/originals/open-access/3d relief.stl";
  const buffer = await readFile(resolve(source));
  const { positions, triangles } = readBinarySTL(buffer);
  const box = bounds(positions);
  const axes = orient(box);
  const aspect = axes.across.span / axes.up.span;
  const names = ["x", "y", "z"];

  console.log(`triangles: ${triangles.toLocaleString()}`);
  console.log(
    `bounds x ${(box.maxX - box.minX).toFixed(2)}  y ${(box.maxY - box.minY).toFixed(2)}  ` +
      `z ${(box.maxZ - box.minZ).toFixed(2)}`,
  );
  console.log(
    `across: ${names[axes.across.axis]}  up: ${names[axes.up.axis]}  ` +
      `depth: ${names[axes.depth.axis]} (${axes.depth.span.toFixed(2)})`,
  );
  console.log(`aspect: ${aspect.toFixed(4)}`);

  // Baked once at full size and resized down, so both files are guaranteed to
  // describe exactly the same surface at the same aspect.
  const base = Math.max(...SIZES);
  const sampled = splat(positions, axes, base, Math.max(1, Math.round(base / aspect)));
  const cropped = trim(sampled, base, Math.max(1, Math.round(base / aspect)));
  const oriented = orientDepth(cropped.grid);
  const { width, height } = cropped;
  const grid = despeckle(
    dilate(oriented.grid, width, height),
    width,
    height,
  );

  const finalAspect = width / height;
  console.log(`trimmed to ${width}x${height} (aspect ${finalAspect.toFixed(4)})`);
  console.log(`depth axis ${oriented.flipped ? "pointed away, flipped" : "pointed at the viewer"}`);

  let min = Infinity;
  let max = -Infinity;
  for (const value of grid) {
    if (value < min) min = value;
    if (value > max) max = value;
  }
  const range = max - min || 1;

  const pixels = Buffer.allocUnsafe(width * height);
  for (let i = 0; i < grid.length; i += 1) {
    pixels[i] = Math.round(((grid[i] - min) / range) * 255);
  }

  for (const target of SIZES) {
    const file = `${OUT_DIR}/relief-depth-${target}.png`;
    await sharp(pixels, { raw: { width, height, channels: 1 } })
      .resize({ width: target, height: Math.max(1, Math.round(target / finalAspect)), fit: "fill" })
      .png({ compressionLevel: 9, palette: false })
      .toFile(resolve(file));
    console.log(`wrote ${file} (${target}x${Math.round(target / finalAspect)})`);
  }

  console.log(`\nSet RELIEF_ASPECT in src/features/relief/reliefData.ts to ${finalAspect.toFixed(2)}`);
}

await main();
