import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { worlds, worldTexture, type World } from "../../../data/review";

const vertexShader = `
  varying vec2 vUv;
  uniform float uActive;
  uniform float uTime;

  void main() {
    vUv = uv;
    vec3 transformed = position;
    float breath = sin(uTime * 0.45 + position.y * 0.8) * 0.008;
    transformed.z += uActive * 0.12 + breath * uActive;
    transformed.xy *= 1.0 + uActive * 0.035;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform float uActive;
  uniform float uTime;
  uniform vec2 uPointer;

  void main() {
    vec2 center = vUv - 0.5;
    float lens = dot(center, center);
    float ripple = sin(vUv.y * 15.0 + uTime * 0.7) * 0.004;
    vec2 distortion = center * lens * (0.032 + uActive * 0.018);
    distortion += vec2(ripple, -ripple * 0.45);
    distortion += uPointer * 0.009 * uActive;

    float split = 0.004 + uActive * 0.003;
    float red = texture2D(uTexture, vUv + distortion + vec2(split, 0.0)).r;
    float green = texture2D(uTexture, vUv + distortion).g;
    float blue = texture2D(uTexture, vUv + distortion - vec2(split, 0.0)).b;
    vec3 color = vec3(red, green, blue);

    float edge = 1.0 - smoothstep(0.2, 0.7, length(center));
    color *= mix(0.72, 1.06, edge + uActive * 0.12);
    color += vec3(0.07, 0.08, 0.1) * uActive;
    gl_FragColor = vec4(color, 1.0);
  }
`;

type Point = [number, number];

const shapes: Point[][] = [
  [
    [-1.42, -1.02],
    [0.58, -1.2],
    [1.34, -0.15],
    [0.76, 1.22],
    [-0.92, 1.02],
    [-1.5, 0.08],
  ],
  [
    [-1.18, -1.15],
    [1.2, -0.82],
    [1.42, 0.48],
    [0.38, 1.18],
    [-1.34, 0.88],
  ],
  [
    [-1.32, -0.64],
    [-0.28, -1.2],
    [1.34, -0.9],
    [1.48, 0.52],
    [0.56, 1.22],
    [-1.12, 0.98],
  ],
];

