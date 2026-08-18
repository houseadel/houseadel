import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ReclaimContext } from "../atmosphere/ReclaimContext";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { graphicsAreDisabled, motionIsReduced, pointerIsFine } from "../../lib/preferences";
import { scrollSignal } from "../../lib/scrollSignal";
import { resolveAppUrl } from "../../lib/basePath";
import { SpatialBackdrop } from "../atmosphere/SpatialBackdrop";
import { InputFrameInvalidator } from "../atmosphere/InputFrameInvalidator";
import { PointerBridge } from "../atmosphere/PointerBridge";
import { PearlCloud } from "./PearlCloud";
import { ForestRippleDriver } from "./ForestRippleDriver";
import { createForestRipple } from "./forestRipple";
import { ParticleGround } from "./ParticleGround";
import { StarField } from "./StarField";
import styles from "./ForestStage.module.css";

/**
 * Work, as a descent through a forest.
 *
 * The forest is a border, not a subject. Everything is pushed to the edges — the
 * canopy across the top, foliage down both sides, undergrowth and floor along the
 * bottom — so the middle of the frame stays clear for the work itself. It is the
 * room the projects are shown in, and a room is mostly its walls.
 *
 * The planting is fixed and the reader moves: only the dove travels, falling
 * through the frame as the page is scrolled. That parallax between a still world
 * and one moving thing is what makes the chapter read as a descent rather than a
 * slideshow of plants.
 *
 * The arrangement below is data, not layout code. Each entry is a model, a size
 * and a place; the shrub joins by adding a line once it has been exported.
 */
type Planting = {
  id: string;
  model: string;
  size: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  warmth: number;
  tint: [number, number, number];
  grain: number;
  sway: number;
  brush: number;
  fadeBase?: number;
};

/** Faint colour. It leans the pearl; it never replaces it. */
const LEAF: [number, number, number] = [0.74, 0.9, 0.76];
const DEEP: [number, number, number] = [0.62, 0.78, 0.82];

const FOREST: Planting[] = [
  // Canopy, hung off the top corners so only the lower branches enter the frame.
  {
    id: "canopy-right",
    model: "tree",
    size: 12,
    position: [3.4, -0.45, -3.6],
    rotation: [0.25, -0.6, -0.15],
    warmth: 0.85,
    tint: LEAF,
    grain: 0.9,
    sway: 0.45,
    brush: 0.55,
  },
  {
    id: "canopy-left",
    model: "tree",
    size: 11,
    position: [-4.0, -0.62, -4.6],
    rotation: [0.2, 2.1, 0.18],
    warmth: 0.45,
    tint: DEEP,
    grain: 0.85,
    sway: 0.4,
    brush: 0.5,
    fadeBase: 1,
  },
  // Side foliage, close to the camera, framing the view like a doorway.
  {
    id: "fern-near-left",
    model: "fern",
    size: 2.5,
    position: [-2.55, -1.18, 1.15],
    rotation: [0.1, 0.7, 0.25],
    warmth: 0.6,
    tint: LEAF,
    grain: 1,
    sway: 1,
    brush: 0.9,
  },
  {
    id: "fern-near-right",
    model: "fern",
    size: 2.1,
    position: [2.65, -1.22, -0.35],
    rotation: [0.08, -1.1, -0.3],
    warmth: 0.55,
    tint: LEAF,
    grain: 1,
    sway: 1,
    brush: 0.9,
  },
  // Undergrowth along the bottom edge, in front of the floor.
  {
    id: "fern-floor",
    model: "fern",
    size: 1.7,
    position: [0.35, -1.26, -1.35],
    rotation: [0.08, 1.4, 0.2],
    warmth: 0.5,
    tint: DEEP,
    grain: 1.05,
    sway: 0.9,
    brush: 0.8,
  },
];

/**
 * Mobile is its own planting, and now actually is one.
 *
 * What was here before was the desktop arrangement with three of its five plants
 * kept and their numbers adjusted — which is why a phone showed two canopies
 * hung so far off the top corners that neither read as a tree, and a scatter of
 * undergrowth sitting along one line near the bottom. On a narrow frame there is
 * no room for a border of foliage, so the composition has to be a subject in a
 * space rather than a doorway around an opening.
 *
 * Three things are being solved at once.
 *
 * **A tree you can see.** One tree, whole, near enough that its trunk and crown
 * are both in frame, set left of centre so the composition is not symmetrical.
 * It is the densest and the most sharply grained thing in the scene, and it sits
 * in front of a second, much dimmer tree far behind it — the depth separation is
 * what gives it a silhouette without having to brighten it into a white shape.
 *
 * **Vegetation in a space, not a hedge.** The shrubs were reading as landscaping
 * because they shared a depth and very nearly a height. These do not: they run
 * from just behind the tree to well in front of it, their apparent sizes vary by
 * more than double, two of them cluster while one sits alone across the frame,
 * and there is a deliberate gap in the middle distance where nothing grows.
 *
 * **The bottom edge stays planted.** The foreground clump at the very front is
 * kept, because it is what stops the frame from opening onto nothing.
 */
