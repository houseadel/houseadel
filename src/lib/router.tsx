import {
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
  forwardRef,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import { resolveAppUrl, stripAppBasePath, updateCanonicalLink } from "./basePath";
import { chapterForPath } from "./chapters";
import { transitionIsRunning } from "../features/transition/transitionClock";

const NAVIGATION_EVENT = "house-adel:navigate";

const subscribers = new Set<() => void>();
let listenersAttached = false;

/*
 * Which way through history a popstate went.
 *
 * A transition that changes spatial direction has to know whether the reader is
 * going deeper or coming back, and `popstate` does not say. Every entry this
 * router creates is stamped with a monotonic index, so comparing the index that
 * arrives against the one that left answers it. Entries the router did not
 * create — a hash link, a restored session — carry no stamp, and those are
 * reported as forward, which is the safe reading of "no idea".
 */
const HISTORY_INDEX_KEY = "houseAdelHistoryIndex";

function readHistoryIndex(): number | null {
  const state = window.history.state as Record<string, unknown> | null;
  const value = state?.[HISTORY_INDEX_KEY];
  return typeof value === "number" ? value : null;
}

let historyIndex = 0;
let historyDirection: "forward" | "back" = "forward";

/** The direction of the most recent history navigation. */
export function lastHistoryDirection() {
  return historyDirection;
}

function notifySubscribers() {
  subscribers.forEach((callback) => callback());
}

type HistoryNavigationInterceptor = (to: string) => boolean;
let historyNavigationInterceptor: HistoryNavigationInterceptor | null = null;

function handlePopState() {
  const destination = getSnapshot();
  const arrived = readHistoryIndex();
  historyDirection = arrived !== null && arrived < historyIndex ? "back" : "forward";
  if (arrived !== null) historyIndex = arrived;
  if (historyNavigationInterceptor?.(destination)) return;
  notifySubscribers();
}

function attachListeners() {
  if (listenersAttached) return;
  window.addEventListener("popstate", handlePopState);
  window.addEventListener(NAVIGATION_EVENT, notifySubscribers);
  listenersAttached = true;
}

function detachListeners() {
  if (!listenersAttached || subscribers.size > 0) return;
  window.removeEventListener("popstate", handlePopState);
  window.removeEventListener(NAVIGATION_EVENT, notifySubscribers);
  listenersAttached = false;
}

function subscribe(callback: () => void) {
  subscribers.add(callback);
  attachListeners();
  return () => {
    subscribers.delete(callback);
    detachListeners();
  };
}

function getSnapshot() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function getServerSnapshot() {
  return "/";
}

export function useLocation() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export type NavigationOptions = { replace?: boolean; immediate?: boolean };
type NavigationInterceptor = (to: string, options: NavigationOptions) => boolean;

let navigationInterceptor: NavigationInterceptor | null = null;

export function setNavigationInterceptor(interceptor: NavigationInterceptor) {
  navigationInterceptor = interceptor;
  return () => {
    if (navigationInterceptor === interceptor) navigationInterceptor = null;
  };
}

export function setHistoryNavigationInterceptor(interceptor: HistoryNavigationInterceptor) {
  historyNavigationInterceptor = interceptor;
  return () => {
    if (historyNavigationInterceptor === interceptor) historyNavigationInterceptor = null;
  };
}

/**
 * A popstate has already moved the browser's history cursor and URL. This
 * publishes that location to React only after the transition has covered the
 * outgoing page, without pushing or replacing another history entry.
 */
export function commitHistoryNavigation() {
  window.dispatchEvent(new Event(NAVIGATION_EVENT));
}

export function commitNavigation(to: string, options: NavigationOptions = {}) {
  const destination = new URL(to, window.location.href);
  const target = `${destination.pathname}${destination.search}${destination.hash}`;
  const current = getSnapshot();
  if (target === current) return;
  // A replace stays at the same depth; a push goes one deeper. The stamp is what
  // lets a later popstate be read as back rather than forward.
  if (!options.replace) historyIndex += 1;
  historyDirection = "forward";
  window.history[options.replace ? "replaceState" : "pushState"](
    { [HISTORY_INDEX_KEY]: historyIndex },
    "",
    target,
  );
  window.dispatchEvent(new Event(NAVIGATION_EVENT));
}

export function navigate(to: string, options: NavigationOptions = {}) {
  if (!options.immediate && navigationInterceptor?.(to, options)) return;
  const resolved = resolveAppUrl(to);
  commitNavigation(resolved, options);
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string;
  children: ReactNode;
};

function isExternal(to: string) {
  return /^(?:https?:|mailto:|tel:)/i.test(to);
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { to, children, onClick, target, ...props },
  ref,
) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      target === "_blank" ||
      isExternal(to) ||
      to.startsWith("#")
    ) {
      return;
    }

    const destination = new URL(to, window.location.origin);
    if (destination.origin !== window.location.origin) return;
    event.preventDefault();
    navigate(`${destination.pathname}${destination.search}${destination.hash}`);
  };

  return (
    <a ref={ref} href={resolveAppUrl(to)} target={target} onClick={handleClick} {...props}>
      {children}
    </a>
  );
});

