/**
 * A minimal glTF binary reader: just enough to get triangles out.
 *
 * Only positions and indices are read, and every mesh in the file is baked into
 * one flat list of world-space triangles. Materials, textures, animations, skins
 * and cameras are ignored on purpose — everything here becomes particles, so the
 * only question a model has to answer is where its surface is.
 *
 * Node transforms are applied while walking the scene graph. Skipping that step
 * is the classic way to bake a model that looks right in Blender and arrives
 * scattered, rotated or a hundred times too large: an exporter is free to leave
 * the geometry at the origin and put the placement on the node.
 */
const MAGIC = 0x46546c67; // "glTF"
const JSON_CHUNK = 0x4e4f534a;
const BIN_CHUNK = 0x004e4942;

const COMPONENT = {
  5120: { array: Int8Array, size: 1 },
  5121: { array: Uint8Array, size: 1 },
  5122: { array: Int16Array, size: 2 },
  5123: { array: Uint16Array, size: 2 },
  5125: { array: Uint32Array, size: 4 },
  5126: { array: Float32Array, size: 4 },
};

const COUNTS = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };

export function parseGLB(buffer) {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  if (view.getUint32(0, true) !== MAGIC) throw new Error("Not a GLB file.");

  let offset = 12;
  let json = null;
  let bin = null;
  while (offset < view.byteLength) {
    const length = view.getUint32(offset, true);
    const type = view.getUint32(offset + 4, true);
    const start = offset + 8;
    if (type === JSON_CHUNK) {
      json = JSON.parse(new TextDecoder().decode(buffer.subarray(start, start + length)));
    } else if (type === BIN_CHUNK) {
      bin = buffer.subarray(start, start + length);
    }
    offset = start + length + ((4 - (length % 4)) % 4);
  }
  if (!json) throw new Error("GLB has no JSON chunk.");
  return { json, bin };
}

function readAccessor(json, bin, index) {
  const accessor = json.accessors[index];
  const component = COMPONENT[accessor.componentType];
  const count = COUNTS[accessor.type];
  if (!component || !count) throw new Error(`Unsupported accessor ${accessor.type}`);

  const out = new Float32Array(accessor.count * count);
  if (accessor.bufferView === undefined) return out;

  const bufferView = json.bufferViews[accessor.bufferView];
  const base = (bufferView.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
  // Interleaved data is normal in exported glTF: the stride is how far apart two
  // consecutive elements sit, which is not the same as their size.
  const stride = bufferView.byteStride ?? component.size * count;
  const view = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);

  for (let i = 0; i < accessor.count; i += 1) {
    for (let c = 0; c < count; c += 1) {
      const at = base + i * stride + c * component.size;
      let value;
      switch (accessor.componentType) {
        case 5126: value = view.getFloat32(at, true); break;
        case 5125: value = view.getUint32(at, true); break;
        case 5123: value = view.getUint16(at, true); break;
        case 5122: value = view.getInt16(at, true); break;
        case 5121: value = view.getUint8(at); break;
        default: value = view.getInt8(at); break;
      }
      out[i * count + c] = value;
    }
  }
  return out;
}

function multiply(a, b) {
  const out = new Float64Array(16);
  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 4; column += 1) {
      out[column * 4 + row] =
        a[row] * b[column * 4] +
        a[4 + row] * b[column * 4 + 1] +
        a[8 + row] * b[column * 4 + 2] +
        a[12 + row] * b[column * 4 + 3];
    }
  }
  return out;
}

function nodeMatrix(node) {
  if (node.matrix) return Float64Array.from(node.matrix);
  const [tx, ty, tz] = node.translation ?? [0, 0, 0];
  const [qx, qy, qz, qw] = node.rotation ?? [0, 0, 0, 1];
  const [sx, sy, sz] = node.scale ?? [1, 1, 1];

  const x2 = qx + qx, y2 = qy + qy, z2 = qz + qz;
  const xx = qx * x2, xy = qx * y2, xz = qx * z2;
  const yy = qy * y2, yz = qy * z2, zz = qz * z2;
  const wx = qw * x2, wy = qw * y2, wz = qw * z2;

  return Float64Array.from([
    (1 - (yy + zz)) * sx, (xy + wz) * sx, (xz - wy) * sx, 0,
    (xy - wz) * sy, (1 - (xx + zz)) * sy, (yz + wx) * sy, 0,
    (xz + wy) * sz, (yz - wx) * sz, (1 - (xx + yy)) * sz, 0,
    tx, ty, tz, 1,
  ]);
}

/** Every triangle in the file, in world space, as a flat Float32Array of 9s. */
export function trianglesFromGLB(buffer) {
  const { json, bin } = parseGLB(buffer);
  if (!bin) throw new Error("GLB has no binary chunk.");

  const chunks = [];
  let total = 0;

  const visit = (nodeIndex, parent) => {
    const node = json.nodes[nodeIndex];
    const world = multiply(parent, nodeMatrix(node));

    if (node.mesh !== undefined) {
      for (const primitive of json.meshes[node.mesh].primitives) {
        // Mode 4 is TRIANGLES. Strips, fans and point clouds are rare from an
        // exporter and are skipped rather than guessed at.
        if (primitive.mode !== undefined && primitive.mode !== 4) continue;
        if (primitive.attributes?.POSITION === undefined) continue;

        const positions = readAccessor(json, bin, primitive.attributes.POSITION);
        const indices =
          primitive.indices !== undefined
            ? readAccessor(json, bin, primitive.indices)
            : Float32Array.from({ length: positions.length / 3 }, (_, i) => i);

        const triangles = new Float32Array(indices.length * 3);
        for (let i = 0; i < indices.length; i += 1) {
          const v = indices[i] * 3;
          const x = positions[v], y = positions[v + 1], z = positions[v + 2];
          triangles[i * 3] = world[0] * x + world[4] * y + world[8] * z + world[12];
          triangles[i * 3 + 1] = world[1] * x + world[5] * y + world[9] * z + world[13];
          triangles[i * 3 + 2] = world[2] * x + world[6] * y + world[10] * z + world[14];
        }
        chunks.push(triangles);
        total += triangles.length;
      }
    }

    for (const child of node.children ?? []) visit(child, world);
  };

  const identity = Float64Array.from([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  const scene = json.scenes?.[json.scene ?? 0];
  for (const root of scene?.nodes ?? json.nodes.map((_, i) => i)) visit(root, identity);

  const out = new Float32Array(total);
  let at = 0;
  for (const chunk of chunks) {
    out.set(chunk, at);
    at += chunk.length;
  }
  return out;
}
