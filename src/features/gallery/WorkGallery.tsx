import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Project } from "../../data/work";
import { drawCardFace } from "./cardFace";
import { APPROACH, PITCH, RADIUS, TURNS, panFor } from "./helix";

/**
 * Work as a spatial gallery: a sculpture at the centre, the projects winding
 * around it on a helix, and scroll turning the whole arrangement.
 *
 * The geometry is a vertical helix rather than a ring. A ring puts every project
 * at the same height, so turning it reads as a carousel and the eye has nothing to
 * follow; giving the helix pitch means each project also rises as it comes round,
 * and scrolling reads as travelling up a spine rather than spinning a wheel.
 *
 * Scroll maps to one angle. Everything else is derived from each project's angular
 * distance from the front: how near the camera it sits, how large, how bright, and
 * which one is active. Nothing is keyframed and no project is a special case, so
 * adding projects to `data/work.ts` extends the helix without touching this file.
 */


export function ProjectPlane({
  project,
  index,
  count,
  progressRef,
  onActive,
  language,
  morphRef,
}: {
  project: Project;
  index: number;
  count: number;
  progressRef: { current: number };
  onActive: (index: number) => void;
  language: "en" | "id";
  /** 0 while Home still holds the stage, 1 once Work does. */
  morphRef: { current: number };
}) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const edgeRef = useRef<THREE.MeshStandardMaterial>(null);
  const shot = useTextureOrNull(project.image);

  // The face carries the project's own type. Rebuilt only when the project or the
  // language changes, never per frame.
  const face = useMemo(() => drawCardFace(project, language), [project, language]);
  const edge = useMemo(
    () => ({ color: "#1a1815", roughness: 0.55, metalness: 0.1, transparent: true }) as const,
    [],
  );
  useEffect(() => () => face.dispose(), [face]);

  // Evenly spaced around the helix, with a little breathing room at each end so
  // the first and last projects are not on top of each other at the extremes.
  const base = count > 1 ? (index / count) * Math.PI * 2 : 0;

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    // Nothing of the gallery exists until the crossing has begun. Left visible on
    // Home the plates floated in front of the relief, advertising a chapter the
    // reader had not reached yet.
    const arrival = Math.min(Math.max((morphRef.current - 0.35) / 0.5, 0), 1);
    group.visible = arrival > 0.001;
    if (!group.visible) return;

    const turn = progressRef.current * TURNS * Math.PI * 2;
    let a = base - turn;
    // Wrapped into (-π, π] so "distance from the front" is always the short way
    // round; without it a project crossing behind the sculpture would sweep the
    // long way and read as a snap.
    a = Math.atan2(Math.sin(a), Math.cos(a));

    const front = Math.cos(a) * 0.5 + 0.5;
    const near = front * front;

    group.position.set(
      Math.sin(a) * RADIUS,
      (-a / (Math.PI * 2)) * PITCH + panFor(progressRef.current),
      Math.cos(a) * RADIUS + near * APPROACH,
    );
    // Always turned toward the viewer, so a project is never read edge-on.
    group.rotation.y = Math.sin(a) * 0.5;
    const scale = 0.78 + near * 0.34;
    group.scale.setScalar(scale);

    const opacity = (0.14 + near * 0.86) * arrival;
    if (materialRef.current) materialRef.current.opacity = opacity;
    if (edgeRef.current) edgeRef.current.opacity = opacity * 0.85;

    if (near > 0.985) onActive(index);
  });

  return (
    <group ref={groupRef}>
      {/*
        A plate, not a decal. Real thickness means the card catches the light on
        its edge as it turns, which is most of what makes it read as an object in
        the space rather than an image floating in it.

        The face is painted onto the box's own front face rather than laid on a
        separate plane in front of it. A plane parked half a millimetre proud of a
        surface is two surfaces at effectively the same depth, and the depth buffer
        cannot choose between them: which one wins varies per pixel and per frame,
        so the card fizzed and tore as it rotated. A box face cannot fight itself.

        BoxGeometry groups its faces in the order +X, -X, +Y, -Y, +Z, -Z, so slot
        four is the one turned toward the viewer.
      */}
      <mesh>
        <boxGeometry args={[0.26, 0.163, 0.006]} />
        <meshStandardMaterial attach="material-0" ref={edgeRef} {...edge} />
        <meshStandardMaterial attach="material-1" {...edge} />
        <meshStandardMaterial attach="material-2" {...edge} />
        <meshStandardMaterial attach="material-3" {...edge} />
        <meshStandardMaterial
          attach="material-4"
          ref={materialRef}
          map={shot ?? face}
          roughness={0.75}
          metalness={0}
          transparent
          toneMapped={false}
        />
        <meshStandardMaterial attach="material-5" {...edge} />
      </mesh>
    </group>
  );
}

function useTextureOrNull(src: string | undefined) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    if (!src) return;
    let dead = false;
    const loader = new THREE.TextureLoader();
    loader.load(src, (loaded) => {
      if (dead) {
        loaded.dispose();
        return;
      }
      loaded.colorSpace = THREE.SRGBColorSpace;
      setTexture(loaded);
    });
    return () => {
      dead = true;
    };
  }, [src]);
  useEffect(() => () => texture?.dispose(), [texture]);
  return texture;
}
