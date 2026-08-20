import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { loadPointCloud, type PointCloud } from "../gallery/pointCloud";
import { PEARL_CHUNK } from "./pearl";
import { rayIntensity } from "../../lib/godRays";
import type { ForestRipple } from "./forestRipple";
import { SPECTRUM_CHUNK } from "../liquid/spectrum";

/**
 * One baked model, rendered as pearl.
 *
 * Every plant and the dove are the same component with different numbers, which
 * is the point: the forest is an arrangement, not five bespoke scenes. Adding the
 * shrub when it is exported is one more entry in the arrangement, not one more
 * shader.
 */
export type PearlCloudProps = {
  url: string;
  /** Deterministic density cap for constrained/mobile renderers. */
  maxPoints?: number;
  /** Longest dimension, in scene units. The others keep the model's proportions. */
  size: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  /** 0 cool, 1 warm. How the light in this part of the scene falls on it. */
  warmth?: number;
  /** A hint of colour under the pearl. Kept faint on purpose. */
  tint?: [number, number, number];
  /** Point size multiplier. */
  grain?: number;
  /** Sways in the air. Plants do; the dove has its own motion. */
  sway?: number;
  /**
   * Fades the cloud out toward its base, 0 off to 1 strong.
   *
   * A trunk that meets the bottom of the frame square reads as a model cut off;
   * fading it into the dark lets it leave the picture instead of ending in it.
   */
  fadeBase?: number;
  /** Wing beat, for the dove. The wings are the model's long axis. */
  flap?: number;
  /**
   * The scene's shared disturbance. Every cloud reads the same one, which is
   * what makes the wood behave as a single surface rather than as a group of
   * models that each notice the pointer separately.
   */
  ripple?: { current: ForestRipple };
  /** How much of the shared disturbance reaches this cloud. 0 leaves it alone. */
  brush?: number;
  /** Dark particle surface for objects shown on pale ground. */
  surface?: "pearl" | "ink";
  /** Called every frame, to move a cloud that is not simply standing there. */
  onFrame?: (group: THREE.Group, delta: number) => void;
};

