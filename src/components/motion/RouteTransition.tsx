import { useEffect, useRef } from "react";
import {
  commitHistoryNavigation,
  commitNavigation,
  lastHistoryDirection,
  scrollForLocation,
  setHistoryNavigationInterceptor,
  setNavigationInterceptor,
} from "../../lib/router";
import { stripAppBasePath } from "../../lib/basePath";
import { routeIdentity } from "../../lib/chapters";
import { loadPointCloud } from "../../features/gallery/pointCloud";
import { sculptureForPath } from "../../features/relief/sculptures";
import { forcedColorsActive, graphicsAreDisabled, motionIsReduced } from "../../lib/preferences";
import { pointerSignal } from "../../lib/pointerSignal";
import {
  buildDissolveField,
  contourPath,
  fieldResolution,
  thresholdFor,
  type DissolveField,
} from "../../features/transition/dissolveField";
import type { DissolveHandle } from "../../features/transition/dissolveRenderer";
import {
  cancelTransition,
  onTransitionFrame,
  primeTransitionRuntime,
  runTransition,
  transitionIsRunning,
  transitionState,
  type TransitionMode,
} from "../../features/transition/transitionClock";
import styles from "./RouteTransition.module.css";

/**
 * House Adel's route transition: an organic dissolve, driven by navigation.
 *
 * The principle: the site is monochrome until its surface is disturbed, and
 * navigating disturbs it. The outgoing page loses coherence along an irregular
 * boundary that travels across the frame, a thin spectral edge appears where the
 * material is actually coming apart, and the next page is already there behind
 * the openings. Then the colour goes, and what is left is sharp, monochrome and
 * interactive.
 *
 * **The boundary exists in two places at once, from one source.** A coarse field
 * of layered noise plus a directional gradient is generated on the CPU for each
 * navigation. The document reads it through marching squares and clips the
 * incoming route to the resulting vector contour; the shader reads the same grid
 * as a texture and draws the material breaking apart along it. Because both
 * consume the same numbers, the rim always sits exactly on the cut.
 *
 * **Neither page is ever a picture.** Both routes are live DOM for the whole
 * movement — real text, real fonts, real WebGL scenes — layered by the two slots
 * in `SiteLayout`. Nothing is rasterised, captured or copied, which is what makes
 * this sharp at any device pixel ratio and immune to the pixelation that the
 * effect it replaces suffered from. A vector clip has no resolution to lose.
 *
 * **Three parts, deliberately independent.**
 *
 * - `transitionClock` owns the time and the commit. Nothing it does depends on
 *   WebGL, so a dead GPU cannot strand anyone on the wrong URL.
 * - The clip path is pure DOM and needs no GPU at all, so the organic dissolve
 *   survives a machine with no WebGL — it simply loses its spectral edge.
 * - `dissolveRenderer` draws that edge, from one context built once and reused.
 *   It is free to fail; when it does, it is merely absent.
 *
 * Every navigation arrives through the router's interceptors rather than a
 * link's click handler, so the navbar, project links, calls to action,
 * programmatic changes and the browser's own Back and Forward all reach the same
 * code — history included, which is the one that usually gets missed.
 */

/**
 * Warm the destination's chunk before it is revealed.
 *
 * Every route but Home is a lazy import, and the incoming page is now mounted at
 * the *start* of the movement rather than the middle — so a chunk that has not
 * arrived renders the Suspense fallback, and that fallback would be revealed
 * through the openings. The fetch is started the instant a navigation is
 * intercepted, which on any normal connection is comfortably enough.
 *
 * Nothing waits on this. If the chunk is slow the movement runs anyway and
 * Suspense does its job; this only removes the common case.
 */