const MOBILE_FOREST: Planting[] = [
  // The subject. Whole, standing on the ground, and left of centre.
  {
    id: "tree-primary",
    model: "tree",
    size: 5.1,
    // Low enough that the trunk reaches the floor rather than hanging over it,
    // and far enough left that the frame is not split down the middle.
    position: [-0.95, -0.16, -1.9],
    rotation: [0.04, 0.55, -0.03],
    // Cool and unlit. Legibility here comes from density against a dark
    // surround, not from brightness: a warm, heavily grained tree turns into a
    // white silhouette with no form inside it, which is the opposite of what
    // makes it read as a tree.
    warmth: 0.48,
    tint: LEAF,
    grain: 0.92,
    sway: 0.5,
    brush: 0.75,
    fadeBase: 0.95,
  },
  // Far behind it, and dim. Present only so the near tree has something to be in
  // front of.
  {
    id: "tree-distant",
    model: "tree",
    size: 7.2,
    position: [1.75, 0.05, -5.6],
    rotation: [0.16, -1.35, 0.12],
    warmth: 0.32,
    tint: DEEP,
    grain: 0.82,
    sway: 0.3,
    brush: 0.3,
    fadeBase: 1,
  },
  // A pair, close together and at slightly different depths.
  {
    id: "shrub-cluster-near",
    model: "fern",
    size: 1.15,
    position: [0.86, -1.16, -0.42],
    rotation: [0.06, -0.9, 0.14],
    warmth: 0.58,
    tint: LEAF,
    grain: 1.06,
    sway: 0.95,
    brush: 0.85,
  },
  {
    id: "shrub-cluster-far",
    model: "fern",
    size: 0.82,
    position: [1.32, -1.2, -1.55],
    rotation: [0.04, 0.4, -0.18],
    warmth: 0.44,
    tint: DEEP,
    grain: 0.96,
    sway: 0.8,
    brush: 0.6,
  },
  // Alone, across the frame and much deeper. The gap between this and the pair
  // is the point.
  {
    id: "shrub-isolated",
    model: "fern",
    size: 0.66,
    position: [-1.55, -1.24, -2.75],
    rotation: [0.02, 2.4, 0.1],
    warmth: 0.36,
    tint: DEEP,
    grain: 0.9,
    sway: 0.7,
    brush: 0.45,
  },
  // Right at the front and cropped by the bottom edge, so the frame is planted
  // rather than opening onto nothing.
  {
    id: "shrub-foreground",
    model: "fern",
    size: 1.85,
    position: [-0.35, -1.72, 1.05],
    rotation: [0.1, 1.15, 0.22],
    warmth: 0.5,
    tint: LEAF,
    grain: 1.15,
    sway: 1,
    brush: 1,
  },
];

const GROUND_AT: [number, number, number] = [0, -1.45, -1.6];

/** Where the camera begins. */
const CAMERA_START: [number, number, number] = [0, 0.35, 3.4];

/**
 * A slow descent through the planting.
 *
 * The camera is the only thing that betrays that the forest is fixed, so it moves
 * as little as it can: a small drop and a slight lean, enough that near foliage
 * slides against the far canopy.
 */