export function PearlCloud({
  url,
  maxPoints,
  size,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  warmth = 0.6,
  tint = [1, 1, 1],
  grain = 1,
  sway = 0,
  fadeBase = 0,
  flap = 0,
  ripple,
  brush = 0,
  surface = "pearl",
  onFrame,
}: PearlCloudProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const [cloud, setCloud] = useState<PointCloud | null>(null);

  useEffect(() => {
    let dead = false;
    void loadPointCloud(url)
      .then((loaded) => {
        if (!dead) setCloud(loaded);
      })
      .catch(() => undefined);
    return () => {
      dead = true;
    };
  }, [url]);

  const geometry = useMemo(() => {
    if (!cloud) return null;
    const count = Math.min(cloud.count, maxPoints ?? cloud.count);
    const stride = cloud.count / count;
    const positions = new Float32Array(count * 3);
    const normals = new Float32Array(count * 3);
    const g = new THREE.BufferGeometry();
    for (let index = 0; index < count; index += 1) {
      const source = Math.min(Math.floor(index * stride), cloud.count - 1);
      positions.set(cloud.positions.subarray(source * 3, source * 3 + 3), index * 3);
      normals.set(cloud.normals.subarray(source * 3, source * 3 + 3), index * 3);
    }
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aNormal", new THREE.BufferAttribute(normals, 3));
    g.computeBoundingSphere();
    // A stable per-particle number, used to stagger the iridescence, the sway and
    // the scatter, so a cloud never shimmers or breathes in unison.
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i += 1) seeds[i] = Math.random();
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    return g;
  }, [cloud, maxPoints]);
  useEffect(() => () => geometry?.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 1 },
      uWarmth: { value: warmth },
      uTint: { value: new THREE.Color(tint[0], tint[1], tint[2]) },
      uSway: { value: sway },
      uFlap: { value: flap },
      uFadeBase: { value: fadeBase },
      uProject: { value: 600 },
      uBead: { value: 0.01 },
      uPointer: { value: new THREE.Vector2(4, 4) },
      uBrushStrength: { value: 0 },
      uBrushRadius: { value: 0.62 },
      uBrushBase: { value: 0.5 },
      uFlashAge: { value: 4 },
      uRay: { value: 0 },
      uAspect: { value: 1.78 },
      uInk: { value: surface === "ink" ? 1 : 0 },
    }),
    [fadeBase, flap, surface, sway, tint, warmth],
  );

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
        vertexShader: `
        attribute vec3 aNormal; attribute float aSeed;
        uniform float uTime; uniform float uSize; uniform float uSway;
        uniform float uFlap; uniform float uFadeBase; uniform float uProject; uniform float uBead;
        uniform vec2 uPointer; uniform float uBrushStrength; uniform float uBrushRadius; uniform float uBrushBase; uniform float uFlashAge;
        uniform float uRay; uniform float uAspect; uniform float uInk;
        varying float vFacing; varying float vSeed; varying float vLift; varying float vRay; varying float vBase;
        varying float vDepth; varying float vSpark; varying float vFlash;

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

          // Measured in the model's own box, where the base sits at -0.5, so the
          // fade lands in the same place whatever size the plant is drawn at.
          vBase = uFadeBase > 0.0001
            ? mix(1.0, smoothstep(-0.46, -0.08, p.y), uFadeBase)
            : 1.0;

          if (uSway > 0.0001) {
            // Higher parts of a plant move more than the base, which is the whole
            // difference between foliage in air and a model wobbling.
            float lift = clamp(p.y + 0.5, 0.0, 1.0);
            p.x += sin(uTime * 0.6 + aSeed * 6.28 + p.y * 3.0) * 0.006 * uSway * lift;
            p.z += cos(uTime * 0.5 + aSeed * 6.28) * 0.005 * uSway * lift;
          }

          if (uFlap > 0.0001) {
            // The wings are the model's long axis, so distance from its centre
            // line is how far out along a wing a point sits. Squared, because a
            // wing bends far more at the tip than at the shoulder.
            float span = clamp(abs(p.x) * 2.0, 0.0, 1.0);
            float beat = sin(uTime * 7.0) * span * span;
            p.y += beat * 0.26 * uFlap;
            // Tips sweep back on the downstroke, as they do in life.
            p.z += abs(beat) * 0.06 * uFlap;
          }

          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vFacing = clamp(dot(normalize(mat3(modelViewMatrix) * aNormal), vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
          // Perspective-correct: a bead of known world size, projected. A bare
          // constant over depth looked right in a scene a unit across and rendered
          // sub-pixel in a forest eight deep.
          vDepth = -mv.z;
          // One particle in forty carries the light. Any more and the field reads
          // as static rather than as a few things catching a highlight.
          vSpark = step(0.975, fract(aSeed * 7.31));
          gl_PointSize = uBead * uProject * (1.0 + vSpark * 1.9) / max(-mv.z, 0.001);
          vec4 clip = projectionMatrix * mv;
          vRay = beamAt(clip, -mv.z, uAspect, uRay);

          /*
           * The disturbance is measured in the frame, not in this model.
           *
           * Distance to the hand is taken after projection, so one hand's width
           * on screen is one hand's width whichever plant it falls on and
           * however far away that plant stands. That is what makes the wood one
           * surface: a ripple crossing the frame reaches the near fern and the
           * far canopy at the same moment and in the same place, instead of each
           * model testing the pointer against its own bounding sphere and
           * lifting alone while its neighbour stays perfectly still.
           */
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
          // Parted where the hand actually is, lifted everywhere at once.
          vec2 away = reach > 0.0001 ? fromPointer / reach : vec2(0.0, 1.0);
          ndc += vec2(away.x / uAspect, away.y) * uBrushStrength * near * 0.085;
          ndc.y += body * 0.05;
          clip.xy = ndc * clip.w;

          // One wavefront for the whole wood, expanding from where the hand
          // entered it, measured in the frame so it crosses everything standing
          // in the scene together.
          float flashRadius = uFlashAge * 1.45;
          float flashEnvelope = 1.0 - smoothstep(0.62, 1.05, uFlashAge);
          vFlash = exp(-pow((reach - flashRadius) / 0.14, 2.0)) * flashEnvelope;

          gl_Position = clip;
        }`,
        fragmentShader: `
        uniform float uWarmth; uniform float uInk; uniform vec3 uTint;
        varying float vFacing; varying float vSeed; varying float vLift; varying float vRay; varying float vBase;
        varying float vDepth; varying float vSpark; varying float vFlash;
        ${PEARL_CHUNK}
        // The same light the liquid lens refracts through, so a hand crossing
        // from the page onto the wood is met by one material.
        ${SPECTRUM_CHUNK}

        // Air. Particles fade into the ground colour with distance, so depth is
        // legible before anything else in the scene has to describe it.
        vec3 breathe(vec3 colour, float depth, out float veil) {
          float density = 0.062;
          float clarity = exp(-density * density * depth * depth);
          veil = clarity;
          vec3 atmosphere = mix(vec3(0.016, 0.019, 0.021), vec3(0.965, 0.96, 0.945), uInk);
          return mix(atmosphere, colour, clarity);
        }

        void main(){
          vec4 bead = pearl(gl_PointCoord, vFacing, vSeed, uWarmth);
          if (bead.a < 0.01) discard;
          // Colour under the pearl rather than over it: the tint leans the body a
          // little and the interference still does the talking.
          vec3 colour = bead.rgb * mix(vec3(1.0), uTint, 0.5);
          if (uInk > 0.5) {
            float pearlLight = dot(bead.rgb, vec3(0.299, 0.587, 0.114));
            colour = mix(vec3(0.19), vec3(0.012), clamp(pearlLight * 0.7 + vFacing * 0.42, 0.0, 1.0));
          }
          // Disturbed particles catch more light, so a brushed patch brightens as
          // it lifts and settles back as it returns.
          // Refracted colour arrives with the disturbance, as it does on the
          // relief: the hand is what splits the light.
          float hue = fract(vSeed * 2.7 + vLift * 0.5);
          vec3 refracted = houseAdelSpectrum(hue);
          colour = mix(colour, refracted * 1.5, clamp(vLift * 1.8, 0.0, 1.0) * 0.85 * (1.0 - uInk));
          colour += vLift * 0.55 * (1.0 - uInk);
          vec3 ripple = houseAdelSpectrum(fract(vSeed + vFlash * 0.18));
          colour = mix(colour, ripple * 1.75, vFlash);
          colour += vFlash * 0.62;
          // Struck by the sun. This is the only place the beam exists: it is not
          // drawn, it is what a particle standing in it does.
          colour += vec3(1.0, 0.95, 0.82) * vRay * 1.6 * (1.0 - uInk);
          // Faint until lit. Holding the unlit field back is what lets the beam
          // read as a shaft cutting through it rather than a wash over it.
                    // A spark is a soft, bright core rather than a hard dot: the wide
          // falloff is what makes it read as glow and not as a larger particle.
          if (vSpark > 0.5 && uInk < 0.5) {
            float r = length(gl_PointCoord - 0.5) * 2.0;
            float halo = pow(1.0 - clamp(r, 0.0, 1.0), 2.2);
            colour += vec3(1.0, 0.97, 0.92) * halo * 1.1;
          }

          float veil;
          colour = breathe(colour, vDepth, veil);
          float opacity = bead.a * (0.62 + vRay * 0.38) * vBase * (0.42 + veil * 0.58);
          opacity = max(opacity, bead.a * vFlash * 0.92 * vBase);
          gl_FragColor = vec4(colour, opacity);
        }`,
      }),
    [uniforms],
  );
  useEffect(() => () => material.dispose(), [material]);

  useFrame((state, delta) => {
    const step = Math.min(delta, 0.05);
    uniforms.uTime.value += step;
    uniforms.uSize.value = state.gl.getPixelRatio();
    const camera = state.camera as THREE.PerspectiveCamera;
    const pixels = state.size.height * state.viewport.dpr;
    uniforms.uProject.value = pixels / (2 * Math.tan((camera.fov * Math.PI) / 360));
    // Bead size grows with the model, but slower than it. A single world radius
    // across the whole forest gives a tree a fine grain and a fern a heap of
    // boulders, because the fern is a sixth of the size and its beads were not.
    uniforms.uBead.value = 0.0055 * Math.pow(size, 0.55) * grain;
    uniforms.uAspect.value = state.size.width / Math.max(state.size.height, 1);
    uniforms.uRay.value = rayIntensity(performance.now());

    // Everything about when and where is decided once, by the scene. A cloud
    // only says how much of that disturbance lands on the material it is made
    // of, which is what keeps the wood in step with itself.
    const shared = ripple?.current;
    if (shared && brush > 0) {
      uniforms.uPointer.value.set(shared.x, shared.y);
      uniforms.uBrushStrength.value = shared.strength * brush;
      uniforms.uFlashAge.value = shared.age;
    } else {
      uniforms.uBrushStrength.value = 0;
      uniforms.uFlashAge.value = 4;
    }

    if (groupRef.current) onFrame?.(groupRef.current, step);
  });

  if (!geometry || !cloud) return null;

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <points ref={pointsRef} geometry={geometry} material={material} scale={size} />
    </group>
  );
}
