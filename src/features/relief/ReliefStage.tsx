import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { graphicsAreDisabled, motionIsReduced, pointerIsFine } from "../../lib/preferences";
import { onPointerActivity, pointerSignal } from "../../lib/pointerSignal";
import {
  buildReliefGeometry,
  buildReliefPointsFixed,
  buildReliefPointsAsync,
  reliefFromCloud,
  loadHeightField,
  RELIEF_ASPECT,
  type ReliefHeightField,
  type ReliefPointCloud,
} from "./reliefData";
import { RAY_DIRECTION, RAY_ORIGIN, rayIntensity } from "../../lib/godRays";
import { loadPointCloud, type PointCloud } from "../gallery/pointCloud";
import { ProjectPlane } from "../gallery/WorkGallery";
import { TURNS, panFor } from "../gallery/helix";
import type { Project } from "../../data/work";
import styles from "./ReliefStage.module.css";
import { RenderGate, frameloopFor, noPointerEvents } from "../../lib/webgl/renderGate";
import { coverageAt, silhouetteProfile } from "./silhouette";
import { onTransitionFrame } from "../transition/transitionClock";

/**
 * The box a framed model fills, in the stage's own normalised space.
 *
 * One pair of numbers, because the hover test and the liquid lens must agree
 * about where the sculpture is or the hand meets two different objects.
 */
const MODEL_HALF_WIDTH = 0.583;
const MODEL_HALF_HEIGHT = 0.883;
import { SPECTRUM_CHUNK } from "../liquid/spectrum";

export type ReliefMode = "mesh" | "displacement" | "particles";

const DEPTH = 0.17;

/** Seconds of stillness before the relief begins to colour on its own. */
const IDLE_AFTER = 5.5;
/** Seconds a single fall of colour takes from the top of the relief to the base. */
const SWEEP_SECONDS = 1.5;
/** Seconds of quiet between one fall and the next. */
const SWEEP_REST = 3.4;

/**
 * `love.stl` stood upright: width over height, from the cloud's own header.
 *
 * A free-standing subject is contain-fitted against its real proportions, so the
 * frame belongs to the model rather than to the stage. Kept as the default for
 * the sculpture that was here first; anything else says its own.
 */
const DEFAULT_MODEL_ASPECT = 0.5892;

type StageProps = {
  /**
   * The relief's height map. Optional, because a stage carrying a baked model
   * has no height field to load and no plate to fall back to.
   */
  depthSrc?: string;
  mode: ReliefMode;
  /**
   * How far the relief has come apart on its way out of the chapter, 0 to 1.
   * Read per frame from a ref so scroll can drive it without re-rendering.
   */
  dissolveRef?: { current: number };
  /** Resting dispersal, 0 solid to 1 fully dispersed. */
  disperse?: number;
  /** Added to `disperse` while the pointer is over the stage. */
  hoverDisperse?: number;
  alt: string;
  className?: string;
  /**
   * A baked cloud to stand in for the height map as the resting form.
   *
   * Given this, the stage shows the model rather than the relief and every
   * behaviour written against the relief carries over unchanged.
   */
  restingSrc?: string;
  /** Bead size multiplier. Home wants a finer grain than the forest. */
  grain?: number;
  /** Initial vertical camera framing. Positive values reveal more of the form's top edge. */
  cameraY?: number;
  /** Optimized solid model used instead of the height-field representations. */
  modelSrc?: string;
  /** Repeat a lighter sample of the resting sculpture around the visible frame. */
  edgeParticles?: boolean;
  /** Scale applied when a free-standing model is contain-fitted in the viewport. */
  modelScale?: number;
  /** Stood width over height of the free-standing model, for that contain fit. */
  modelAspect?: number;
  /** Horizontal position of the contained subject, in scene units. */
  modelX?: number;
  /** Quiet wireframe and star atmosphere behind a free-standing particle model. */
  spatialBackdrop?: boolean;
  /**
   * Progress through the chapter the stage sits in, 0 to 1.
   *
   * Turns the form on its vertical axis and carries it down the page at a
   * fraction of the reader's own rate, so it lags the type it sits behind.
   */
  scrollRef?: { current: number };
  /** The sculpture the same particles morph into. */
  sculptureSrc?: string;
  /** 0 relief, 1 sculpture. Read per frame so scroll drives it without re-rendering. */
  morphRef?: { current: number };
  /** Projects orbiting the sculpture, if this stage is carrying the gallery. */
  projects?: Project[];
  orbitRef?: { current: number };
  language?: "en" | "id";
  onActive?: (index: number) => void;
};

/**
 * Whether this machine can draw at all — asked once, and answered once.
 *
 * Two things here are load-bearing, and neither is obvious.
 *
 * **The probe gives its context back.** Asking a throwaway canvas for a context
 * takes a real one from the browser's small global allowance, and letting it
 * fall out of scope does not return it: it stays live until garbage collection,
 * which may be many navigations away. Every mount of this stage ran this, so
 * every route change leaked one — measured at seven live contexts belonging to
 * canvases that had never been in the document, after three round trips — until
 * the page hit its ceiling and the browser began killing the contexts that were
 * actually drawing. That is what made sculptures disappear.
 *
 * **The answer is cached.** A machine's capability does not change between
 * navigations, so probing per mount was buying nothing at the price above.
 */
let webGLSupport: boolean | null = null;

function supportsWebGL() {
  if (webGLSupport !== null) return webGLSupport;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    webGLSupport = Boolean(gl);
    // Handed straight back. The probe needed a context for one expression; it
    // does not need to keep one for the life of the document.
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return webGLSupport;
  } catch {
    webGLSupport = false;
    return false;
  }
}

/** Cover-fit scale. Shared so the pointer can be mapped into relief space. */
function coverScale(viewportWidth: number, viewportHeight: number) {
  return Math.max(viewportWidth / RELIEF_ASPECT, viewportHeight);
}

function quality() {
  const compact = window.matchMedia("(max-width: 47.99rem)").matches || !pointerIsFine();
  // Generous, because the cloud is built in a worker and no longer costs the main
  // thread anything. Density is what makes the surface read as sculpture rather
  // than as scattered dust, and cover-fit spreads it over more area than the
  // frame itself.
  /*
   * `pointer` is on everywhere now.
   *
   * It used to be off on compact and coarse devices, which is what removed the
   * relief's whole response to touch: a finger passing over the sculpture did
   * nothing, because the capability flag that decided whether to listen was
   * really a flag about whether a *mouse* existed. What is expensive on a phone
   * is the particle count and the pixel ratio, not reading a pointer, so those
   * stay reduced and the interaction does not.
   */
  return compact
    ? { segments: 140, points: 55_000, dpr: [1, 1.25] as [number, number], pointer: true }
    : { segments: 260, points: 130_000, dpr: [1, 1.6] as [number, number], pointer: true };
}

function pointCloudSubset(cloud: PointCloud, limit: number): PointCloud {
  const count = Math.min(cloud.count, Math.max(1, Math.floor(limit)));
  if (count === cloud.count) return cloud;
  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  const stride = cloud.count / count;
  for (let i = 0; i < count; i += 1) {
    const source = Math.min(Math.floor(i * stride), cloud.count - 1);
    positions.set(cloud.positions.subarray(source * 3, source * 3 + 3), i * 3);
    normals.set(cloud.normals.subarray(source * 3, source * 3 + 3), i * 3);
  }
  return { count, positions, normals, extent: cloud.extent };
}

