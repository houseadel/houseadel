import * as THREE from "three";
import { DISSOLVE_FRAGMENT, DISSOLVE_VERTEX } from "./dissolveShader";
import type { DissolveField } from "./dissolveField";

/**
 * One renderer, for the life of the document.
 *
 * The version of this transition that came before built a renderer, a scene, a
 * geometry, a material and a canvas on every single navigation, and tore them
 * all down again a second later. That churn is what destabilised the page badly
 * enough that the effect had to be switched off at the wall rather than fixed —
 * a WebGL context is an expensive, driver-owned resource, and creating one per
 * click on a site that already runs several is asking for exactly the stalls
 * that were observed.
 *
 * So there is one of everything here, made lazily on the first navigation and
 * kept. A transition sets uniforms and draws; it does not construct anything.
 * The canvas is idle and invisible in between, costing a texture's worth of
 * memory and no frames at all.
 *
 * Nothing in here is on the critical path of navigating. Every entry point
 * tolerates the context being absent or lost, because the route commit is owned
 * by the clock and must never wait on a GPU.
 */

/** Everything a running transition needs from the drawing layer. */
export type DissolveDraw = {
  progress: number;
  threshold: number;
  direction: { x: number; y: number };
  spectralStrength: number;
  opacity: number;
  elapsed: number;
};

export type DissolveHandle = {
  canvas: HTMLCanvasElement;
  /** Uploads a new field. Recreates the texture only when the grid changes. */
  setField: (field: DissolveField) => void;
  resize: () => void;
  draw: (state: DissolveDraw) => void;
  /** Leaves nothing on screen. Called whenever a transition stops, however. */
  clear: () => void;
  readonly alive: boolean;
};

function compact() {
  return window.matchMedia("(max-width: 47.99rem)").matches;
}

/**
 * The device pixel ratio ceiling.
 *
 * The single most important number for image quality here, and the one the
 * previous effect got wrong in the other direction. Rendering below the display
 * and letting CSS stretch the result is what produced the pixelation this work
 * exists to remove, so the backing store is always sized from these caps and the
 * CSS size together — never one without the other.
 *
 * Two is where the returns stop for a soft-edged rim on a desktop display.
 * Phones are capped lower: their pixel ratios run to three and four, the effect
 * is full-screen, and nothing about a grain boundary rewards that.
 */
function pixelRatioCap() {
  return compact() ? 1.5 : 2;
}

let handle: DissolveHandle | null = null;
let attempted = false;

