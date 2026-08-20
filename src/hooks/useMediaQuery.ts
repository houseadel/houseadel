import { useEffect, useState } from "react";

/**
 * A media query, as a value the render can read.
 *
 * `lib/preferences` answers these questions once, at first render, which is the
 * right shape for a capability that will not change during a visit. A breakpoint
 * will: a window is resized, a phone is turned. Where a scene has to be composed
 * differently — not merely restyled — the difference cannot be expressed in CSS,
 * because what changes is an argument to the renderer rather than a property of
 * a box, so the query has to be subscribed to rather than sampled.
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    // Read once on subscribe as well as on change: the query may have started
    // matching between first render and this effect.
    setMatches(media.matches);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