export function SpatialBackdrop({
  scrollRef,
  reduced,
  pointer,
  placement = "full",
  invertPointerY = false,
}: {
  scrollRef?: { current: number };
  reduced: boolean;
  pointer: { current: THREE.Vector2 };
  placement?: "frame" | "center" | "full";
  invertPointerY?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  const meshGeometry = useMemo(() => {
    const plane = new THREE.PlaneGeometry(1, 1, 52, 32);
    const position = plane.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i);
      const y = position.getY(i);
      position.setX(i, x + Math.sin(y * 19 + i * 0.31) * 0.006);
      position.setY(i, y + Math.cos(x * 17 + i * 0.23) * 0.007);
      position.setZ(i, Math.sin(x * 8.2 + y * 10.7) * 0.028);
    }
    position.needsUpdate = true;
    const wire = new THREE.WireframeGeometry(plane);
    plane.dispose();
    return wire;
  }, []);

  const starsGeometry = useMemo(() => {
    const count = 140;
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      const seed = (Math.sin((i + 1) * 91.731) * 43758.5453) % 1;
      const second = (Math.sin((i + 1) * 47.317) * 24634.6345) % 1;
      const third = (Math.sin((i + 1) * 17.173) * 13579.2468) % 1;
      positions[i * 3] = Math.abs(seed) - 0.5;
      positions[i * 3 + 1] = Math.abs(second) - 0.5;
      positions[i * 3 + 2] = Math.abs(third) * 0.16 + 0.03;
      seeds[i] = Math.abs((Math.sin((i + 1) * 12.9898) * 43758.5453) % 1);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    return geometry;
  }, []);

  const starUniforms = useMemo(
    () => ({ uTime: { value: 0 }, uDpr: { value: 1 } }),
    [],
  );
  const starMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: starUniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: `
          attribute float aSeed;
          uniform float uTime; uniform float uDpr;
          varying float vLight;
          void main(){
            vLight = 0.42 + 0.58 * sin(uTime * (0.32 + aSeed * 0.65) + aSeed * 25.0);
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = (0.65 + aSeed * 1.35) * uDpr;
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: `
          varying float vLight;
          void main(){
            float core = 1.0 - smoothstep(0.08, 0.5, length(gl_PointCoord - 0.5));
            if (core < 0.01) discard;
            gl_FragColor = vec4(vec3(0.9, 0.93, 0.96) * core * vLight, core * vLight * 0.62);
          }`,
      }),
    [starUniforms],
  );
  const wireUniforms = useMemo(
    () => ({
      uPointer: { value: new THREE.Vector2(4, 4) },
      uAspect: { value: 1 },
      uPlacement: { value: placement === "frame" ? 0 : placement === "center" ? 1 : 2 },
    }),
    [placement],
  );
  const wireMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: wireUniforms,
        transparent: true,
        depthWrite: false,
        vertexShader: `
          uniform vec2 uPointer; uniform float uAspect;
          varying vec2 vNdc; varying float vHover;
          void main(){
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vec4 clip = projectionMatrix * mv;
            vec2 ndc = clip.xy / max(clip.w, 0.0001);
            vec2 delta = vec2((ndc.x - uPointer.x) * uAspect, ndc.y - uPointer.y);
            float distanceToPointer = length(delta);
            vHover = exp(-distanceToPointer * distanceToPointer / 0.055);
            vec2 away = normalize(delta + vec2(0.0001));
            clip.xy += vec2(away.x / uAspect, away.y) * vHover * 0.028 * clip.w;
            vNdc = ndc;
            gl_Position = clip;
          }`,
        fragmentShader: `
          uniform float uPlacement;
          varying vec2 vNdc; varying float vHover;
          void main(){
            float radial = length(vec2(vNdc.x * 0.74, vNdc.y));
            // The field is continuous. Placement only attenuates it where a
            // foreground sculpture lives; it never cuts a hole around that
            // subject. Home keeps twenty percent through Love, while Work keeps
            // a faint remainder behind its peripheral planting and ground.
            float frameMask = mix(0.2, 1.0, smoothstep(0.5, 0.82, radial));
            float workOpening = (1.0 - smoothstep(0.38, 0.68, radial)) * smoothstep(-0.28, 0.12, vNdc.y);
            float centreMask = mix(0.18, 1.0, workOpening);
            float mask = uPlacement < 0.5 ? frameMask : (uPlacement < 1.5 ? centreMask : 1.0);
            float alpha = (0.021 + vHover * 0.046) * mask;
            if (alpha < 0.002) discard;
            gl_FragColor = vec4(vec3(0.72, 0.76, 0.8), alpha);
          }`,
      }),
    [wireUniforms],
  );

  useEffect(
    () => () => {
      meshGeometry.dispose();
      starsGeometry.dispose();
      starMaterial.dispose();
      wireMaterial.dispose();
    },
    [meshGeometry, starMaterial, starsGeometry, wireMaterial],
  );

  useFrame((state, delta) => {
    const step = Math.min(delta, 0.05);
    if (!reduced) starUniforms.uTime.value += step;
    starUniforms.uDpr.value = state.viewport.dpr;
    wireUniforms.uAspect.value = viewport.width / Math.max(viewport.height, 0.0001);
    if (reduced) {
      wireUniforms.uPointer.value.set(4, 4);
    } else {
      wireUniforms.uPointer.value.set(
        pointer.current.x,
        invertPointerY ? -pointer.current.y : pointer.current.y,
      );
    }
    const group = groupRef.current;
    if (!group) return;
    const through = reduced ? 0 : Math.min(Math.max(scrollRef?.current ?? 0, 0), 1);
    group.position.y += (through * 0.08 - group.position.y) * (1 - Math.pow(0.04, step));
    group.rotation.z += (through * -0.018 - group.rotation.z) * (1 - Math.pow(0.04, step));
  });

  return (
    <>
      <group
        ref={groupRef}
        position={[0, 0, -0.7]}
        scale={[viewport.width * 1.48, viewport.height * 1.48, 1]}
        renderOrder={-5}
      >
        <lineSegments geometry={meshGeometry} material={wireMaterial} />
        <points geometry={starsGeometry} material={starMaterial} />
      </group>
    </>
  );
}

/** Solid geometry rebuilt from the height map. Real vertices, real silhouette. */
function ReliefMesh({ field, segments, pointer, disperseRef }: {
  field: ReliefHeightField;
  segments: number;
  pointer: { current: THREE.Vector2 };
  disperseRef: { current: number };
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => buildReliefGeometry(field, segments, DEPTH), [field, segments]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const step = Math.min(delta, 0.05);
    // The relief turns fractionally toward the pointer, the way a lit plaque does
    // when you move in front of it. Never a free orbit.
    const targetY = pointer.current.x * 0.16;
    const targetX = -pointer.current.y * 0.1;
    mesh.rotation.y += (targetY - mesh.rotation.y) * (1 - Math.pow(0.02, step));
    mesh.rotation.x += (targetX - mesh.rotation.x) * (1 - Math.pow(0.02, step));
    const flat = 1 - disperseRef.current * 0.85;
    mesh.scale.z += (flat - mesh.scale.z) * (1 - Math.pow(0.05, step));
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial color="#d9d3c8" roughness={0.82} metalness={0} />
    </mesh>
  );
}

/** Flat plane displaced in the vertex shader. Cheapest, no CPU geometry build. */
function ReliefDisplacement({ depthTexture, segments, pointer, disperseRef }: {
  depthTexture: THREE.Texture;
  segments: number;
  pointer: { current: THREE.Vector2 };
  disperseRef: { current: number };
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(
    () => ({ uDepthMap: { value: depthTexture }, uDepth: { value: DEPTH }, uSettle: { value: 1 } }),
    [depthTexture],
  );

  const material = useMemo(() => {
    const created = new THREE.MeshStandardMaterial({ color: "#d9d3c8", roughness: 0.82, metalness: 0 });
    created.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", `#include <common>
          uniform sampler2D uDepthMap; uniform float uDepth; uniform float uSettle;
          float reliefAt(vec2 c){ return texture2D(uDepthMap, vec2(c.x, 1.0 - c.y)).r * uDepth * uSettle; }`)
        .replace("#include <beginnormal_vertex>", `#include <beginnormal_vertex>
          float e = 0.0026;
          float hC = reliefAt(uv), hX = reliefAt(uv + vec2(e,0.0)), hY = reliefAt(uv + vec2(0.0,e));
          objectNormal = normalize(cross(vec3(e*${RELIEF_ASPECT.toFixed(3)},0.0,hX-hC), vec3(0.0,e,hY-hC)));`)
        .replace("#include <begin_vertex>", `#include <begin_vertex>
          transformed.z += reliefAt(uv);`);
    };
    return created;
  }, [uniforms]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const step = Math.min(delta, 0.05);
    uniforms.uSettle.value += ((1 - disperseRef.current * 0.85) - uniforms.uSettle.value) * (1 - Math.pow(0.05, step));
    const targetY = pointer.current.x * 0.16;
    const targetX = -pointer.current.y * 0.1;
    mesh.rotation.y += (targetY - mesh.rotation.y) * (1 - Math.pow(0.02, step));
    mesh.rotation.x += (targetX - mesh.rotation.x) * (1 - Math.pow(0.02, step));
  });

  return (
    <mesh ref={meshRef} material={material}>
      <planeGeometry args={[RELIEF_ASPECT, 1, segments, Math.round(segments / RELIEF_ASPECT)]} />
    </mesh>
  );
}

/**
 * Particle representation. Points sit on the sculpted surface at rest, so the
 * silhouette survives, and morph out to a dispersed cloud without ever losing the
 * relief's shape. Morph is a single uniform lerping two baked position buffers,
 * so it stays smooth and reversible at any point.
 */
function ReliefParticles({ field, count, pointer, disperseRef, brushTargetRef, flashTriggerRef, idleRef, sculpture, morphRef, orbitRef, dissolveRef, resting, grain, scrollRef, edgeOnly = false, reduced = false }: {
  field: ReliefHeightField | null;
  count: number;
  pointer: { current: THREE.Vector2 };
  disperseRef: { current: number };
  brushTargetRef: { current: number };
  /** Increments when the pointer first enters the visible sculpture. */
  flashTriggerRef?: { current: number };
  /** Timestamp of the last pointer movement, in `performance.now()` terms. */
  idleRef: { current: number };
  /** The form the same points morph into. Null until it has loaded. */
  sculpture: PointCloud | null;
  /** 0 relief, 1 sculpture. */
  morphRef: { current: number };
  /** Progress through the orbit; drives the shared turn. */
  orbitRef?: { current: number };
  /** How far the relief has come apart on its way out, 0 to 1. */
  dissolveRef: { current: number };
  /** A baked cloud standing in for the height map, if one was given. */
  resting: PointCloud | null;
  /** Bead size multiplier. */
  grain: number;
  /** Progress through the chapter, driving the turn and the lag. */
  scrollRef?: { current: number };
  /** Keep the field around the projected viewport perimeter, clear of the subject. */
  edgeOnly?: boolean;
  /** Freeze ambient travel and colour sweeps while preserving the composition. */
  reduced?: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const [cloud, setCloud] = useState<ReliefPointCloud | null>(null);

  useEffect(() => {
    let dead = false;
    if (resting) {
      // A baked model stands in for the frieze. Sized to a little under the
      // frame it sits in, the same way the sculpture is.
      const sampled = pointCloudSubset(resting, count);
      setCloud(
        reliefFromCloud(sampled.positions, sampled.normals, sampled.count, sampled.extent.z, 0.98),
      );
      return () => {
        dead = true;
      };
    }
    if (sculpture && field) {
      // Matched to the sculpture, so the two forms are the same points in two
      // arrangements rather than two clouds that happen to look similar.
      const built = buildReliefPointsFixed(field, sculpture.count, DEPTH);
      if (!dead) setCloud(built);
      return () => {
        dead = true;
      };
    }
    if (!field) {
      setCloud(null);
      return () => {
        dead = true;
      };
    }
    void buildReliefPointsAsync(field, count, DEPTH).then((built) => {
      if (!dead) setCloud(built);
    });
    return () => {
      dead = true;
    };
  }, [field, count, sculpture, resting]);

  const geometry = useMemo(() => {
    if (!cloud) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(cloud.settled.slice(), 3));
    g.setAttribute("aSettled", new THREE.BufferAttribute(cloud.settled, 3));
    g.setAttribute("aScattered", new THREE.BufferAttribute(cloud.scattered, 3));
    g.setAttribute("aHeight", new THREE.BufferAttribute(cloud.heights, 1));
    // Present only for a baked model. The height map has no surface normal to
    // give, so the relief falls back to facing the viewer everywhere and keeps
    // the flat behaviour it always had.
    const surface = (cloud as { normals?: Float32Array }).normals;
    g.setAttribute(
      "aSurface",
      new THREE.BufferAttribute(surface ?? new Float32Array(cloud.count * 3).fill(0), 3),
    );
    g.setAttribute("aSolid", new THREE.BufferAttribute(new Float32Array(1).fill(surface ? 1 : 0), 1));
    if (sculpture && sculpture.count === cloud.count) {
      // Stood upright and scaled here rather than in the shader, so the shader
      // only ever interpolates between two ready positions.
      const form = new Float32Array(cloud.count * 3);
      // Sized against the cover-fit frame this cloud already sits inside. Fitting
      // it to the viewport directly made it twice the height of the screen,
      // because the surrounding group scales everything a second time.
      const fit = 0.78 / Math.max(sculpture.extent.z, 0.001);
      for (let i = 0; i < cloud.count; i += 1) {
        const x = sculpture.positions[i * 3];
        const y = sculpture.positions[i * 3 + 1];
        const z = sculpture.positions[i * 3 + 2];
        form[i * 3] = x * fit;
        form[i * 3 + 1] = z * fit;
        form[i * 3 + 2] = -y * fit;
      }
      g.setAttribute("aForm", new THREE.BufferAttribute(form, 3));
    } else {
      g.setAttribute("aForm", new THREE.BufferAttribute(cloud.settled, 3));
    }
    return g;
  }, [cloud, sculpture]);
  useEffect(() => () => geometry?.dispose(), [geometry]);

  const { viewport, camera } = useThree();
  const brushPoint = useRef(new THREE.Vector2(0, 0));
  const brushStrength = useRef(0);
  const flashAge = useRef(2);
  const lastFlash = useRef(flashTriggerRef?.current ?? 0);

  const uniforms = useMemo(
    () => ({
      uMorph: { value: 0 },
      uRain: { value: 0 },
      uTime: { value: 0 },
      uBrush: { value: new THREE.Vector2(0, 0) },
      uBrushStrength: { value: 0 },
      uBrushRadius: { value: 0.082 },
      uRay: { value: 0 },
      uAspect: { value: 1 },
      uProject: { value: 900 },
      uGrain: { value: 1 },
      uSolid: { value: 0 },
      uSolidFrag: { value: 0 },
      uTurn: { value: 0 },
      uDrift: { value: 0 },
      uSweep: { value: 2 },
      uSweepAmount: { value: 0 },
      // Bead diameter in world units, projected per frame the way the forest
      // sizes its pearls. A mid-relief particle then lands at the size one does
      // over there: the two chapters are meant to be the same air seen from two
      // places, and a field of finer, harder dust was what gave that away.
      uBead: { value: 0.0023 },
      uForm: { value: 0 },
      uSpin: { value: 0 },
      uEdgeOnly: { value: edgeOnly ? 1 : 0 },
      uPointerScreen: { value: new THREE.Vector2(0, 0) },
      uFlashAge: { value: 2 },
    }),
    [edgeOnly],
  );

  const material = useMemo(() => {
    const m = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: resting ? THREE.AdditiveBlending : THREE.NormalBlending,
      vertexShader: `
        attribute vec3 aSettled; attribute vec3 aScattered; attribute float aHeight;
        attribute vec3 aSurface;
        attribute vec3 aForm;
        uniform float uMorph; uniform float uTime; uniform float uRain;
        uniform vec2 uBrush; uniform vec2 uPointerScreen; uniform float uBrushStrength; uniform float uBrushRadius; uniform float uFlashAge;
        uniform float uRay; uniform float uAspect; uniform float uForm; uniform float uSpin;
        uniform float uProject; uniform float uGrain; uniform float uSolid; uniform float uEdgeOnly;
        uniform float uTurn; uniform float uDrift; uniform float uSweep; uniform float uSweepAmount; uniform float uBead;
        varying float vH; varying float vE; varying float vHue; varying float vRay; varying float vForm; varying float vRain;
        varying float vDepth; varying float vSpark; varying float vColour; varying float vRim; varying float vFrameEdge;
        varying float vFront; varying float vSurfaceLight; varying float vContour; varying float vFeather; varying float vFlash;
        void main(){
          vH = aHeight;
          // Dispersal is not a global switch. Each particle takes the strongest
          // influence from any recent brush mark, so only the worked area loosens
          // and the marks behind the pointer fade out in their own time.
          vec2 bd = aSettled.xy - uBrush;
          float brush = exp(-dot(bd, bd) / (2.0 * uBrushRadius * uBrushRadius)) * uBrushStrength;
          if (uEdgeOnly > 0.5) brush = 0.0;
          float morph = clamp(uMorph + brush, 0.0, 1.0);
          // Stagger by height so the surface loosens from its shallows upward
          // rather than every particle leaving at once.
          float lead = clamp((morph - aHeight * 0.35) / 0.65, 0.0, 1.0);
          float e = lead * lead * (3.0 - 2.0 * lead);
          vE = e;
          // Hashed per particle, not ramped across space. A slowly varying seed
          // gave every patch a single hue — the brushed area came out as a block of
          // green — where refracted light should show the whole spectrum at once in
          // any small area of it.
          vHue = fract(sin(dot(aSettled.xy, vec2(91.73, 47.31))) * 43758.5453 + aHeight * 0.61);
          vec3 p = mix(aSettled, aScattered, e);
          p.z += sin(uTime * 0.6 + aHeight * 22.0) * 0.004 * e;
          // Pushed out of the surface as well as loosened along it, so the hand
          // reads as parting the form rather than only brightening it.
          p += aSurface * brush * 0.055;

          // Leaving. The relief does not fade at the chapter boundary: it comes
          // apart and falls, so the reader arrives in the forest under the last of
          // it rather than after a cut.
          //
          // Each particle is given its own start and its own weight, so the surface
          // lets go raggedly from the top down. Acceleration rather than a linear
          // slide, because falling is what this is: the distance travelled goes
          // with the square of the time.
          vRain = 0.0;
          if (uRain > 0.0001) {
            float seed = fract(sin(dot(aSettled.xy, vec2(19.7, 71.3))) * 9137.13);
            float begin = seed * 0.35 + (1.0 - aHeight) * 0.2;
            float fall = clamp((uRain - begin) / (1.0 - begin), 0.0, 1.0);
            vRain = fall;
            float weight = 0.55 + seed * 0.9;
            p.y -= fall * fall * 2.6 * weight;
            // Blown sideways as it goes, so it scatters rather than dropping in a
            // column.
            p.x += sin(seed * 43.0) * fall * 0.55;
            p.z += cos(seed * 27.0) * fall * 0.4;
          }

          // The crossing. The relief does not fade out and a sculpture fade in:
          // every point travels from where it sat on the frieze to where it sits
          // on the form, so there is one cloud throughout and never a moment of
          // noise between the two.
          vForm = uForm;
          if (uForm > 0.0001) {
            // Staggered by height so the form gathers from its base upward.
            float lead = clamp((uForm * 1.35 - aHeight * 0.35), 0.0, 1.0);
            float f = lead * lead * (3.0 - 2.0 * lead);
            vec3 spun = aForm;
            float c = cos(uSpin), s2 = sin(uSpin);
            spun = vec3(spun.x * c + spun.z * s2, spun.y, -spun.x * s2 + spun.z * c);
            p = mix(p, spun, f);
          }

          // Turned on its own vertical axis and carried down the page, both driven
          // by how far the reader has come through the chapter.
          vec3 surface = aSurface;
          if (uSolid > 0.5) {
            float c = cos(uTurn), sn = sin(uTurn);
            p = vec3(p.x * c + p.z * sn, p.y, -p.x * sn + p.z * c);
            surface = vec3(surface.x * c + surface.z * sn, surface.y, -surface.x * sn + surface.z * c);
            p.y += uDrift;
          } else if (uEdgeOnly > 0.5) {
            // The perimeter air trails the solid subject at several shallow
            // rates. This produces depth during scroll without dragging a flat
            // border in lockstep with the page.
            float layer = 0.16 + fract(aHeight * 43.17 + aSettled.x * 17.3) * 0.14;
            p.y += uDrift * layer;
          }

          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vFront = 1.0;
          vSurfaceLight = 1.0;
          vContour = 0.0;
          vFeather = 0.0;
          if (uSolid > 0.5) {
            // Camera-relative depth, recalculated after the scroll turn. Back
            // particles begin small and translucent, then gain scale and light
            // only as that surface rotates toward the visitor.
            vFront = smoothstep(-0.14, 0.22, p.z);
          }

          // Solid in the middle, dispersed at the rim.
          //
          // A point whose normal faces the viewer sits on the surface turned
          // toward us; one whose normal is square to the view sits on the
          // silhouette. Drawing the first large and opaque fills the form in, and
          // pushing only the second outward feathers the edge — so the sculpture
          // reads as a body that frays where it turns away, rather than as a cloud
          // throughout. Because it is measured against the camera, the fraying
          // travels around the form as it turns.
          vRim = 0.0;
          if (uSolid > 0.5) {
            vec3 n = normalize(mat3(modelViewMatrix) * surface);
            vRim = 1.0 - clamp(abs(n.z), 0.0, 1.0);
            float key = max(dot(n, normalize(vec3(-0.48, 0.7, 0.53))), 0.0);
            float fill = max(dot(n, normalize(vec3(0.66, -0.08, 0.42))), 0.0);
            vSurfaceLight = 0.14 + pow(key, 0.68) * 1.08 + pow(fill, 0.9) * 0.3;
            // Stable contour particles sit where the surface turns away from the
            // camera or crosses the key light at a grazing angle. The former
            // describes the silhouette; the latter catches folds and creases
            // inside it without needing a second mesh or a screen-space filter.
            float silhouetteContour = smoothstep(0.84, 0.975, vRim);
            float foldContour = 1.0 - smoothstep(
              0.028,
              0.105,
              abs(dot(n, normalize(vec3(-0.48, 0.7, 0.53))))
            );
            vContour = max(silhouetteContour, foldContour * 0.76) * (1.0 - uEdgeOnly);
            float feather = smoothstep(0.55, 1.0, vRim);
            // Feather and outline are mutually exclusive. The outline stays on
            // the source surface; only the surrounding particles are allowed to
            // loosen, shrink and fade with depth.
            vFeather = feather * (1.0 - vContour);
            float wander = fract(sin(aHeight * 731.7 + aSettled.x * 41.3) * 4137.13);
            float edgePhase = uTime * (0.26 + wander * 0.22) + wander * 6.28318 + aHeight * 4.7;
            float edgeBreath = 0.5 + 0.5 * sin(edgePhase);
            vec3 outward = normalize(vec3(n.xy, 0.35));
            vec3 tangent = normalize(vec3(-n.y, n.x, 0.18));
            mv.xyz += outward * vFeather * (0.003 + wander * 0.012 + edgeBreath * 0.021);
            mv.xyz += tangent * vFeather * sin(edgePhase * 0.73) * 0.008;
          }
          // How far back this particle sits, which is the only thing the air
          // needs to know. Without it the fragment shader's fog term was reading
          // an unwritten varying — always zero, always perfectly clear — and the
          // relief hung in front of flat black instead of standing in weather.
          // Where this particle sits relative to the falling band. Measured on
          // the resting position rather than the displaced one, so a patch lifted
          // by the pointer does not carry its colour along with it.
          float band = aSettled.y - uSweep;
          vColour = exp(-band * band / 0.0032) * uSweepAmount;

          vDepth = -mv.z;
          // One particle in forty carries the light, at the same rate and by the
          // same hash the forest uses. The fragment shader already knew how to
          // draw these; nothing was ever telling it which ones they were.
          vSpark = step(0.975, fract(fract(sin(dot(aSettled.xy, vec2(12.9898, 78.233))) * 43758.5453) * 7.31));
          // Perspective-correct, like the forest's beads: a bead of known world
          // size, projected. Deeper particles are smaller as well as fainter,
          // which is what stops the field reading as flat noise — near and far
          // differ in two ways rather than one.
          //
          // The spark is added to the height weighting rather than multiplied
          // through it. Multiplied, the raised surface got both the larger bead
          // and the larger spark and they gathered into clumps of white on the
          // brow and the knee; added, a spark is the same size wherever it falls,
          // so they sit in the shadows too and read as air rather than as
          // highlights on the form.
          gl_PointSize = uBead * uProject
            * (mix(0.5 + aHeight * 1.5, 2.6, uForm) + vSpark * 1.5)
            * (1.0 - e * 0.12)
            * uGrain
            * mix(mix(0.3, 1.0, vFront), 0.84, vContour)
            * mix(1.0, 0.76, vFeather)
            / max(-mv.z, 0.001);
          vec4 clip = projectionMatrix * mv;

          // The beam, in the scene rather than in front of it. Distance is measured
          // perpendicular to the shaft in normalised device space, corrected for
          // aspect so the beam is not stretched with the viewport, and the particle
          // is lit by how near it falls to that line. This is what makes the light
          // read as passing through the cloud: particles beside the shaft stay dark.
          vec2 ndc = clip.xy / max(clip.w, 0.0001);
          if (uEdgeOnly > 0.5) {
            // Every point is sampled from love.stl. Recompose those samples along
            // the visitor's rectangular frame rather than revealing a duplicate
            // particle silhouette around the solid sculpture. Coordinates from
            // the source model still order the fragments along each side.
            float seed = fract(sin(dot(aSettled.xy + aSettled.z, vec2(73.17, 19.41))) * 43758.5453);
            float second = fract(seed * 17.31 + aHeight * 3.71);
            float along = fract(second * 19.37 + aSettled.z * 37.1 + aSettled.x * 11.9) * 2.0 - 1.0;
            float inset = mix(0.84, 1.08, second);
            float sourceX = clamp(aSettled.x / 0.28, -1.0, 1.0);
            float sourceY = clamp(aSettled.y / 0.46, -1.0, 1.0);
            float horizontal = mix(sourceX, along, 0.68);
            float vertical = mix(sourceY, along, 0.68);
            if (seed < 0.25) {
              ndc = vec2(-inset, vertical);
            } else if (seed < 0.5) {
              ndc = vec2(inset, vertical);
            } else if (seed < 0.75) {
              ndc = vec2(horizontal, -inset);
            } else {
              ndc = vec2(horizontal, inset);
            }

            // The feather field never settles into a decorative border. Each
            // source point drifts on its own slow phase, with no shared pulse.
            float breeze = sin(uTime * (0.14 + second * 0.12) + seed * 31.0);
            float crosswind = cos(uTime * (0.11 + seed * 0.09) + second * 23.0);
            ndc += vec2(breeze, crosswind) * vec2(0.012, 0.009);

            // The old brush now works in the same two-dimensional space the
            // visitor sees. A nearby cluster refracts and loosens while the
            // centre, and therefore the solid sculpture, remains untouched.
            vec2 fromPointer = ndc - uPointerScreen;
            float screenBrush = exp(-dot(fromPointer, fromPointer) / 0.0045) * uBrushStrength;
            vec2 away = normalize(fromPointer + vec2(0.0001));
            vec2 tangent = vec2(-away.y, away.x);
            ndc += away * screenBrush * (0.025 + second * 0.055);
            ndc += tangent * screenBrush * (seed - 0.5) * 0.05;
            ndc.y += uDrift * (0.035 + second * 0.035);
            vE = max(vE, screenBrush);
            clip.xy = ndc * clip.w;
          }
          float flashRadius = uFlashAge * 1.16;
          float flashEnvelope = 1.0 - smoothstep(0.62, 1.04, uFlashAge);
          float flashDistance = distance(ndc, uPointerScreen);
          vFlash = exp(-pow((flashDistance - flashRadius) / 0.055, 2.0)) * flashEnvelope * (1.0 - uEdgeOnly);
          gl_Position = clip;
          // When a solid sculpture occupies the middle, the old responsive field
          // becomes atmosphere at the edges of the visitor's frame. This is
          // measured after projection, so it follows the visible rectangle on
          // every aspect ratio instead of fraying the object's own silhouette.
          float edgeX = smoothstep(0.62, 0.96, abs(ndc.x));
          float edgeY = smoothstep(0.66, 0.98, abs(ndc.y));
          vFrameEdge = mix(1.0, max(edgeX, edgeY), uEdgeOnly);
          vec2 rel = vec2((ndc.x - ${RAY_ORIGIN[0].toFixed(3)}) * uAspect, ndc.y - ${RAY_ORIGIN[1].toFixed(3)});
          vec2 dir = normalize(vec2(${RAY_DIRECTION[0].toFixed(3)} * uAspect, ${RAY_DIRECTION[1].toFixed(3)}));
          float along = dot(rel, dir);
          float across = abs(rel.x * dir.y - rel.y * dir.x);
          // Wide and soft, at the forest's width: a shaft has no sides. It was
          // narrow here because a drawn overlay used to sit on top supplying the
          // hard edge. With that gone the light has to be the whole of the effect,
          // and a tight core reads as a stripe painted across the corner.
          float beam = exp(-across * across / 0.2);
          // Nearer particles catch more of the light than the ones behind them.
          // Lit evenly, the whole shaft came out at one brightness and the field
          // read as a flat cut-out; this difference is the depth in it.
          float near = 1.0 - smoothstep(0.6, 2.6, -mv.z);
          // Fades with distance travelled, so the shaft thins out as it crosses.
          float reach = 1.0 - smoothstep(0.4, 2.6, along);
          vRay = beam * reach * step(0.0, along) * (0.18 + near * 1.5) * uRay;
        }`,
      fragmentShader: `
        varying float vH; varying float vE; varying float vHue; varying float vRay; varying float vForm; varying float vRain;
        varying float vDepth; varying float vSpark; varying float vColour; varying float vRim; varying float vFrameEdge;
        varying float vFront; varying float vSurfaceLight; varying float vContour; varying float vFeather; varying float vFlash;
        uniform float uSolidFrag; uniform float uEdgeOnly;

        // Air. The same falloff the forest uses, toward the same ground colour.
        vec3 breathe(vec3 colour, float depth, out float veil) {
          float density = 0.34;
          float clarity = exp(-density * density * depth * depth);
          veil = clarity;
          return mix(vec3(0.018, 0.021, 0.023), colour, clarity);
        }

        /*
         * The site's one spectrum, shared with the liquid lens.
         *
         * This is the sculpture's own answer to the hand, and since the lens now
         * stands down over the form rather than inverting it, this dispersal is
         * the whole of the response. It has to be the same light the fringe is
         * made of, or crossing from the type onto the sculpture would look like
         * crossing between two different effects.
         */
        ${SPECTRUM_CHUNK}
        vec3 spectrum(float t){
          return houseAdelSpectrum(fract(t));
        }
        void main(){
          vec2 d = gl_PointCoord - 0.5;
          // GLSL leaves smoothstep undefined when edge0 > edge1; most drivers
          // return 0, which discards every fragment. Keep the edges ordered.
          float a = 1.0 - smoothstep(0.12, 0.5, length(d));
          if (a < 0.01) discard;

          // Each point is shaded as a little sphere rather than a flat disc: the
          // sprite's own coordinate gives a surface normal, so the particle takes
          // a highlight and a shaded side and the cloud reads as volume instead of
          // as a field of dots.
          float r2 = dot(d * 2.0, d * 2.0);
          vec3 bump = vec3(d * 2.0, sqrt(max(1.0 - r2, 0.0)));
          float lambert = clamp(dot(normalize(bump), normalize(vec3(-0.45, 0.6, 0.65))), 0.0, 1.0);
          float volumetric = max(vForm, uSolidFrag);
          float shade = mix(1.0, 0.28 + lambert * 0.95, volumetric);
          // Contrast is carried by height, hard.
          //
          // Evenly lit, the field read as noise: every particle arrived at roughly
          // the same brightness, so nothing described a form. The curve below
          // crushes the low relief almost to the ground colour and lets only the
          // raised surface come up bright, and alpha follows the same curve, so the
          // background of the relief recedes instead of sitting on top as speckle.
          float depth = vH * vH * (3.0 - 2.0 * vH);
          vec3 stone = mix(vec3(0.10,0.098,0.094), vec3(0.98,0.97,0.94), depth);
          vec3 tint = mix(vec3(1.0), spectrum(vHue + vE * 0.22), 0.96);
          vec3 refracted = tint * (0.85 + vH * 0.75);
          // Colour only arrives with dispersal, so the settled relief stays stone.
          vec3 lit = mix(stone, refracted, clamp(vE * 1.7, 0.0, 1.0));
          // Warm, and warmer where it is weaker, matching the shafts overhead.
          vec3 warm = mix(vec3(1.0, 0.72, 0.42), vec3(1.0, 0.97, 0.9), vRay);
          lit += warm * vRay * (0.28 + vH * 0.42);


          // Sculpture two is lit as stone rather than as embers: cooler, brighter,
          // and more opaque, so a form this large still reads against black.
          vec3 marble = mix(vec3(0.82, 0.84, 0.87), vec3(1.12, 1.09, 1.04), depth);
          float marbleHold = max(vForm, uSolidFrag * 0.9) * (1.0 - clamp(vE * 0.78, 0.0, 0.72));
          lit = mix(lit, marble, marbleHold);
          float facingLift = pow(vFront, 1.38);
          lit *= mix(0.62, 1.48, clamp(vSurfaceLight, 0.0, 1.25)) * mix(0.22, 1.72, facingLift);
          // A restrained bloom belongs to the near-facing marble only. It lifts
          // the readable planes without enlarging the particles or flattening
          // the quieter particles behind the form.
          float sculptureGlow = pow(vFront, 1.55) * (0.07 + vSurfaceLight * 0.13) * uSolidFrag;
          lit += vec3(0.76, 0.84, 0.92) * sculptureGlow;
          vec3 contourStone = vec3(0.9, 0.93, 0.96) * (0.82 + min(vSurfaceLight, 1.2) * 0.22);
          lit = mix(lit, contourStone, vContour * uSolidFrag * 0.74);
          lit *= mix(1.0, 0.7, vFeather * uSolidFrag);
          float body = mix(0.14 + depth * 0.86, 0.72 + depth * 0.28, volumetric);
          // Thins as it falls, so the last of it is gone by the time the forest
          // has the frame to itself.
          // The fall of colour. Full spectrum at the centre of the band, stone
          // again a few millimetres either side of it.
          if (vColour > 0.001) {
            vec3 flare = spectrum(vHue + vH * 0.35);
            // Matched to what it replaces, so only the hue changes.
            flare *= (dot(lit, vec3(0.299, 0.587, 0.114)) + 0.06) / 0.5;
            lit = mix(lit, flare, clamp(vColour, 0.0, 1.0) * 0.62);
          }

          vec3 hoverRipple = spectrum(vHue + vH * 0.28 + vFlash * 0.16);
          lit = mix(lit, hoverRipple * 1.85, vFlash);
          lit += vFlash * 0.7;

          if (vSpark > 0.5) {
            float sr = length(gl_PointCoord - 0.5) * 2.0;
            lit += vec3(1.0, 0.97, 0.92) * pow(1.0 - clamp(sr, 0.0, 1.0), 2.2) * 1.0;
          }

          float veil;
          lit = breathe(lit, vDepth, veil);
          // Dense where the form faces us, thinning out into the fray.
          float solidity = mix(1.0, 1.18 - vRim * 0.56, uSolidFrag);
          solidity = mix(solidity, 1.06, vContour * uSolidFrag);
          float fieldOpacity = mix(1.0, 0.14, uEdgeOnly);
          float depthOpacity = mix(0.055, 1.0, facingLift);
          depthOpacity = mix(depthOpacity, max(depthOpacity, 0.86), vContour * uSolidFrag);
          float featherOpacity = mix(1.0, 0.42, vFeather * uSolidFrag);
          float alpha = (a * body * (1.0 - vE * 0.12) + vRay * 0.35) * (1.0 - vRain) * (0.42 + veil * 0.58) * solidity * vFrameEdge * fieldOpacity * depthOpacity * featherOpacity;
          alpha = max(alpha, a * vFlash * 0.94 * (1.0 - vRain));
          if (alpha < 0.004) discard;
          gl_FragColor = vec4(lit * shade, min(alpha, 1.0));
        }`,
    });
    return m;
  }, [resting, uniforms]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame((state, delta) => {
    const step = Math.min(delta, 0.05);
    if (!reduced) uniforms.uTime.value += step;
    uniforms.uMorph.value += (disperseRef.current - uniforms.uMorph.value) * (1 - Math.pow(0.04, step));
    uniforms.uAspect.value = viewport.width / Math.max(viewport.height, 0.0001);
    uniforms.uGrain.value = grain;
    const solid = resting ? 1 : 0;
    uniforms.uSolid.value = solid;
    uniforms.uSolidFrag.value = solid;
    if (scrollRef && !reduced) {
      const through = Math.min(Math.max(scrollRef.current, 0), 1);
      // The type traverses the chapter while the object turns only slowly behind
      // it. That difference in rate is the parallax, rather than a second scroll
      // animation competing with the page.
      uniforms.uTurn.value += (through * Math.PI * 0.68 - uniforms.uTurn.value) * (1 - Math.pow(0.035, step));
      uniforms.uDrift.value += (through * 0.18 - uniforms.uDrift.value) * (1 - Math.pow(0.035, step));
    }
    uniforms.uProject.value =
      (state.size.height * state.viewport.dpr) /
      (2 * Math.tan(((state.camera as THREE.PerspectiveCamera).fov * Math.PI) / 360));
    uniforms.uRay.value = rayIntensity(performance.now()) * (1 - morphRef.current);
    uniforms.uForm.value += (morphRef.current - uniforms.uForm.value) * (1 - Math.pow(0.03, step));
    // Scrubbed rather than eased: the fall belongs to the scroll, and reversing
    // the scroll should carry it back up.
    uniforms.uRain.value = dissolveRef.current;
    // Turned by the reader, not by the clock, and by exactly the angle the cards
    // travel: sculpture and plates are one rig, so nothing drifts out of step with
    // anything else no matter how fast or slow the page is scrolled.
    uniforms.uSpin.value = (orbitRef?.current ?? 0) * TURNS * Math.PI * 2;

    // The descent. Weighted by how far the crossing has gone, so Home's framing is
    // untouched and the camera only starts moving once there is a sculpture to
    // move down.
    if (orbitRef) {
      const descent = panFor(orbitRef.current) * uniforms.uForm.value;
      camera.position.y += (descent - camera.position.y) * (1 - Math.pow(0.02, step));
    }

    // Left alone, colour falls through the relief. Nothing moves: the surface
    // holds still and a band of spectrum travels down it, then rests, then falls
    // again. The pointer stops it the instant it moves, so the two never overlap.
    const idleFor = (performance.now() - idleRef.current) / 1000 - IDLE_AFTER;
    if (!reduced && idleFor > 0) {
      // One cycle is a fall plus a rest; the phase within it gives both the
      // band's height and whether it is showing at all.
      const cycle = SWEEP_SECONDS + SWEEP_REST;
      const phase = idleFor % cycle;
      if (phase < SWEEP_SECONDS) {
        const travel = phase / SWEEP_SECONDS;
        // Starts above the relief and finishes below it, so the band enters and
        // leaves rather than appearing and vanishing mid-surface.
        uniforms.uSweep.value = 0.75 - travel * 1.5;
        // Eased in and out across the fall, so it arrives and departs softly.
        uniforms.uSweepAmount.value = Math.sin(travel * Math.PI) * 0.8;
      } else {
        uniforms.uSweepAmount.value = 0;
      }
    } else {
      uniforms.uSweepAmount.value +=
        (0 - uniforms.uSweepAmount.value) * (1 - Math.pow(0.02, step));
    }

    const scale = coverScale(viewport.width, viewport.height);
    // Map the pointer from normalised screen space onto the relief's own plane,
    // undoing the cover-fit scale so the brush lands where the cursor visually is.
    brushPoint.current.set(
      (pointer.current.x * viewport.width * 0.5) / scale,
      (-pointer.current.y * viewport.height * 0.5) / scale,
    );

    uniforms.uBrush.value.copy(brushPoint.current);
    uniforms.uPointerScreen.value.set(pointer.current.x, -pointer.current.y);
    const target = brushTargetRef.current;
    brushStrength.current += (target - brushStrength.current) * (1 - Math.pow(0.02, step));
    uniforms.uBrushStrength.value = brushStrength.current;
    if (flashTriggerRef && flashTriggerRef.current !== lastFlash.current) {
      lastFlash.current = flashTriggerRef.current;
      flashAge.current = 0;
    }
    if (flashAge.current < 1.1) flashAge.current += step * 1.28;
    uniforms.uFlashAge.value = flashAge.current;
  });

  if (!geometry) return null;
  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

function Frame({
  children,
  containAspect,
  containScale = 0.88,
  horizontalOffset = 0,
  verticalOffset = 0,
}: {
  children: React.ReactNode;
  containAspect?: number;
  containScale?: number;
  horizontalOffset?: number;
  /** Move a contained subject down without disturbing viewport-bound atmosphere. */
  verticalOffset?: number;
}) {
  const { viewport } = useThree();
  // Cover-fit: the relief bleeds past whichever edge it has to so the frame is
  // filled corner to corner. Contain-fit left the frieze floating in dead space.
  // The overscale absorbs the outward drift of dispersed particles, which would
  // otherwise thin out and reveal an edge.
  const scale = containAspect
    ? Math.min(viewport.width / containAspect, viewport.height) * containScale
    : Math.max(viewport.width / RELIEF_ASPECT, viewport.height);
  return <group position={[horizontalOffset, -verticalOffset, 0]} scale={[scale, scale, scale]}>{children}</group>;
}

function SolidModel({
  src,
  pointer,
  scrollRef,
  reduced,
}: {
  src: string;
  pointer: { current: THREE.Vector2 };
  scrollRef?: { current: number };
  reduced: boolean;
}) {
  const rigRef = useRef<THREE.Group>(null);
  const gltf = useLoader(GLTFLoader, src);
  const object = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#d9d3c8", roughness: 0.76, metalness: 0, side: THREE.DoubleSide }),
    [],
  );

  useEffect(() => {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.computeVertexNormals();
        child.material = material;
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });
    return () => material.dispose();
  }, [material, object]);

  useFrame((_, delta) => {
    const rig = rigRef.current;
    if (!rig || reduced) return;
    const step = Math.min(delta, 0.05);
    const through = Math.min(Math.max(scrollRef?.current ?? 0, 0), 1);
    const targetY = through * Math.PI * 1.15 + pointer.current.x * 0.08;
    const targetX = -pointer.current.y * 0.025;
    const targetLift = -through * 0.1;
    const targetDepth = -through * 0.06;
    rig.rotation.y += (targetY - rig.rotation.y) * (1 - Math.pow(0.02, step));
    rig.rotation.x += (targetX - rig.rotation.x) * (1 - Math.pow(0.02, step));
    rig.position.y += (targetLift - rig.position.y) * (1 - Math.pow(0.035, step));
    rig.position.z += (targetDepth - rig.position.z) * (1 - Math.pow(0.035, step));
  });

  return (
    <group ref={rigRef}>
      <primitive object={object} />
    </group>
  );
}

export function ReliefStage({
  depthSrc,
  mode,
  disperse = 0.3,
  hoverDisperse = 0.5,
  dissolveRef,
  restingSrc,
  grain = 1,
  cameraY = 0,
  modelSrc,
  edgeParticles = false,
  modelScale = 0.88,
  modelAspect = DEFAULT_MODEL_ASPECT,
  modelX = 0,
  spatialBackdrop = false,
  scrollRef,
  sculptureSrc,
  morphRef,
  projects,
  orbitRef,
  onActive,
  language = "en",
  alt,
  className,
}: StageProps) {
  const [field, setField] = useState<ReliefHeightField | null>(null);
  const [failed, setFailed] = useState(false);
  /*
   * Whether the stage should be animating — not whether it should exist.
   *
   * It starts true. A stage that is mounted is a stage the page has put on
   * screen, and beginning at false meant the very first thing every canvas did
   * was hold still and wait to be told otherwise.
   */
  const [visible, setVisible] = useState(true);
  const [contextLost, setContextLost] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);
  const pointer = useRef(new THREE.Vector2(4, 4));
  const disperseRef = useRef(disperse);
  const reduced = motionIsReduced();
  const graphicsDisabled = graphicsAreDisabled();
  const q = useMemo(quality, []);

  // Resting dispersal stays global; hover only raises the local brush strength.
  const brushTargetRef = useRef(0);
  const flashTriggerRef = useRef(0);
  const sculptureHoveredRef = useRef(false);
  const idleRef = useRef(performance.now());
  const ownDissolve = useRef(0);
  const dissolve = dissolveRef ?? ownDissolve;
  const ownMorph = useRef(0);
  const morph = morphRef ?? ownMorph;
  const [sculpture, setSculpture] = useState<PointCloud | null>(null);
  const [resting, setResting] = useState<PointCloud | null>(null);

  /*
   * The sculpture's own outline, measured once from the cloud.
   *
   * Held in a ref as well as computed, so the hover test and the lens reader can
   * read the newest one without either of them re-subscribing every time a cloud
   * finishes loading.
   */
  const silhouette = useMemo(() => (resting ? silhouetteProfile(resting) : null), [resting]);
  const silhouetteRef = useRef<Float32Array | null>(null);
  silhouetteRef.current = silhouette;

  useEffect(() => {
    if (!restingSrc) return;
    let dead = false;
    void loadPointCloud(restingSrc)
      .then((loaded) => {
        if (!dead) setResting(loaded);
      })
      .catch(() => {
        if (!dead && !modelSrc) setFailed(true);
      });
    return () => {
      dead = true;
    };
  }, [modelSrc, restingSrc]);

  useEffect(() => {
    if (!sculptureSrc) return;
    let dead = false;
    void loadPointCloud(sculptureSrc)
      .then((loaded) => {
        if (!dead) setSculpture(loaded);
      })
      .catch(() => undefined);
    return () => {
      dead = true;
    };
  }, [sculptureSrc]);

  useEffect(() => {
    disperseRef.current = disperse;
  }, [disperse]);

  useEffect(() => {
    if (reduced || !q.pointer) return;
    const host = hostRef.current;
    if (!host) return;
    // Hit-tested against the stage box rather than the canvas element, so anything
    // layered over the relief — headlines, the scroll cue — still brushes it.
    //
    // Reads the shared pointer, so a finger sliding down the page brushes the
    // sculpture on its way past exactly as a cursor does, and lifting the finger
    // lets the brush fall away with the signal's presence rather than leaving
    // the relief permanently disturbed at the last place it was touched.
    return onPointerActivity(() => {
      const pointer = pointerSignal();
      const box = host.getBoundingClientRect();
      const inside =
        pointer.presence > 0.01 &&
        pointer.clientX >= box.left &&
        pointer.clientX <= box.right &&
        pointer.clientY >= box.top &&
        pointer.clientY <= box.bottom;
      brushTargetRef.current = inside ? hoverDisperse * pointer.presence : 0;
      const screenX = ((pointer.clientX - box.left) / Math.max(box.width, 1)) * 2 - 1;
      const screenY = ((pointer.clientY - box.top) / Math.max(box.height, 1)) * 2 - 1;
      const objectX = screenX - modelX * 0.9;
      const objectY = screenY + cameraY * 0.42;
      /*
       * On the sculpture, not merely near it.
       *
       * `objectY` runs down the screen and the profile is measured from the
       * model's feet upward, so it is flipped here. Half a unit of coverage is
       * the form's own edge: past the soft rim, inside the shape.
       */
      const overSculpture =
        Boolean(restingSrc) &&
        inside &&
        coverageAt(objectX / MODEL_HALF_WIDTH, -objectY / MODEL_HALF_HEIGHT, silhouetteRef.current) >
          0.5;
      if (overSculpture && !sculptureHoveredRef.current) flashTriggerRef.current += 1;
      sculptureHoveredRef.current = overSculpture;
    });
  }, [cameraY, hoverDisperse, modelX, q.pointer, reduced, restingSrc]);

  useEffect(() => {
    if (!supportsWebGL()) { setFailed(true); return; }
    if (restingSrc || modelSrc) return;
    if (!depthSrc) { setFailed(true); return; }
    let dead = false;
    void loadHeightField(depthSrc)
      .then((f) => { if (!dead) setField(f); })
      .catch(() => { if (!dead) setFailed(true); });
    return () => { dead = true; };
  }, [depthSrc, modelSrc, restingSrc]);

  const depthTexture = useMemo(() => {
    if (mode !== "displacement" || !depthSrc) return null;
    const t = new THREE.TextureLoader().load(depthSrc);
    t.colorSpace = THREE.NoColorSpace;
    return t;
  }, [depthSrc, mode]);
  useEffect(() => () => depthTexture?.dispose(), [depthTexture]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    // The two pause conditions are tracked separately and combined. Folding them
    // into a single setState let whichever event fired last overwrite the other,
    // which parked frameloop on "never" and left the canvas permanently blank.
    let onScreen = true;
    let tabVisible = !document.hidden;
    const apply = () => setVisible(onScreen && tabVisible);

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting && entry.intersectionRatio > 0.001;
        apply();
      },
      { rootMargin: "0px" },
    );
    io.observe(host);

    /*
     * A direct measurement, for the moments an observer cannot be trusted.
     *
     * A route transition mounts this stage inside a fixed, clipped layer and
     * then returns it to normal flow when the movement ends. Across that change
     * the observer's answer can be stale — it was taken while the host was
     * inside a container clipped to nothing — and nothing afterwards
     * necessarily disturbs the geometry enough to make it speak again. The stage
     * then sits at `visible: false` on a page the reader is looking at, which is
     * a sculpture that has silently failed to appear.
     *
     * So the box is measured directly on the frames the transition is already
     * producing, and once on mount. Cheap, and it cannot go stale.
     */
    const measure = () => {
      const rect = host.getBoundingClientRect();
      onScreen =
        rect.width > 0 &&
        rect.height > 0 &&
        rect.bottom > 0 &&
        rect.top < (window.innerHeight || document.documentElement.clientHeight);
      apply();
    };
    measure();
    const stopWatchingTransitions = onTransitionFrame(measure);

    const onVis = () => {
      tabVisible = !document.hidden;
      apply();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      stopWatchingTransitions();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  useEffect(() => {
    if (!q.pointer || reduced) return;
    // This stage's uniform wants y measured downward, which is the opposite of
    // the shared signal's convention, so it is flipped back here rather than the
    // signal carrying two forms of the same number.
    return onPointerActivity(() => {
      const shared = pointerSignal();
      pointer.current.set(shared.x, -shared.y);
      idleRef.current = performance.now();
    });
  }, [q.pointer, reduced]);

  /*
   * Whether there is a subject to draw. Deliberately not "and the context is
   * alive": a lost context now leaves the canvas mounted so that the browser's
   * own `webglcontextrestored` has something to restore, and the stand-in is
   * shown over the top meanwhile. Unmounting on loss threw away the very element
   * the restore would have arrived on, which is how a recoverable stall became a
   * permanent one.
   */
  const ready = !failed && Boolean(modelSrc || resting || field || mode === "displacement");

  // One stable host, always mounted. An earlier version swapped this element when
  // the height map finished loading, which left the IntersectionObserver watching a
  // detached node: it reported "not intersecting", frameloop stayed "never", and
  // the renderer never drew a frame even though the scene was fully built.
  return (
    <div
      ref={hostRef}
      className={[styles.stage, className].filter(Boolean).join(" ")}
      role="img"
      aria-label={alt}
      /*
       * What the stage is currently doing, in one attribute.
       *
       * A stage can be showing nothing for three unrelated reasons — its cloud
       * has not arrived, it is paused because nobody is looking at it, or its GL
       * context was taken away — and from the outside all three look identical:
       * a labelled box with nothing in it. Published here so a blank sculpture
       * can be told apart from a slow one without a debugger, in production.
       *
       * "paused" is not "gone". The scene, its context and its buffers are all
       * still there; only the frameloop is idling.
       */
      data-sculpture={
        contextLost ? "context-lost" : !ready ? "loading" : visible ? "drawing" : "paused"
      }
    >
      {/*
        The static stand-in, where there is one to show. A stage carrying a baked
        model has no plate to fall back to, and an <img> with no source is a
        broken-image glyph sitting where the sculpture should be.
      */}
      {depthSrc && (graphicsDisabled || contextLost || (!ready && !restingSrc && !modelSrc)) ? (
        <img className={styles.fallback} src={depthSrc} alt="" aria-hidden="true" />
      ) : null}
      {!graphicsDisabled && ready ? (
      <Canvas
        className={styles.canvas}
        dpr={q.dpr}
        /*
         * Built once and kept for the life of the stage. Being scrolled past or
         * backgrounded changes how often this draws, never whether it exists:
         * see `lib/webgl/renderGate`.
         */
        frameloop={frameloopFor(visible && !contextLost, reduced)}
        camera={{ position: [0, 0, 1.55], fov: 40 }}
        gl={{ antialias: true, powerPreference: "low-power", alpha: true }}
        /*
         * Nothing here is clickable, and nothing raycasts. See
         * `noPointerEvents` for why r3f's DOM event layer is declined.
         */
        events={noPointerEvents}
        onCreated={({ gl }) => {
          /*
           * A genuine context loss — a driver reset, a GPU switch, a machine
           * waking from sleep. Preventing the default is what allows the browser
           * to hand the context back, and `webglcontextrestored` is where it says
           * it has. Until then the stage shows its static stand-in rather than an
           * empty black frame.
           *
           * There is deliberately no rebuild ladder here any more. Asking for a
           * replacement context on a page that has run out of them is what
           * produced the loop this pass exists to remove; a scene that keeps its
           * one context for its whole life does not run the page out in the first
           * place.
           */
          const canvas = gl.domElement;
          canvas.addEventListener("webglcontextlost", (event) => {
            event.preventDefault();
            setContextLost(true);
          });
          canvas.addEventListener("webglcontextrestored", () => setContextLost(false));
        }}
      >
        <RenderGate active={visible} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[-1.5, 1.4, 1.9]} intensity={1.9} color="#fff6ea" />
        <directionalLight position={[1.7, -0.8, 1.1]} intensity={0.35} color="#c3ccd8" />
        {spatialBackdrop ? (
          <SpatialBackdrop
            scrollRef={scrollRef}
            reduced={reduced}
            pointer={pointer}
            placement="frame"
            invertPointerY
          />
        ) : null}
        <Frame
          containAspect={modelSrc || restingSrc ? modelAspect : undefined}
          containScale={modelScale}
          horizontalOffset={modelX}
          verticalOffset={cameraY}
        >
          <Suspense fallback={null}>
          {modelSrc ? (
            <SolidModel src={modelSrc} pointer={pointer} scrollRef={scrollRef} reduced={reduced} />
          ) : null}
          {!modelSrc && mode === "mesh" && field ? (
            <ReliefMesh field={field} segments={q.segments} pointer={pointer} disperseRef={disperseRef} />
          ) : null}
          {!modelSrc && mode === "displacement" && depthTexture ? (
            <ReliefDisplacement depthTexture={depthTexture} segments={q.segments} pointer={pointer} disperseRef={disperseRef} />
          ) : null}
          {projects ? (
            <>
              <ambientLight intensity={0.7} />
              {/* The same corner the shafts fall from, so the plates are lit by
                  the light the page already has rather than by a second sun. */}
              <directionalLight position={[2.4, 2.8, 2.2]} intensity={2.4} color="#fff4e2" />
              <directionalLight position={[-1.8, -0.6, 1.4]} intensity={0.5} color="#cdd6e2" />
            </>
          ) : null}
          {projects && orbitRef && onActive
            ? projects.map((project, index) => (
                <ProjectPlane
                  key={project.slug}
                  project={project}
                  index={index}
                  count={projects.length}
                  progressRef={orbitRef}
                  onActive={onActive}
                  language={language}
                  morphRef={morph}
                />
              ))
            : null}
          {!modelSrc && mode === "particles" && (field || resting) ? (
            <ReliefParticles field={field} count={resting ? Math.min(resting.count, q.pointer ? 150_000 : 85_000) : q.points} pointer={pointer} disperseRef={disperseRef} brushTargetRef={brushTargetRef} flashTriggerRef={flashTriggerRef} idleRef={idleRef} sculpture={sculpture} morphRef={morph} orbitRef={orbitRef} dissolveRef={dissolve} resting={resting} grain={grain} scrollRef={scrollRef} reduced={reduced} />
          ) : null}
          </Suspense>
        </Frame>
        {edgeParticles && resting ? (
          <Frame>
            <ReliefParticles
              field={null}
              count={Math.round(q.points * 0.38)}
              pointer={pointer}
              disperseRef={disperseRef}
              brushTargetRef={brushTargetRef}
              idleRef={idleRef}
              sculpture={null}
              morphRef={ownMorph}
              dissolveRef={dissolve}
              resting={resting}
              grain={grain * 0.62}
              scrollRef={scrollRef}
              edgeOnly
              reduced={reduced}
            />
          </Frame>
        ) : null}
      </Canvas>
      ) : null}
    </div>
  );
}
