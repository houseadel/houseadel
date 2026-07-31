import {
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useSyncExternalStore,
} from "react";

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

export function navigate(to: string, options: { replace?: boolean } = {}) {
  const current = getSnapshot();
  if (to === current) return;
  if (options.replace) {
    window.history.replaceState({}, "", to);
  } else {
    window.history.pushState({}, "", to);
  }
  window.dispatchEvent(new Event(NAVIGATION_EVENT));
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string;
  children: ReactNode;
};

export function Link({ to, children, onClick, target, ...props }: LinkProps) {
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
      to.startsWith("http") ||
      to.startsWith("mailto:")
    ) {
      return;
    }
    event.preventDefault();
    navigate(to);
  };

  return (
    <a href={to} target={target} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}

export function useRouteEffects(location: string) {
  useEffect(() => {
    const path = location.split(/[?#]/)[0];
    const title =
      path === "/"
        ? "House Adel — Phase 1 Direction Lab"
        : path.includes("fracture")
          ? "Prototype A — SVG / DOM Fracture"
          : path.includes("hybrid")
            ? "Prototype B — Hybrid WebGL Glass"
            : path.includes("cinematic")
              ? "Prototype C — Cinematic Compositing"
              : path.includes("studies")
                ? "House Adel — Fictional Project Study"
                : "House Adel — Direction Lab";
    document.title = title;

    let observer: MutationObserver | null = null;
    let timeout = 0;
    const focusHeading = () => {
      const heading = document.querySelector<HTMLElement>("[data-route-heading]");
      if (!heading) return false;
      heading.focus();
      observer?.disconnect();
      window.clearTimeout(timeout);
      return true;
    };
    const frame = window.requestAnimationFrame(() => {
      if (focusHeading()) return;
      observer = new MutationObserver(() => focusHeading());
      observer.observe(document.body, { childList: true, subtree: true });
      timeout = window.setTimeout(() => observer?.disconnect(), 3_000);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      observer?.disconnect();
    };
  }, [location]);
}
