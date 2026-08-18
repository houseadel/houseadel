import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { PEARL_CHUNK } from "./pearl";
import { rayIntensity } from "../../lib/godRays";
import type { ForestRipple } from "./forestRipple";

/**
 * The forest floor, as particles.
 *
 * Generated rather than baked. There is no model for ground, and there does not
 * need to be: what the scene wants is a surface that closes the bottom of the
 * frame so the planting is standing on something instead of floating in a void.
 *
 * Points are scattered on a disc rather than a square grid. A grid reads as a
 * grid the moment the camera moves — the eye finds the rows immediately — and a
 * disc has no corners to give away where the ground stops.
 *
 * Density falls with distance from the centre, and so does height, so the floor
 * thins into the dark instead of ending at an edge.
 */
const DEFAULT_COUNT = 90_000;
const RADIUS = 5.2;

export function ParticleGround({
  ripple,
  brush = 0,
  at = [0, -1.45, -1.6],
  count = DEFAULT_COUNT,
}: {
  /** The scene's shared disturbance. The floor is part of the wood, not scenery. */
  ripple?: { current: ForestRipple };
  brush?: number;
  /** Where the floor sits. */
  at?: [number, number, number];
  count?: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const normals = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      // Square root of a uniform draw, so the points spread evenly over the area
      // rather than crowding the middle the way a plain uniform radius does.
      const radius = Math.sqrt(Math.random()) * RADIUS;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // Low relief: enough that light catches unevenly, never enough to read as
      // terrain and compete with the planting.
      const undulation =
        Math.sin(x * 0.5) * 0.34 +
        Math.cos(z * 0.38) * 0.28 +
        Math.sin((x + z) * 0.9) * 0.1 +
        (Math.random() - 0.5) * 0.05;

      positions[i * 3] = x;
      // Rising toward the back, so the ground climbs away from the reader
      // instead of running flat to the horizon.
      // Higher on the left, so the ground rises to meet the tree standing there
      // rather than leaving it on a ledge of its own.
      const westward = Math.max(-x, 0) * 0.12;
      positions[i * 3 + 1] = undulation + Math.max(-z, 0) * 0.16 + westward;
      positions[i * 3 + 2] = z;

      normals[i * 3] = 0;
      normals[i * 3 + 1] = 1;
      normals[i * 3 + 2] = 0;
      seeds[i] = Math.random();
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aNormal", new THREE.BufferAttribute(normals, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    return g;
  }, [count]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProject: { value: 600 },
      uPointer: { value: new THREE.Vector2(4, 4) },
      uBrushStrength: { value: 0 },
      uBrushRadius: { value: 0.62 },
      uBrushBase: { value: 0.5 },
      uRay: { value: 0 },
      uAspect: { value: 1.78 },
      uBead: { value: 0.009 },
    }),
    [],
  );

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        depthWrite: false,
        vertexShader: `
        attribute vec3 aNormal; attribute float aSeed;
        uniform float uTime; uniform float uProject;
        uniform vec2 uPointer; uniform float uBrushStrength; uniform float uBrushRadius; uniform float uBrushBase;
        uniform float uRay; uniform float uAspect; uniform float uBead;
        varying float vFacing; varying float vSeed; varying float vFade; varying float vLift; varying float vRay;
        varying float vDepth; varying float vSpark;

        // How brightly this particle is struck. Measured in the frame, because the
        // light enters from a fixed corner of the screen and every scene on the
        // site agrees on which corner that is.
        float beamAt(vec4 clip, float depth, float aspect, float strength) {
          vec2 ndc = clip.xy / max(clip.w, 0.0001);
          vec2 rel = vec2((ndc.x - 1.02) * aspect, ndc.y - 1.06);
          vec2 dir = normalize(vec2(-0.62 * aspect, -1.0));
          float along = dot(rel, dir);
          float across = abs(rel.x * dir.y - rel.y * dir.x);
          // Wide and soft: a shaft has no sides.
          float core = exp(-across * across / 0.2);
          // Spent as it travels, so the far side of the frame stays in shadow.
          float reach = 1.0 - smoothstep(0.35, 2.5, along);
          // And nearer things catch more of it. Without this every particle in the
          // shaft is lit the same and the field reads as a flat cut-out.
          float near = 1.0 - smoothstep(1.0, 9.0, depth);
          return core * reach * step(0.0, along) * (0.18 + near * 1.5) * strength;
        }

        void main(){
          vSeed = aSeed;
          vec3 p = position;

          // Thins toward the rim, so the ground has no edge to find.
          vFade = 1.0 - smoothstep(2.5, ${RADIUS.toFixed(1)}, length(position.xz));

          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vFacing = clamp(dot(normalize(mat3(modelViewMatrix) * aNormal), vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
          vDepth = -mv.z;
          vSpark = step(0.988, fract(aSeed * 5.17));
          gl_PointSize = uBead * uProject * (1.0 + vSpark * 1.6) / max(-mv.z, 0.001);
          vec4 clip = projectionMatrix * mv;
          vRay = beamAt(clip, -mv.z, uAspect, uRay);

          // Measured in the frame, exactly as the planting measures it, so the
          // floor lifts with the foliage standing on it rather than a moment
          // later and somewhere else.
          vec2 ndc = clip.xy / max(clip.w, 0.0001);
          vec2 fromPointer = vec2((ndc.x - uPointer.x) * uAspect, ndc.y - uPointer.y);
          float reach = length(fromPointer);
          float near = exp(-reach * reach / (uBrushRadius * uBrushRadius));
          /*
           * Two components, and the floor is the important one.
           *
           * A falloff alone still makes the wood a set of separate things: the
           * plant under the hand moves and the one across the frame does not,
           * which is the behaviour being replaced. So every particle in the
           * scene takes a share of the disturbance at the same instant, and the
           * falloff only decides how much more the near ones take. The whole
           * wood lifts together; it simply lifts further where the hand is.
           */
          float body = uBrushStrength * mix(uBrushBase, 1.0, near);
          vLift = body;
          vec2 away = reach > 0.0001 ? fromPointer / reach : vec2(0.0, 1.0);
          ndc += vec2(away.x / uAspect, away.y) * uBrushStrength * near * 0.04;
          ndc.y += body * 0.046;
          clip.xy = ndc * clip.w;

          gl_Position = clip;
        }`,
        fragmentShader: `
        varying float vFacing; varying float vSeed; varying float vFade; varying float vLift; varying float vRay;
        varying float vDepth; varying float vSpark;
        ${PEARL_CHUNK}

        // Air. Particles fade into the ground colour with distance, so depth is
        // legible before anything else in the scene has to describe it.
        vec3 breathe(vec3 colour, float depth, out float veil) {
          float density = 0.062;
          float clarity = exp(-density * density * depth * depth);
          veil = clarity;
          return mix(vec3(0.016, 0.019, 0.021), colour, clarity);
        }

        void main(){
          if (vFade < 0.02) discard;
          vec4 bead = pearl(gl_PointCoord, 0.55 + vFacing * 0.45, vSeed, 0.75);
          if (bead.a < 0.01) discard;
          // The same pearl as everything else. Tinting the floor separately made
          // it read as a different material laid under the forest rather than as
          // the same stuff, seen lower down.
          vec3 colour = bead.rgb;
          colour += vLift * 0.6;
          colour += vec3(1.0, 0.95, 0.82) * vRay * 1.6;
                    if (vSpark > 0.5) {
            float r = length(gl_PointCoord - 0.5) * 2.0;
            colour += vec3(1.0, 0.97, 0.92) * pow(1.0 - clamp(r, 0.0, 1.0), 2.2) * 0.9;
          }

          float veil;
          colour = breathe(colour, vDepth, veil);
          gl_FragColor = vec4(colour, bead.a * vFade * (0.62 + vRay * 0.38) * (0.42 + veil * 0.58));
        }`,
      }),
    [uniforms],
  );
  useEffect(() => () => material.dispose(), [material]);

  useFrame((state, delta) => {
    const step = Math.min(delta, 0.05);
    uniforms.uTime.value += step;
    const camera = state.camera as THREE.PerspectiveCamera;
    const pixels = state.size.height * state.viewport.dpr;
    uniforms.uProject.value = pixels / (2 * Math.tan((camera.fov * Math.PI) / 360));
    uniforms.uAspect.value = state.size.width / Math.max(state.size.height, 1);
    uniforms.uRay.value = rayIntensity(performance.now());

    const shared = ripple?.current;
    if (shared && brush > 0) {
      uniforms.uPointer.value.set(shared.x, shared.y);
      uniforms.uBrushStrength.value = shared.strength * brush;
    } else {
      uniforms.uBrushStrength.value = 0;
    }
  });

  return <points ref={pointsRef} geometry={geometry} material={material} position={at} />;
}
