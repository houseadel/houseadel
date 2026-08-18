import { useFrame, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import type * as THREE from "three";
import { onPointerActivity, pointerSignal } from "../../lib/pointerSignal";

/**
 * Feeds the shared pointer into a scene's own pointer uniform.
 *
 * Every WebGL scene on the site keeps a `Vector2` in normalised device
 * coordinates that its shaders read. Each of them used to fill that vector from
 * its own `pointermove` listener, behind its own `pointer: fine` check — which
 * is why a finger drove none of them. This copies the one shared signal into
 * that vector on the render clock instead, so a mouse and a finger arrive at the
 * shaders through exactly the same path and the scene never learns which it was.
 *
 * It also asks for a frame when the pointer moves. The phone scenes run
 * `frameloop="demand"` to keep an idle device cool, and a reaction nobody
 * schedules a frame for is a reaction nobody sees.
 */
export function PointerBridge({
  pointer,
  reduced = false,
}: {
  pointer: { current: THREE.Vector2 };
  reduced?: boolean;
}) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (reduced) return;
    return onPointerActivity(() => invalidate());
  }, [invalidate, reduced]);

  useFrame(() => {
    if (reduced) {
      // Parked off-screen: every shader treats anything outside the clip range
      // as "no pointer", which is the correct reading when motion is reduced.
      pointer.current.set(4, 4);
      return;
    }
    const signal = pointerSignal();
    pointer.current.set(signal.x, signal.y);
  });

  return null;
}