function build(): DissolveHandle | null {
  const canvas = document.createElement("canvas");
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      // No geometry edges exist in this material; every boundary it draws is
      // already soft. Multisampling would cost a full extra buffer for nothing.
      antialias: false,
      powerPreference: "low-power",
      preserveDrawingBuffer: false,
    });
  } catch {
    return null;
  }

  renderer.setClearAlpha(0);

  const scene = new THREE.Scene();
  // Screen space, so there is no perspective to distort a full-frame effect.
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geometry = new THREE.PlaneGeometry(2, 2);

  const uniforms = {
    uField: { value: null as THREE.DataTexture | null },
    uProgress: { value: 0 },
    uThreshold: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uEdgeSoftness: { value: compact() ? 0.05 : 0.042 },
    uDirection: { value: new THREE.Vector2(1, 0) },
    uTime: { value: 0 },
    uNoiseScale: { value: compact() ? 34 : 46 },
    // Deliberately well under uEdgeSoftness: this granulates the cut, it does
    // not move it away from the contour the document is clipping along.
    uNoiseDetail: { value: 0.02 },
    uSpectralStrength: { value: 1 },
    uSpectralWidth: { value: compact() ? 0.012 : 0.016 },
    uOpacity: { value: 0 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    defines: { HA_OCTAVES: compact() ? 2 : 3 },
    vertexShader: DISSOLVE_VERTEX,
    fragmentShader: DISSOLVE_FRAGMENT,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    // The rim is light at a tear, so it adds to what is behind it rather than
    // painting over it.
    blending: THREE.AdditiveBlending,
  });

  scene.add(new THREE.Mesh(geometry, material));

  let texture: THREE.DataTexture | null = null;
  let textureColumns = 0;
  let textureRows = 0;
  let alive = true;

  canvas.addEventListener("webglcontextlost", (event) => {
    // Prevented so the browser will restore it; until it does, every draw is a
    // no-op and navigation carries on without a rim.
    event.preventDefault();
    alive = false;
  });
  canvas.addEventListener("webglcontextrestored", () => {
    alive = true;
    resize();
  });

  /*
   * The box the canvas actually occupies, not the window.
   *
   * `window.innerWidth` includes the classic scrollbar; a `position: fixed`
   * layer does not. Sizing from the window therefore drew a buffer very slightly
   * wider than the element it was displayed in, and the difference came out as
   * stretch. Measuring the host removes the question, and falls back to the
   * layout viewport for the moment before the canvas is attached.
   */
  function viewport() {
    const parent = canvas.parentElement;
    if (parent) {
      const rect = parent.getBoundingClientRect();
      if (rect.width > 1 && rect.height > 1) {
        return { width: Math.round(rect.width), height: Math.round(rect.height) };
      }
    }
    return {
      width: document.documentElement.clientWidth || window.innerWidth,
      height: document.documentElement.clientHeight || window.innerHeight,
    };
  }

  function resize() {
    const { width, height } = viewport();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioCap()));
    // `true` matters: three writes both the backing store and the CSS size, so
    // the two can never drift apart and nothing is ever stretched.
    renderer.setSize(width, height, true);
    const buffer = new THREE.Vector2();
    renderer.getDrawingBufferSize(buffer);
    uniforms.uResolution.value.copy(buffer);
  }

  resize();

  return {
    canvas,
    get alive() {
      return alive;
    },
    setField(field) {
      const width = field.columns + 1;
      const height = field.rows + 1;
      if (!texture || textureColumns !== width || textureRows !== height) {
        texture?.dispose();
        texture = new THREE.DataTexture(
          new Uint8Array(width * height),
          width,
          height,
          THREE.RedFormat,
          THREE.UnsignedByteType,
        );
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        // A single-channel row is rarely a multiple of four bytes, and the
        // default alignment of four would shear every row against the next.
        texture.unpackAlignment = 1;
        textureColumns = width;
        textureRows = height;
        uniforms.uField.value = texture;
      }
      const data = texture.image.data as Uint8Array;
      for (let index = 0; index < data.length; index += 1) {
        data[index] = Math.max(0, Math.min(255, Math.round(field.samples[index] * 255)));
      }
      texture.needsUpdate = true;
    },
    resize,
    draw(state) {
      if (!alive) return;
      uniforms.uProgress.value = state.progress;
      uniforms.uThreshold.value = state.threshold;
      uniforms.uDirection.value.set(state.direction.x, state.direction.y);
      uniforms.uSpectralStrength.value = state.spectralStrength;
      uniforms.uOpacity.value = state.opacity;
      uniforms.uTime.value = state.elapsed;
      try {
        renderer.render(scene, camera);
      } catch {
        // A driver that refuses mid-navigation is not allowed to take the
        // navigation with it.
        alive = false;
      }
    },
    clear() {
      uniforms.uOpacity.value = 0;
      if (!alive) return;
      try {
        renderer.clear();
      } catch {
        alive = false;
      }
    },
  };
}

/**
 * The renderer, built on first use.
 *
 * Returns null forever if WebGL is unavailable or construction failed once —
 * retrying per navigation would mean paying for the failure on every click.
 */
export function ensureDissolveRenderer(): DissolveHandle | null {
  if (handle || attempted) return handle;
  attempted = true;
  handle = build();
  return handle;
}
