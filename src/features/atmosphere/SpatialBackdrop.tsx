import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ReclaimContext } from "./ReclaimContext";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { graphicsAreDisabled, motionIsReduced, pointerIsFine } from "../../lib/preferences";
import { InputFrameInvalidator } from "./InputFrameInvalidator";
import { PointerBridge } from "./PointerBridge";

export type BackdropPlacement = "frame" | "center" | "full";

/**
 * A fine architectural field behind the site's spatial scenes.
 *
 * Placement is deliberately explicit. Home reserves the middle for Love, Work
 * reserves the perimeter for its forest, and text-only pages may use the whole
 * plane. The mesh therefore frames existing particle subjects instead of drawing
 * through them.
 */
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
  placement?: BackdropPlacement;
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

  const starUniforms = useMemo(() => ({ uTime: { value: 0 }, uDpr: { value: 1 } }), []);
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
            gl_FragColor = vec4(vec3(0.9, 0.93, 0.96) * core * vLight, core * vLight * 0.44);
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

/** A route-level host for text pages that do not already own a WebGL scene. */
export function SpatialBackdropStage({
  className,
  placement = "full",
}: {
  className?: string;
  placement?: BackdropPlacement;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const pointer = useRef(new THREE.Vector2(4, 4));
  const [onScreen, setOnScreen] = useState(false);
  const [tabVisible, setTabVisible] = useState(!document.hidden);
  const reduced = motionIsReduced();
  const finePointer = pointerIsFine();
  const graphicsDisabled = graphicsAreDisabled();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(
      entry.isIntersecting && entry.intersectionRatio > 0.001,
    ));
    observer.observe(host);
    const onVisibility = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // The pointer comes from the shared signal, so a finger moving over this
  // backdrop disturbs it the same way a cursor does. See PointerBridge.

  return (
    <div ref={hostRef} className={className} aria-hidden="true">
      {!graphicsDisabled && onScreen ? (
        <Canvas
          dpr={finePointer ? [1, 1.35] : [1, 1.15]}
          frameloop={tabVisible && !reduced && finePointer ? "always" : "demand"}
          camera={{ position: [0, 0, 1.55], fov: 40 }}
          gl={{ antialias: true, powerPreference: "low-power", alpha: true }}
        >
          <ReclaimContext />
          <InputFrameInvalidator enabled={!finePointer && tabVisible && !reduced} />
          <PointerBridge pointer={pointer} reduced={reduced} />
          <SpatialBackdrop reduced={reduced} pointer={pointer} placement={placement} />
        </Canvas>
      ) : null}
    </div>
  );
}
