import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  getSpatialState,
  subscribeToSpatialState,
  type SpatialState,
} from "./spatialState";

type SpatialCanvasProps = {
  active: boolean;
  onReady: () => void;
  onUnavailable: () => void;
};

type PlaneConfiguration = {
  color: string;
  initialPosition: readonly [number, number, number];
  initialRotation: readonly [number, number, number];
  settledPosition: readonly [number, number, number];
  settledRotation: readonly [number, number, number];
  size: readonly [number, number];
  transparent?: boolean;
};

const planeConfigurations: readonly PlaneConfiguration[] = [
  {
    color: "#e7dfd1",
    initialPosition: [-3.25, 1.35, -0.15],
    initialRotation: [-0.16, 0.5, -0.22],
    settledPosition: [-2.3, 0.8, -0.9],
    settledRotation: [0, 0.08, 0],
    size: [2.6, 3.65],
  },
  {
    color: "#f8f4ec",
    initialPosition: [3.3, 1.75, -1.3],
    initialRotation: [0.18, -0.42, 0.28],
    settledPosition: [2.5, 1.1, -1.45],
    settledRotation: [0, -0.08, 0],
    size: [2.1, 2.85],
  },
  {
    color: "#d4ccbf",
    initialPosition: [2.7, -2.25, 0.2],
    initialRotation: [-0.7, -0.2, -0.08],
    settledPosition: [1.75, -1.75, -1.1],
    settledRotation: [-0.04, -0.12, 0],
    size: [4.2, 1.65],
  },
  {
    color: "#f2eee5",
    initialPosition: [-0.2, 2.85, -2.1],
    initialRotation: [0.35, 0.12, 0.16],
    settledPosition: [-0.75, 2.05, -1.8],
    settledRotation: [0, 0, 0],
    size: [3.35, 1.1],
  },
  {
    color: "#9c8768",
    initialPosition: [-2.1, -2.5, -1.85],
    initialRotation: [0.12, 0.66, -0.18],
    settledPosition: [-2.35, -1.65, -1.65],
    settledRotation: [0, 0.06, 0],
    size: [1.35, 2.2],
    transparent: true,
  },
];

function clampPhase(value: number, start: number, end: number) {
  return THREE.MathUtils.smoothstep(THREE.MathUtils.clamp(value, start, end), start, end);
}

function interpolateTuple(
  initial: readonly [number, number, number],
  settled: readonly [number, number, number],
  amount: number,
) {
  return [
    THREE.MathUtils.lerp(initial[0], settled[0], amount),
    THREE.MathUtils.lerp(initial[1], settled[1], amount),
    THREE.MathUtils.lerp(initial[2], settled[2], amount),
  ] as const;
}