function createPolygonGeometry(points: Point[]) {
  const positions = new Float32Array(points.flatMap(([x, y]) => [x, y, 0]));
  const minX = Math.min(...points.map(([x]) => x));
  const maxX = Math.max(...points.map(([x]) => x));
  const minY = Math.min(...points.map(([, y]) => y));
  const maxY = Math.max(...points.map(([, y]) => y));
  const uvs = new Float32Array(
    points.flatMap(([x, y]) => [(x - minX) / (maxX - minX), (y - minY) / (maxY - minY)]),
  );
  const indices: number[] = [];
  for (let index = 1; index < points.length - 1; index += 1) {
    indices.push(0, index, index + 1);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function GlassFragment({
  world,
  index,
  active,
  reduceMotion,
  onActive,
  onSelect,
}: {
  world: World;
  index: number;
  active: boolean;
  reduceMotion: boolean;
  onActive: (id: World["id"]) => void;
  onSelect: (id: World["id"]) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const texture = useLoader(THREE.TextureLoader, worldTexture(world));
  const geometry = useMemo(() => createPolygonGeometry(shapes[index]), [index]);
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);
  const pointer = useRef(new THREE.Vector2());
  const { viewport, size } = useThree();
  const mobile = size.width < 720;

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    texture.needsUpdate = true;
    return () => {
      geometry.dispose();
      edges.dispose();
    };
  }, [edges, geometry, texture]);

  const placement = useMemo(() => {
    if (mobile) {
      return {
        position: [0, viewport.height * (0.25 - index * 0.25), index * 0.03] as const,
        scale: Math.min(viewport.width / 3.7, viewport.height / 7.2),
        rotation: [0, 0, (index - 1) * 0.045] as const,
      };
    }
    return {
      position: [viewport.width * ((index - 1) * 0.235), (index % 2 ? 0.22 : -0.08), index * 0.03] as const,
      scale: Math.min(viewport.width / 7.2, viewport.height / 4.1),
      rotation: [0.02 * (index - 1), -0.035 * (index - 1), (index - 1) * 0.055] as const,
    };
  }, [index, mobile, viewport.height, viewport.width]);

  useFrame((state, delta) => {
    if (!materialRef.current || !meshRef.current) return;
    materialRef.current.uniforms.uTime.value = reduceMotion ? 0 : state.clock.elapsedTime;
    materialRef.current.uniforms.uActive.value = THREE.MathUtils.damp(
      materialRef.current.uniforms.uActive.value,
      active ? 1 : 0,
      7,
      delta,
    );
    materialRef.current.uniforms.uPointer.value.lerp(pointer.current, reduceMotion ? 1 : 0.08);
    meshRef.current.position.z = placement.position[2] + (active ? 0.14 : 0);
  });

  const handlePointer = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    const uv = event.intersections[0]?.uv;
    pointer.current.set((uv?.x ?? 0.5) - 0.5, (uv?.y ?? 0.5) - 0.5);
    onActive(world.id);
    document.body.style.cursor = "pointer";
  };

  return (
    <group
      position={placement.position}
      rotation={placement.rotation}
      scale={placement.scale}
      onPointerMove={handlePointer}
      onPointerOver={handlePointer}
      onPointerOut={() => {
        pointer.current.set(0, 0);
        document.body.style.cursor = "";
      }}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(world.id);
      }}
    >
      <mesh ref={meshRef} geometry={geometry}>
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={{
            uTexture: { value: texture },
            uActive: { value: active ? 1 : 0 },
            uTime: { value: 0 },
            uPointer: { value: new THREE.Vector2() },
          }}
          toneMapped={false}
        />
      </mesh>
      <lineSegments geometry={edges} position={[0, 0, 0.03]}>
        <lineBasicMaterial
          color={active ? "#f4efe2" : "#8a8780"}
          transparent
          opacity={active ? 0.9 : 0.42}
        />
      </lineSegments>
    </group>
  );
}

function ContextLossObserver({ onLoss }: { onLoss: () => void }) {
  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    let frame = 0;
    const handleLoss = (event: Event) => {
      event.preventDefault();
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        if (canvas.isConnected) onLoss();
      });
    };
    canvas.addEventListener("webglcontextlost", handleLoss);
    return () => {
      window.cancelAnimationFrame(frame);
      canvas.removeEventListener("webglcontextlost", handleLoss);
    };
  }, [gl, onLoss]);

  return null;
}

function ResourceObserver() {
  const { gl } = useThree();
  useFrame(() => {
    gl.domElement.dataset.geometries = String(gl.info.memory.geometries);
    gl.domElement.dataset.textures = String(gl.info.memory.textures);
    gl.domElement.dataset.programs = String(gl.info.programs?.length ?? 0);
  });
  return null;
}

export function HybridScene({
  active,
  reduceMotion,
  onActive,
  onSelect,
  onContextLoss,
}: {
  active: World["id"];
  reduceMotion: boolean;
  onActive: (id: World["id"]) => void;
  onSelect: (id: World["id"]) => void;
  onContextLoss: () => void;
}) {
  useEffect(
    () => () => {
      document.body.style.cursor = "";
    },
    [],
  );

  return (
    <>
      <color attach="background" args={["#07080a"]} />
      <ambientLight intensity={0.25} />
      <ContextLossObserver onLoss={onContextLoss} />
      <ResourceObserver />
      {worlds.map((world, index) => (
        <GlassFragment
          key={world.id}
          world={world}
          index={index}
          active={active === world.id}
          reduceMotion={reduceMotion}
          onActive={onActive}
          onSelect={onSelect}
        />
      ))}
    </>
  );
}
