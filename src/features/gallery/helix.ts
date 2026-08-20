/**
 * The shape of the arrangement, shared by everything that has to agree on it.
 *
 * The sculpture, the plates and the camera all read these. Keeping them here
 * rather than beside a component is what makes the rig one rig: there is no
 * second copy of the turn or the descent to drift out of step with the first.
 */

/** Radius of the orbit, in the same unit box the sculpture is normalised to. */
export const RADIUS = 0.34;
/** Vertical travel per full turn. */
export const PITCH = 0.5;
/** How far the front plate comes toward the camera. */
export const APPROACH = 0.14;
/** Turns of the helix across the whole chapter. */
export const TURNS = 1.15;

/**
 * How far the camera descends across the chapter, in scene units.
 *
 * The sculpture is far taller than the frame, so the chapter reads it the way you
 * would read a standing figure: from the head down. The plates ride the same
 * descent, because a camera that moves while the gallery does not would simply
 * leave the gallery behind.
 */
// Measured against the sculpture, not guessed. It is shorter now that the form
// sits inside the frame rather than overflowing it: the descent still runs head
// to plinth, but that is a shorter journey than it was.
export const PAN = 0.34;

export function panFor(progress: number) {
  return -PAN * Math.min(Math.max(progress, 0), 1);
}
