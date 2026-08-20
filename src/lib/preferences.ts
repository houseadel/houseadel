export function motionIsReduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function forcedColorsActive() {
  return window.matchMedia("(forced-colors: active)").matches;
}

export function pointerIsFine() {
  return window.matchMedia("(pointer: fine)").matches;
}

/** Explicit static mode used when WebGL is unavailable or intentionally skipped. */
export function graphicsAreDisabled() {
  try {
    return window.localStorage.getItem("house-adel:graphics") === "fallback";
  } catch {
    return false;
  }
}

export function interactionLayerDisabled() {
  return motionIsReduced() || forcedColorsActive() || !pointerIsFine();
}