function warmRoute(pathname: string) {
  const load = () => {
    if (pathname === "/" || pathname === "/work") return null;
    if (pathname === "/marvell-20") return import("../../pages/MarvellTwentyPage");
    if (pathname === "/contact" || pathname === "/begin-a-project") {
      return import("../../pages/ContactPage");
    }
    if (pathname === "/enquiry-received") return import("../../pages/EnquiryReceivedPage");
    if (pathname === "/privacy") return import("../../pages/PrivacyPage");
    if (pathname === "/terms") return import("../../pages/TermsPage");
    return import("../../pages/NotFoundPage");
  };
  try {
    void load()?.catch(() => undefined);
  } catch {
    // A failed warm is not a failed navigation.
  }

  /*
   * And the destination's sculpture, which is the slower half.
   *
   * On a first visit the loader holds the site back until the landing page's
   * cloud has arrived, but a navigation has no loader — so without this the
   * dissolve would finish and hand over a page whose subject was still
   * downloading. Started here, it decodes across the whole movement and is
   * cached by the time the stage on the other side asks for it.
   *
   * Nothing waits on it. If it is slow the transition still lands on time and
   * the sculpture resolves into a page that is already there, which is the
   * behaviour this only reduces rather than removes.
   */
  const sculpture = sculptureForPath(pathname);
  if (sculpture) void loadPointCloud(sculpture).catch(() => undefined);
}

/**
 * Which way the breakup travels: the direction along which the field *rises*, so
 * the incoming page appears first at the low end and last at the high end.
 *
 * Going forward, it opens out of the place the reader pressed. That is the whole
 * argument for deriving it from the pointer rather than picking a fixed axis: the
 * next page emerges from the thing that was acted on, so the movement belongs to
 * the gesture that caused it instead of being played at the reader.
 *
 * Going back reverses it exactly, so returning retraces the movement that brought
 * you here rather than performing an unrelated one. Back usually has no pointer
 * at all — it is a browser button or a gesture — so it falls through to the
 * reversed default, which is the honest reading of "no idea where you are".
 *
 * The press only bends the direction rather than setting it outright. A link
 * pressed dead centre would otherwise yield no direction at all, and two links a
 * few pixels apart would give two unrelated transitions.
 */
const DEFAULT_FORWARD = { x: 0.78, y: 0.62 };

function directionFor(mode: TransitionMode, origin: { x: number; y: number } | null) {
  const sign = mode === "back" ? -1 : 1;
  const base = { x: DEFAULT_FORWARD.x * sign, y: DEFAULT_FORWARD.y * sign };
  if (!origin) return base;

  // From the press toward the centre: the lowest field values, and therefore the
  // first openings, land where the reader pressed.
  const toCentre = {
    x: 0.5 - origin.x / window.innerWidth,
    y: 0.5 - origin.y / window.innerHeight,
  };
  const length = Math.hypot(toCentre.x, toCentre.y);
  if (length < 0.04) return base;

  const pressed = { x: (toCentre.x / length) * sign, y: (toCentre.y / length) * sign };
  return {
    x: pressed.x * 0.62 + base.x * 0.38,
    y: pressed.y * 0.62 + base.y * 0.38,
  };
}

/** Clip geometry for "nothing is revealed yet", in the syntax `clip-path` wants. */
const EMPTY_CLIP = 'path("M 0 0 Z")';

/**
 * Whether a move between these two routes dissolves at all.
 *
 * Two cases commit immediately instead.
 *
 * Chapters of the continuous document are a scroll, not a navigation: they
 * render the same mounted tree, so there is nothing to dissolve *to*, and
 * transitioning between them used to tear that document down and rebuild it in
 * order to reach a place it was already showing further down the page.
 *
 * The invitation is the other. It is a self-contained experience with its own
 * art direction and none of the site's chrome — no header, no atmosphere, no
 * lens — and that chrome is shared furniture that lives outside both route
 * slots. Dissolving into or out of it would drop the header off the outgoing
 * page on the first frame, while that page is still fully on screen. It keeps
 * the plain, immediate change it has always had.
 */
function dissolvesBetween(from: string, to: string) {
  if (routeIdentity(from) === routeIdentity(to)) return false;
  return true;
}

/**
 * The element inside a slot that carries the camera movement.
 *
 * Both the clip and the scale are written as ordinary inline styles rather than
 * as custom properties. That is not a stylistic preference: custom properties
 * *inherit*, so setting one on a route's wrapper invalidates style for every
 * element beneath it, and doing that sixty times a second on a full page made
 * the browser miss frames badly enough to stall screenshotting entirely. A
 * direct `clip-path` and `transform` touch one element each.
 */
