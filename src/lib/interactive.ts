/**
 * What counts as a control, in one place.
 *
 * The site has a page-wide gesture — clicking the background toggles sound — and
 * a gesture that broad is only safe if it can tell a control from the room the
 * control is standing in. Deciding that per listener means each one carries its
 * own half-remembered list, and the half that is forgotten is where a link
 * silently mutes the score on its way to the next page.
 *
 * The rule is semantic rather than visual. Anything the platform treats as
 * operable — a real element, an ARIA role standing in for one, or an author
 * making something focusable by hand — is a control, whatever it looks like.
 * Grouping roles are included on purpose: the gap between two radios inside a
 * radiogroup belongs to the widget, not to the page.
 */
export const INTERACTIVE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button",
  "input",
  "select",
  "textarea",
  "label",
  "summary",
  "details",
  "option",
  "optgroup",
  "audio[controls]",
  "video[controls]",
  "iframe",
  "embed",
  "object",
  'form [type="submit"]',
  '[contenteditable]:not([contenteditable="false"])',
  // Author-made focusables. `-1` is deliberately excluded: it marks a target for
  // programmatic focus — the main landmark carries one — not something to operate.
  '[tabindex]:not([tabindex="-1"])',
  '[role="button"]',
  '[role="link"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="radiogroup"]',
  '[role="switch"]',
  '[role="slider"]',
  '[role="spinbutton"]',
  '[role="textbox"]',
  '[role="searchbox"]',
  '[role="combobox"]',
  '[role="listbox"]',
  '[role="option"]',
  '[role="menu"]',
  '[role="menubar"]',
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  '[role="menuitemradio"]',
  '[role="tab"]',
  '[role="tablist"]',
  '[role="treeitem"]',
  // The site's own mark for anything that answers to a press. Everything wearing
  // it is already a link or a button; it is listed so that stays true by
  // construction rather than by coincidence.
  "[data-sonic]",
].join(",");

/**
 * The control a click landed in, or null if it landed on the page.
 *
 * The answer comes from `composedPath()` rather than from `closest()` on the
 * target, and the difference is not academic. React dispatches its own handlers
 * at the root container and flushes discrete updates synchronously, so a control
 * has already re-rendered by the time an event reaches a listener on `window`.
 * The language toggle in the header is the case that proved it: pressing it
 * swaps the word, the effect that splits that word into per-letter spans throws
 * the old spans away, and the span the visitor actually clicked is an orphan
 * with no parent by the time this runs. `closest()` climbs from a node that is
 * no longer under its button and finds nothing, so the press reads as a click on
 * bare page and the score cuts out.
 *
 * `composedPath()` is computed when the event is dispatched and does not change
 * afterwards, so it still holds the button, the nav, the header and everything
 * above them exactly as they were when the visitor pressed. Walking it also
 * keeps the nesting right for free: a label, an icon, an SVG path or a span
 * inside a button all resolve to the button, from wherever inside it the browser
 * says the click landed.
 */
export function interactiveTarget(event: Event): Element | null {
  const path = typeof event.composedPath === "function" ? event.composedPath() : [];
  for (const node of path) {
    if (node instanceof Element && node.matches(INTERACTIVE_SELECTOR)) return node;
  }
  // Only reachable if the path is empty — the event is no longer being
  // dispatched — in which case the live tree is the best answer available.
  if (path.length) return null;
  const target = event.target;
  return target instanceof Element ? target.closest(INTERACTIVE_SELECTOR) : null;
}

/**
 * Whether a click should be treated as a click on the page itself.
 *
 * Anything aimed at a control is not, and neither is a gesture that was never a
 * plain press: a modified click is on its way somewhere else — on macOS
 * control-click is the context menu — and a click something has already handled
 * has an owner. Keyboard activation arrives here as a click with button 0, so
 * operating a control with Enter or the space bar is caught by the selector
 * above exactly as pressing it with a pointer is.
 */
export function isBackgroundClick(event: MouseEvent): boolean {
  if (event.button !== 0 || event.defaultPrevented) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  return interactiveTarget(event) === null;
}
