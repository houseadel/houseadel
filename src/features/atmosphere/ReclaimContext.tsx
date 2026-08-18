import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import type * as THREE from "three";
import { onTransitionFrame, transitionIsRunning } from "../transition/transitionClock";

/**
 * Hands the GPU its contexts back, and makes sure none are left behind.
 *
 * A browser allows a page only a small number of live WebGL contexts — around
 * sixteen in Chromium — and when a new one would exceed that it does not fail
 * the request. It silently kills the *oldest* context instead, and never
 * restores it. The symptom is the one hardest to connect back to its cause: a
 * sculpture that was there a moment ago is simply gone, on a page that is
 * otherwise working perfectly.
 *
 * Disposing a renderer is not the same as releasing its context. `dispose()`
 * frees what three allocated and leaves the context alive until it is garbage
 * collected, which may be many navigations later. Measured across five round
 * trips between Home and Contact, contexts belonging to canvases that had long
 * since left the document climbed one, three, five, nine, eleven — and the
 * sculptures on screen started being evicted to make room for them.
 *
 * So there are two halves here.
 *
 * **Release on unmount**, which handles the ordinary case immediately, and
 * **sweep the orphans**, which handles the rest. A context whose canvas is no
 * longer in the document can never draw anything again by definition, so taking
 * it back is always safe — and doing it by inspection rather than by trusting
 * every teardown path to fire is what actually holds the count down. Unmount
 * ordering under a router that keeps two route trees alive at once has more
 * paths through it than are worth enumerating.
 */

/** Every renderer currently believed to hold a context. */
const live = new Set<THREE.WebGLRenderer>();
/** Renderers whose component has gone, waiting for the next safe moment. */
const orphans = new Set<THREE.WebGLRenderer>();

function release(renderer: THREE.WebGLRenderer) {
  live.delete(renderer);
  orphans.delete(renderer);
  try {
    // Marked first: stages listen for `webglcontextlost` and rebuild themselves
    // when the browser takes a context away. This loss is deliberate, and
    // answering it would immediately rebuild what is being released.
    renderer.domElement.dataset.reclaimed = "true";
    renderer.forceContextLoss();
  } catch {
    // Already gone, or the extension is unavailable. Either way there is nothing
    // left to reclaim, and nothing here worth failing an unmount for.
  }
}

/**
 * Takes back every context whose canvas has left the document.
 *
 * Run when a route transition finishes, because that is the moment the outgoing
 * page's scenes are torn down and therefore the moment orphans appear.
 */
function sweepOrphanedContexts() {
  for (const renderer of [...orphans]) {
    if (!renderer.domElement.isConnected) release(renderer);
  }
  for (const renderer of [...live]) {
    if (!renderer.domElement.isConnected) release(renderer);
  }
}

let sweeping = false;

function startSweeping() {
  if (sweeping) return;
  sweeping = true;
  onTransitionFrame(() => {
    if (transitionIsRunning()) return;
    sweepOrphanedContexts();
  });
}

export function ReclaimContext() {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    live.add(gl);
    startSweeping();
    return () => {
      /*
       * Deregistered, not released here.
       *
       * Forcing the loss inside the unmount cleanup runs while three is still
       * tearing the renderer down and, measured, cost *sibling* stages their
       * contexts — Home stopped drawing on roughly half of all returns. The
       * sweep below does the same job a moment later, once the canvas is
       * genuinely out of the document and nothing is mid-teardown, which is both
       * safe and sufficient.
       */
      live.delete(gl);
      orphans.add(gl);
    };
  }, [gl]);

  return null;
}