function PaperAssembly({
  active,
  onFirstFrame,
}: {
  active: boolean;
  onFirstFrame: () => void;
}) {
  const planeReferences = useRef<Array<THREE.Mesh | null>>([]);
  const apertureReference = useRef<THREE.Group>(null);
  const assemblyReference = useRef<THREE.Group>(null);
  const keyLightReference = useRef<THREE.DirectionalLight>(null);
  const activeReference = useRef(active);
  const firstFrameReported = useRef(false);
  const { camera, invalidate, size } = useThree();

  const paperGeometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const frameHorizontalGeometry = useMemo(() => new THREE.BoxGeometry(2.42, 0.035, 0.035), []);
  const frameVerticalGeometry = useMemo(() => new THREE.BoxGeometry(0.035, 4.3, 0.035), []);

  const applySpatialState = useCallback(
    (spatialState: SpatialState) => {
      if (!activeReference.current) return;

      const assembly = clampPhase(spatialState.progress, 0, 0.46);
      const passage = clampPhase(spatialState.progress, 0.38, 0.84);
      const flattening = clampPhase(spatialState.progress, 0.72, 1);
      const compact = size.width < 768;
      const responsiveScale = compact ? 0.78 : 1;

      planeConfigurations.forEach((configuration, index) => {
        const plane = planeReferences.current[index];
        if (!plane) return;

        const position = interpolateTuple(
          configuration.initialPosition,
          configuration.settledPosition,
          assembly,
        );
        const rotation = interpolateTuple(
          configuration.initialRotation,
          configuration.settledRotation,
          assembly,
        );

        plane.position.set(
          position[0] * responsiveScale,
          position[1],
          THREE.MathUtils.lerp(position[2], -1.2, flattening * 0.58),
        );
        plane.rotation.set(
          THREE.MathUtils.lerp(rotation[0], 0, flattening),
          THREE.MathUtils.lerp(rotation[1], 0, flattening),
          THREE.MathUtils.lerp(rotation[2], 0, flattening),
        );
        plane.scale.set(
          configuration.size[0] * responsiveScale,
          configuration.size[1] * responsiveScale,
          1,
        );
      });

      const apertureX = compact ? 0.58 : 1.05;
      if (apertureReference.current) {
        apertureReference.current.position.set(
          apertureX,
          THREE.MathUtils.lerp(0.12, 0, flattening),
          -0.28,
        );
        apertureReference.current.rotation.set(
          0,
          THREE.MathUtils.lerp(-0.08, 0, assembly),
          THREE.MathUtils.lerp(0.05, 0, assembly),
        );
        const passageScale = THREE.MathUtils.lerp(1, compact ? 1.36 : 1.62, passage);
        apertureReference.current.scale.setScalar(passageScale * responsiveScale);
      }

      if (assemblyReference.current) {
        assemblyReference.current.rotation.y = spatialState.pointerX * 0.018 * (1 - passage);
        assemblyReference.current.rotation.x = spatialState.pointerY * -0.012 * (1 - passage);
        assemblyReference.current.position.x = spatialState.pointerX * 0.045 * (1 - passage);
        assemblyReference.current.position.y = spatialState.pointerY * 0.035 * (1 - passage);
      }

      camera.position.set(
        THREE.MathUtils.lerp(0, apertureX, passage) + spatialState.pointerX * 0.028 * (1 - passage),
        THREE.MathUtils.lerp(0.15, 0.02, passage),
        THREE.MathUtils.lerp(7.2, -0.62, passage),
      );
      camera.lookAt(apertureX * passage, 0, THREE.MathUtils.lerp(-1.2, -2.6, passage));
      camera.updateProjectionMatrix();

      if (keyLightReference.current) {
        keyLightReference.current.position.x = THREE.MathUtils.lerp(-3.5, 3.5, assembly);
        keyLightReference.current.intensity = THREE.MathUtils.lerp(2.35, 1.55, flattening);
      }

      invalidate();
    },
    [camera, invalidate, size.width],
  );

  useEffect(() => {
    activeReference.current = active;
    if (active) applySpatialState(getSpatialState());
  }, [active, applySpatialState]);

  useEffect(() => subscribeToSpatialState(applySpatialState), [applySpatialState]);

  useEffect(
    () => () => {
      paperGeometry.dispose();
      frameHorizontalGeometry.dispose();
      frameVerticalGeometry.dispose();
    },
    [frameHorizontalGeometry, frameVerticalGeometry, paperGeometry],
  );

  useFrame(() => {
    if (firstFrameReported.current) return;
    firstFrameReported.current = true;
    onFirstFrame();
  });

  return (
    <>
      <ambientLight intensity={1.6} color="#f8f4ec" />
      <directionalLight
        ref={keyLightReference}
        color="#f2e4ce"
        intensity={2.35}
        position={[-3.5, 4.8, 5.5]}
      />
      <group ref={assemblyReference}>
        {planeConfigurations.map((configuration, index) => (
          <mesh
            // The order is stable and belongs to a fixed procedural composition.
            key={`${configuration.color}-${index}`}
            ref={(node) => {
              planeReferences.current[index] = node;
            }}
            geometry={paperGeometry}
          >
            <meshStandardMaterial
              color={configuration.color}
              metalness={0}
              opacity={configuration.transparent ? 0.38 : 0.94}
              roughness={0.96}
              side={THREE.DoubleSide}
              transparent
            />
          </mesh>
        ))}

        <group ref={apertureReference}>
          <mesh geometry={frameHorizontalGeometry} position={[0, 2.15, 0]}>
            <meshStandardMaterial color="#6f2431" metalness={0.06} roughness={0.8} />
          </mesh>
          <mesh geometry={frameHorizontalGeometry} position={[0, -2.15, 0]}>
            <meshStandardMaterial color="#6f2431" metalness={0.06} roughness={0.8} />
          </mesh>
          <mesh geometry={frameVerticalGeometry} position={[-1.21, 0, 0]}>
            <meshStandardMaterial color="#6f2431" metalness={0.06} roughness={0.8} />
          </mesh>
          <mesh geometry={frameVerticalGeometry} position={[1.21, 0, 0]}>
            <meshStandardMaterial color="#6f2431" metalness={0.06} roughness={0.8} />
          </mesh>
        </group>
      </group>
    </>
  );
}

export default function SpatialCanvas({ active, onReady, onUnavailable }: SpatialCanvasProps) {
  const compact = window.matchMedia("(max-width: 47.99rem)").matches;
  const readyReported = useRef(false);

  const reportReady = useCallback(() => {
    if (readyReported.current) return;
    readyReported.current = true;
    onReady();
  }, [onReady]);

  return (
    <Canvas
      aria-hidden="true"
      camera={{ far: 30, fov: compact ? 52 : 45, near: 0.08, position: [0, 0.15, 7.2] }}
      dpr={compact ? [1, 1.15] : [1, 1.5]}
      frameloop="demand"
      gl={{
        alpha: true,
        antialias: !compact,
        powerPreference: "low-power",
        preserveDrawingBuffer: false,
      }}
      onCreated={({ gl, invalidate }) => {
        gl.domElement.dataset.spatialWebgl = "ready";
        gl.domElement.tabIndex = -1;
        gl.domElement.addEventListener(
          "webglcontextlost",
          (event) => {
            event.preventDefault();
            onUnavailable();
          },
          { once: true },
        );
        invalidate();
      }}
      shadows={false}
    >
      <PaperAssembly active={active} onFirstFrame={reportReady} />
    </Canvas>
  );
}
