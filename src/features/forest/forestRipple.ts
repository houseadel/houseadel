/**
 * One disturbance, shared by everything standing in it.
 *
 * The wood used to answer the hand plant by plant: each cloud raycast the
 * pointer onto its own plane, tested the hit against its own bounding sphere,
 * and lifted only if the cursor was inside it. Two consequences, both wrong for
 * a place. A fern a hand's width from the cursor stayed perfectly still while
 * the one under it moved, so the forest read as five separate models that happen
 * to be arranged together; and the ripple began at a different moment for each
 * of them, so nothing ever crossed the wood.
 *
 * This is the whole state of the disturbance, held once per scene: where the
 * hand is, how hard the air is being pushed, and how far the current wavefront
 * has travelled. Every cloud and the floor read these same three numbers and
 * measure their response in the frame the visitor is looking at, so a ripple
 * crosses canopy, foliage and ground together, at once, as one surface.
 */
export type ForestRipple = {
  /** Pointer in normalised device coordinates, shared by the whole scene. */
  x: number;
  y: number;
  /** How disturbed the wood is, 0 to 1. */
  strength: number;
  /** Seconds since the current wavefront left the pointer. */
  age: number;
};

export function createForestRipple(): ForestRipple {
  return { x: 4, y: 4, strength: 0, age: 4 };
}

/** Beyond this the wavefront has crossed the frame and is spent. */
export const WAVE_LIFETIME = 1.15;
