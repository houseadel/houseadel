import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Sky, seen through the canopy.
 *
 * Points on the inside of a dome, far enough back that the camera's descent never
 * reaches them, so they hold still while the forest slides past. Only the upper
 * half of the dome is populated: there is no sky below the horizon, and scattering
 * over a whole sphere would put stars behind the ground.
 *
 * They twinkle on their own clocks. Real stars twinkle because the air between
 * moves, which is not a thing that happens in unison, and a field pulsing together
 * reads as a fault rather than as a sky.
 */
const COUNT = 1400;
const DOME = 30;

export function StarField() {
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT);
    const sizes = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      // Biased toward the horizon rather than the zenith, because that is where
      // the gaps in the canopy are and where a star will actually be seen.
      const height = Math.pow(Math.random(), 1.6);
      const radius = Math.sqrt(1 - height * height);
      positions[i * 3] = Math.cos(angle) * radius * DOME;
      positions[i * 3 + 1] = height * DOME * 0.75 + 2;
      positions[i * 3 + 2] = Math.sin(angle) * radius * DOME;
      seeds[i] = Math.random();
      // A few bright ones among many faint: an even field reads as noise.
      sizes[i] = Math.pow(Math.random(), 3) * 2.6 + 0.5;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    g.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uScale: { value: 1 } }), []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: `
        attribute float aSeed; attribute float aSize;
        uniform float uTime; uniform float uScale;
        varying float vTwinkle; varying float vSeed;
        void main(){
          vSeed = aSeed;
          // Two incommensurable rates per star, so the field never settles into a
          // rhythm the eye can follow.
          vTwinkle = 0.55 + 0.45 * sin(uTime * (0.6 + aSeed * 1.7) + aSeed * 30.0)
                              * cos(uTime * 0.31 + aSeed * 12.0);
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * uScale;
          gl_Position = projectionMatrix * mv;
        }`,
        fragmentShader: `
        varying float vTwinkle; varying float vSeed;
        void main(){
          vec2 d = gl_PointCoord - 0.5;
          float r = length(d) * 2.0;
          float core = 1.0 - smoothstep(0.0, 1.0, r);
          if (core < 0.01) discard;
          // Cool at one end of the field, warm at the other: stars are not all
          // the same colour, and a uniformly white sky looks printed on.
          vec3 colour = mix(vec3(0.78, 0.86, 1.0), vec3(1.0, 0.93, 0.82), vSeed);
          gl_FragColor = vec4(colour * core * vTwinkle, core * vTwinkle * 0.85);
        }`,
      }),
    [uniforms],
  );
  useEffect(() => () => material.dispose(), [material]);

  useFrame((state, delta) => {
    uniforms.uTime.value += Math.min(delta, 0.05);
    uniforms.uScale.value = state.viewport.dpr;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} renderOrder={-2} />;
}