function Camera({ progressRef, compact }: { progressRef: { current: number }; compact: boolean }) {
  const { camera } = useThree();
  useFrame((_, delta) => {
    const step = Math.min(delta, 0.05);
    const t = progressRef.current;
    /*
     * The wood settles a beat after the reader stops.
     *
     * Scroll velocity pushes the camera back very slightly and keeps pushing for
     * a moment after the input ends, so the planting trails the page instead of
     * being nailed to it. This is the layer that is *allowed* to lag: the type
     * over it is not, and settles on the scroll itself. The amount is small, and
     * smaller still on a phone, where the same figure reads as the scene
     * wobbling rather than as depth.
     */
    const trail = scrollSignal().lag * (compact ? 0.055 : 0.14);
    const y = (compact ? 0.48 - t * 0.72 : 0.35 - t * 0.95) - trail * 0.35;
    const z = (compact ? 3.8 - t * 0.12 : 3.4 - t * 0.18) + trail;
    camera.position.y += (y - camera.position.y) * (1 - Math.pow(0.02, step));
    camera.position.z += (z - camera.position.z) * (1 - Math.pow(0.02, step));
    const perspective = camera as THREE.PerspectiveCamera;
    const targetFov = compact ? 58 : 50;
    if (Math.abs(perspective.fov - targetFov) > 0.01) {
      perspective.fov += (targetFov - perspective.fov) * (1 - Math.pow(0.03, step));
      perspective.updateProjectionMatrix();
    }
    camera.lookAt(0, camera.position.y - (compact ? 0.08 : 0.2), compact ? -2.9 : -2.5);
  });
  return null;
}

export function ForestStage({
  progressRef,
  active,
  className,
}: {
  /** 0 at the top of the chapter, 1 at its end. */
  progressRef: { current: number };
  active: boolean;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const pointer = useRef(new THREE.Vector2(4, 4));
  // One disturbance for the whole wood. Every plant and the floor read it.
  const ripple = useRef(createForestRipple());
  const [onScreen, setOnScreen] = useState(false);
  const [tabVisible, setTabVisible] = useState(!document.hidden);
  const [compact, setCompact] = useState(() => window.matchMedia("(max-width: 47.99rem)").matches);
  const reduced = motionIsReduced();
  const graphicsDisabled = graphicsAreDisabled();

  useEffect(() => {
    const media = window.matchMedia("(max-width: 47.99rem)");
    const onChange = () => setCompact(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(
      entry.isIntersecting && entry.intersectionRatio > 0.001,
    ), {
      rootMargin: "0px",
    });
    observer.observe(host);
    const onVisibility = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // The pointer arrives from the shared signal, so a finger sweeping down the
  // page parts the foliage exactly as a cursor crossing it does. See PointerBridge.

  const dpr: [number, number] = pointerIsFine() ? [1, 1.5] : [1, 1.25];


  return (
    <div
      ref={hostRef}
      className={[styles.stage, className].filter(Boolean).join(" ")}
      data-foreground-active={active ? "true" : "false"}
    >
      {!graphicsDisabled && !reduced && onScreen ? (
        <Canvas
          className={styles.canvas}
          dpr={dpr}
          frameloop={compact ? "demand" : active && tabVisible ? "always" : "never"}
          camera={{ position: compact ? [0, 0.48, 3.8] : CAMERA_START, fov: compact ? 58 : 50 }}
          gl={{ antialias: true, powerPreference: "low-power", alpha: true }}
        >
          <ReclaimContext />
          <InputFrameInvalidator enabled={compact && tabVisible} />
          <PointerBridge pointer={pointer} reduced={reduced} />
          <ForestRippleDriver pointer={pointer} ripple={ripple} reduced={reduced} />
          <Camera progressRef={progressRef} compact={compact} />
          <SpatialBackdrop
            scrollRef={progressRef}
            reduced={reduced}
            pointer={pointer}
            placement="center"
          />
          <>
            <StarField />
            <ParticleGround ripple={ripple} brush={0.7} at={GROUND_AT} count={compact ? 20_000 : undefined} />
            {(compact ? MOBILE_FOREST : FOREST).map((plant) => (
              <PearlCloud
                key={plant.id}
                url={resolveAppUrl(`/assets/house-adel/${plant.model}-cloud.bin`)}
                /*
                 * The near tree gets most of the phone's particle budget,
                 * because density is what gives it its silhouette. The distant
                 * one and the undergrowth are deliberately sparser: that
                 * difference is the depth separation, not a saving.
                 */
                maxPoints={
                  compact
                    ? plant.id === "tree-primary"
                      ? 19_000
                      : plant.model === "tree"
                        ? 9_000
                        : 8_000
                    : undefined
                }
                size={plant.size}
                position={plant.position}
                rotation={plant.rotation}
                warmth={plant.warmth}
                tint={plant.tint}
                grain={plant.grain}
                sway={plant.sway}
                fadeBase={plant.fadeBase}
                ripple={ripple}
                brush={plant.brush}
              />
            ))}
          </>
        </Canvas>
      ) : null}
    </div>
  );
}
