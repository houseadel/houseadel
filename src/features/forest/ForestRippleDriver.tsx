import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";
import { pointerSignal } from "../../lib/pointerSignal";
import { WAVE_LIFETIME, type ForestRipple } from "./forestRipple";

/** Pointer travel per second, in NDC, that counts as pushing the air hard. */
const FULL_PUSH = 1.6;

/**
 * Drives the scene's shared disturbance.
 *
 * One per scene, and inside the canvas so it runs on the render clock rather
 * than on a timer of its own. It owns the only decision about *when* the wood is
 * disturbed; every cloud decides only how much of that reaches it.
 */
export function ForestRippleDriver({
  pointer,
  ripple,
  reduced = false,
}: {
  pointer: { current: THREE.Vector2 };
  ripple: { current: ForestRipple };
  reduced?: boolean;
}) {
  const previous = useRef({ x: 4, y: 4 });
  const wasInside = useRef(false);
  const { invalidate } = useThree();

  useFrame((_, delta) => {
    const step = Math.min(delta, 0.05);
    const state = ripple.current;
    const now = pointer.current;
    const inside = Math.abs(now.x) <= 1.05 && Math.abs(now.y) <= 1.05;

    state.x = now.x;
    state.y = now.y;

    const last = previous.current;
    const travelled = last.x > 2 || !inside ? 0 : Math.hypot(now.x - last.x, now.y - last.y);
    previous.current = inside ? { x: now.x, y: now.y } : { x: 4, y: 4 };

    // One wavefront when the hand arrives, not one per plant it happens to pass.
    if (inside && !wasInside.current) state.age = 0;
    wasInside.current = inside;

    if (reduced || !inside) {
      state.strength += (0 - state.strength) * (1 - Math.pow(0.02, step));
    } else {
      // A resting hand still parts the air a little; a moving one parts it a lot.
      //
      // Scaled by how present the pointer is, which is what makes a finger work
      // as a pointer at all: a mouse is always somewhere, but a finger stops
      // existing when it is lifted, and the wood should settle over the same
      // half-second the touch fades rather than snapping flat the instant
      // contact ends.
      const target =
        Math.min(0.28 + (travelled / Math.max(step, 0.001) / FULL_PUSH) * 0.72, 1) *
        pointerSignal().presence;
      const rate = target > state.strength ? 0.004 : 0.05;
      state.strength += (target - state.strength) * (1 - Math.pow(rate, step));
    }

    if (state.age < WAVE_LIFETIME) {
      state.age += step;
      invalidate();
    }
  });

  return null;
}