/**
 * Puts the reader where the destination says they should be.
 *
 * Exported because the route transition has to perform this itself, at the exact
 * moment the incoming page still covers the frame. During a transition the
 * outgoing route is still in normal flow and still visible, so moving the
 * document scroll at any earlier moment would visibly drag it.
 */
/**
 * Moves the document so `target` sits at the top of it.
 *
 * Deliberately not `scrollIntoView`. During a transition the incoming route
 * lives inside a fixed, clipped layer, and that layer is a scroll container —
 * so `scrollIntoView` scrolls *it* and leaves the document exactly where the
 * outgoing page had it. The reader then lands at the wrong offset the instant
 * the layer returns to normal flow, which is how a Back into a chapter came out
 * a couple of hundred pixels from where it should be.
 *
 * The offset of the target within its own route shell is the offset it will
 * have in the document once that shell is in flow, so measuring against the
 * shell is correct in both states and needs no knowledge of which one it is in.
 */
function scrollDocumentTo(target: HTMLElement) {
  const shell = target.closest<HTMLElement>("[data-route-shell]");
  const top = shell
    ? target.getBoundingClientRect().top - shell.getBoundingClientRect().top
    : target.getBoundingClientRect().top + window.scrollY;
  /*
   * `scroll-margin-top` is the browser's own answer to a header that floats over
   * the page, and this function is standing in for the browser. Without reading
   * it, a fragment link put the thing it addressed exactly underneath the
   * chrome — and worse, silently overrode the margin-aware scroll the browser
   * had already begun, so the clause slid into view correctly and was then
   * yanked up behind the header a frame later. Anything with no margin declared
   * reads zero and behaves exactly as before.
   */
  const margin = Number.parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;
  window.scrollTo({ top: Math.max(top - margin, 0), left: 0, behavior: "instant" });
}

export function scrollForLocation(location: string) {
  const url = new URL(location, window.location.origin);
  if (url.hash) {
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (target) {
      scrollDocumentTo(target);
      return;
    }
  }

  const pathname = stripAppBasePath(url.pathname.replace(/\/+$/, "")) || "/";
  const chapter = chapterForPath(pathname);
  if (chapter && chapter.id !== "home") {
    const target = document.querySelector<HTMLElement>(`[data-chapter="${chapter.id}"]`);
    if (target) {
      scrollDocumentTo(target);
      return;
    }
  }
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

export function useRouteEffects(location: string, title: string) {
  const isInitialDocument = useRef(true);

  useEffect(() => {
    document.title = title;
    updateCanonicalLink(stripAppBasePath(window.location.pathname.replace(/\/+$/, "")) || "/");
    const shouldFocusHeading = !isInitialDocument.current;
    isInitialDocument.current = false;
    let frame = 0;
    let attempts = 0;
    let cancelled = false;

    const settleRoute = () => {
      if (cancelled) return;
      /*
       * A transition owns the viewport while it runs: both routes are on screen,
       * the outgoing one is still in normal flow, and scrolling or moving focus
       * now would be visible on the page the reader is still looking at. The
       * transition performs the scroll itself at the moment it is safe; this
       * waits, without spending its attempts, and then settles focus.
       */
      if (transitionIsRunning()) {
        frame = window.requestAnimationFrame(settleRoute);
        return;
      }
      const heading = document.querySelector<HTMLElement>("[data-route-heading]");
      if (!heading && attempts < 12) {
        attempts += 1;
        frame = window.requestAnimationFrame(settleRoute);
        return;
      }

      scrollForLocation(location);
      if (shouldFocusHeading) heading?.focus({ preventScroll: true });
    };

    frame = window.requestAnimationFrame(settleRoute);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [location, title]);
}
