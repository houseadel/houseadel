import { useEffect, useRef } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import gsap from "gsap";
import * as THREE from "three";
import { worlds, worldTexture } from "../../../data/review";

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform sampler2D uFrom;
  uniform sampler2D uTo;
  uniform float uProgress;
  uniform float uTime;
  uniform float uImageAspect;
  uniform float uViewportAspect;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  vec2 coverUv(vec2 uv) {
    vec2 scale = vec2(1.0);
    if (uViewportAspect > uImageAspect) {
      scale.y = uImageAspect / uViewportAspect;
    } else {
      scale.x = uViewportAspect / uImageAspect;
    }
    return (uv - 0.5) * scale + 0.5;
  }

  void main() {
    vec2 uv = coverUv(vUv);
    float grain = hash(floor(vUv * vec2(240.0, 140.0)) + uTime * 0.02);
    float veil = sin(vUv.y * 8.0 + vUv.x * 3.5 + uProgress * 4.0) * 0.035;
    float threshold = clamp(uProgress * 1.42 - 0.21 + veil + (grain - 0.5) * 0.11, 0.0, 1.0);
    float mask = smoothstep(0.34, 0.66, threshold + vUv.x * 0.16);

    vec2 fromUv = uv + vec2((uProgress * 0.018) * (vUv.x - 0.5), 0.0);
    vec2 toUv = uv - vec2(((1.0 - uProgress) * 0.018) * (vUv.x - 0.5), 0.0);
    vec3 fromColor = texture2D(uFrom, fromUv).rgb;
    vec3 toColor = texture2D(uTo, toUv).rgb;

    vec3 color = mix(fromColor, toColor, mask);
    float edge = 1.0 - smoothstep(0.0, 0.17, abs(mask - 0.5));
    color += vec3(0.06, 0.045, 0.035) * edge * 0.25;
    color += (grain - 0.5) * 0.018;
    gl_FragColor = vec4(color, 1.0);
  }
`;

export function CinematicScene({
  activeIndex,
  previousIndex,
  reduceMotion,
  onContextLoss,
}: {
  activeIndex: number;
  previousIndex: number;
  reduceMotion: boolean;
  onContextLoss: () => void;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const textures = useLoader(
    THREE.TextureLoader,
    worlds.map(worldTexture),
  );
  const { viewport, size, invalidate, gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    let frame = 0;
    const handleLoss = (event: Event) => {
      event.preventDefault();
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        if (canvas.isConnected) onContextLoss();
      });
    };
    canvas.addEventListener("webglcontextlost", handleLoss);
    return () => {
      window.cancelAnimationFrame(frame);
      canvas.removeEventListener("webglcontextlost", handleLoss);
    };
  }, [gl, onContextLoss]);

  useEffect(() => {
    textures.forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      texture.needsUpdate = true;
    });
  }, [textures]);

  useEffect(() => {
    const material = materialRef.current;
    if (!material) return;
    material.uniforms.uFrom.value = textures[previousIndex];
    material.uniforms.uTo.value = textures[activeIndex];
    gsap.killTweensOf(material.uniforms.uProgress);
    if (reduceMotion) {
      material.uniforms.uProgress.value = 1;
      invalidate();
      return;
    }
    material.uniforms.uProgress.value = 0;
    gsap.to(material.uniforms.uProgress, {
      value: 1,
      duration: 1.05,
      ease: "power3.inOut",
      onUpdate: invalidate,
    });
  }, [activeIndex, invalidate, previousIndex, reduceMotion, textures]);

  useFrame((state) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = reduceMotion ? 0 : state.clock.elapsedTime;
  });

  return (
    <>
      <color attach="background" args={["#0a090a"]} />
      <mesh>
        <planeGeometry args={[viewport.width, viewport.height]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={{
            uFrom: { value: textures[previousIndex] },
            uTo: { value: textures[activeIndex] },
            uProgress: { value: 1 },
            uTime: { value: 0 },
            uImageAspect: { value: 16 / 9 },
            uViewportAspect: { value: size.width / size.height },
          }}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}
