/**
 * Whether the opening has already run.
 *
 * The record is what makes a second arrival quiet, so it is also the only thing
 * standing between a visitor and seeing the opening again. It lives here rather
 * than inside the loader component so that anything needing to read or clear it —
 * the studies index offers to run the opening a second time — can do so without a
 * copy of the key to keep in step, and without importing a component to reach a
 * string.
 *
 * Session storage rather than local: the opening is part of arriving, so a new
 * tab should get it. Every access is guarded, because storage can be unavailable
 * in a privacy-restricted browsing context and the opening must still run there.
 */
const LOADER_VISIT_KEY = "house-adel:loader-seen";

export function openingHasRun() {
  try {
    return window.sessionStorage.getItem(LOADER_VISIT_KEY) === "true";
  } catch {
    return false;
  }
}

export function rememberOpeningRun() {
  try {
    window.sessionStorage.setItem(LOADER_VISIT_KEY, "true");
  } catch {
    // Storage can be unavailable in a privacy-restricted browsing context.
  }
}

/**
 * Forgets that the opening has run, so the next document gets it again.
 *
 * The caller has to load a fresh document afterwards: the opening is mounted once
 * per document and released for good when it completes, so clearing the record
 * alone changes nothing about the page it was cleared on.
 */
export function forgetOpeningRun() {
  try {
    window.sessionStorage.removeItem(LOADER_VISIT_KEY);
  } catch {
    // Storage can be unavailable in a privacy-restricted browsing context.
  }
}
