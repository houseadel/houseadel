import {
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
  forwardRef,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import { resolveAppUrl } from "./basePath";

const NAVIGATION_EVENT = "house-adel:navigate";

function subscribe(callback: () => void) {
  window.addEventListener("popstate", callback);
  window.addEventListener(NAVIGATION_EVENT, callback);
  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener(NAVIGATION_EVENT, callback);
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

export function commitNavigation(to: string, options: NavigationOptions = {}) {
  const destination = new URL(to, window.location.href);
  const target = `${destination.pathname}${destination.search}${destination.hash}`;
  const current = getSnapshot();
  if (target === current) return;
  window.history[options.replace ? "replaceState" : "pushState"]({}, "", target);
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

function scrollForLocation(location: string) {
  const url = new URL(location, window.location.origin);
  if (url.hash) {
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (target) {
      target.scrollIntoView({ block: "start" });
      return;
    }
  }
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

export function useRouteEffects(location: string, title: string) {
  const isInitialDocument = useRef(true);

  useEffect(() => {
    document.title = title;
    const shouldFocusHeading = !isInitialDocument.current;
    isInitialDocument.current = false;
    let frame = 0;
    let attempts = 0;
    let cancelled = false;

    const settleRoute = () => {
      if (cancelled) return;
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