function shellOf(slot: HTMLElement) {
  return slot.firstElementChild as HTMLElement | null;
}

export function RouteTransition({ pathname }: { pathname: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const currentPath = useRef(pathname);
  currentPath.current = pathname;

  const rendererRef = useRef<DissolveHandle | null>(null);
  const fieldRef = useRef<DissolveField | null>(null);
  const startedAt = useRef(0);
  const dissolvingRef = useRef(false);

  /*
   * Both expensive things are made ready while the reader is still reading.
   *
   * GSAP is fetched, and the WebGL context is built once and kept — building it
   * on the first click would put a context creation, a shader compile and a
   * texture upload directly in the navigation path.
   */
  useEffect(() => {
    primeTransitionRuntime();
    /*
     * Whether a given navigation dissolves is decided per navigation, but
     * whether a context is built at all is decided once, here. A reader who has
     * asked for reduced motion, forced colours or the explicit graphics
     * fallback never pays for one; if they change that setting later, the
     * dissolve still runs — the clip is pure DOM — and simply has no rim.
     */
    if (motionIsReduced() || graphicsAreDisabled() || forcedColorsActive()) return;
    let cancelled = false;
    const prepare = () => {
      if (cancelled) return;
      void import("../../features/transition/dissolveRenderer")
        .then(({ ensureDissolveRenderer }) => {
          if (cancelled) return;
          const handle = ensureDissolveRenderer();
          if (!handle) return;
          rendererRef.current = handle;
          handle.canvas.className = styles.canvas;
          hostRef.current?.appendChild(handle.canvas);
          // Now that it has a parent it can measure the box it actually
          // occupies, which is not the same as the window when a scrollbar
          // is present.
          handle.resize();
        })
        .catch(() => undefined);
    };
    const idle = window.requestIdleCallback?.(prepare, { timeout: 2500 });
    const timer = idle === undefined ? window.setTimeout(prepare, 1200) : 0;
    return () => {
      cancelled = true;
      if (idle !== undefined) window.cancelIdleCallback?.(idle);
      else window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const onResize = () => {
      rendererRef.current?.resize();
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  /*
   * The frame. Written straight to style on the frames the clock is already
   * producing — no React state anywhere in here.
   */
  useEffect(() => {
    return onTransitionFrame(() => {
      const transition = transitionState();
      const host = hostRef.current;
      const arriving = document.querySelector<HTMLElement>('[data-role="arriving"]');

      if (!transition.running) {
        if (host) host.dataset.active = "false";
        /*
         * Cleared from every slot rather than from whichever one is currently
         * labelled arriving. A slot that has already been re-labelled by React
         * would keep an inline clip forever, and an inline clip on the settled
         * route is an invisible page — the worst failure this component could
         * have. There are only ever two of them.
         */
        document.querySelectorAll<HTMLElement>("[data-route-slot]").forEach((slot) => {
          slot.style.removeProperty("clip-path");
          slot.style.removeProperty("opacity");
          shellOf(slot)?.style.removeProperty("transform");
        });
        rendererRef.current?.clear();
        fieldRef.current = null;
        return;
      }

      if (host) host.dataset.active = "true";
      if (!arriving) return;

      const progress = transition.progress;

      if (!dissolvingRef.current) {
        // Reduced motion: content, and a short crossfade, and nothing else. The
        // clip is lifted explicitly — its default is an empty region, which is
        // right for a dissolve and would hide the page entirely for a fade.
        arriving.style.clipPath = "none";
        arriving.style.opacity = progress.toFixed(3);
        return;
      }

      /*
       * The contour is measured against the layer it clips, not the window. A
       * fixed layer excludes the scrollbar that `innerWidth` counts, and a path
       * built to the wrong width would slide the whole field sideways against
       * the rim the shader draws for it.
       */
      const width = arriving.clientWidth;
      const height = arriving.clientHeight;
      const threshold = thresholdFor(progress);
      const field = fieldRef.current;

      if (field) {
        const path = contourPath(field, threshold, width, height);
        arriving.style.clipPath = path ? `path("${path}")` : EMPTY_CLIP;
      }

      /*
       * The camera feel: the arriving page begins fractionally deep and settles.
       * Small enough to be felt rather than noticed, and finished exactly at 1 so
       * no transform is left on a settled page to soften its type.
       */
      const settle = progress * progress * (3 - 2 * progress);
      const shell = shellOf(arriving);
      if (shell) shell.style.transform = `scale(${(0.988 + 0.012 * settle).toFixed(4)})`;

      const renderer = rendererRef.current;
      if (!renderer?.alive) return;
      renderer.draw({
        progress,
        threshold,
        direction: { x: transition.directionX, y: transition.directionY },
        spectralStrength: 1,
        /*
         * The layer is faded out over the last stretch, so the spectral edge is
         * already gone before the movement finishes. Colour never survives onto
         * the destination page, whatever the boundary is doing at the time.
         */
        opacity: 1 - Math.max((progress - 0.86) / 0.14, 0),
        elapsed: (performance.now() - startedAt.current) / 1000,
      });
    });
  }, []);

  useEffect(() => {
    const begin = (commit: () => void, to: string, fromHistory: boolean) => {
      const destination = stripAppBasePath(new URL(to, window.location.origin).pathname) || "/";
      warmRoute(destination);

      const mode: TransitionMode =
        fromHistory && lastHistoryDirection() === "back" ? "back" : "forward";

      const pointer = pointerSignal();
      const origin =
        pointer.clientX >= 0 && pointer.clientY >= 0
          ? { x: pointer.clientX, y: pointer.clientY }
          : null;
      const direction = directionFor(mode, origin);

      /*
       * Reduced motion keeps the handover and drops the spectacle: no travelling
       * boundary, no spectral edge, no camera. Forced colours drops the drawn
       * layer for the same reason the rest of the site does — the palette is not
       * ours to use there.
       */
      const dissolving = !motionIsReduced() && !forcedColorsActive();
      dissolvingRef.current = dissolving;
      startedAt.current = performance.now();

      if (dissolving) {
        const compact = window.matchMedia("(max-width: 47.99rem)").matches;
        const aspect = window.innerWidth / Math.max(window.innerHeight, 1);
        const { columns, rows } = fieldResolution(compact, aspect);
        const field = buildDissolveField({
          columns,
          rows,
          aspect,
          direction,
          seed: (Math.random() * 0x7fffffff) | 0,
        });
        fieldRef.current = field;
        rendererRef.current?.setField(field);
      } else {
        fieldRef.current = null;
      }

      runTransition({
        commit,
        mode,
        origin,
        direction,
        onFinish: (completed) => {
          /*
           * The scroll happens here, synchronously, while the incoming page still
           * covers the frame completely — the outgoing route is fully hidden at
           * this point, so moving the document under it cannot be seen. A frame
           * later the slot returns to normal flow already at the right place,
           * with nothing to re-settle.
           *
           * Not on an abandoned movement: a second navigation is already
           * starting, its outgoing page is the one on screen, and scrolling it
           * to a destination nobody is going to any more is simply a jump.
           */
          if (!completed) return;
          const here = `${window.location.pathname}${window.location.search}${window.location.hash}`;
          scrollForLocation(here);
        },
      });
    };

    const remove = setNavigationInterceptor((to, options) => {
      if (options?.immediate) return false;
      const destination = stripAppBasePath(new URL(to, window.location.origin).pathname) || "/";
      if (!dissolvesBetween(currentPath.current, destination)) return false;
      /*
       * A navigation arriving mid-movement replaces it rather than queueing
       * behind it. Cancelling first is the important half: the abandoned
       * transition must not finish later and drag the reader somewhere they have
       * already moved past.
       */
      if (transitionIsRunning()) cancelTransition();
      begin(() => commitNavigation(to, options), to, false);
      return true;
    });

    const removeHistory = setHistoryNavigationInterceptor((to) => {
      const destination = stripAppBasePath(new URL(to, window.location.origin).pathname) || "/";
      if (!dissolvesBetween(currentPath.current, destination)) return false;
      if (transitionIsRunning()) cancelTransition();
      begin(commitHistoryNavigation, to, true);
      return true;
    });

    return () => {
      remove();
      removeHistory();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className={styles.host}
      data-active="false"
      data-route-transition
      aria-hidden="true"
    />
  );
}
