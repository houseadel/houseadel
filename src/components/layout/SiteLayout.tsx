import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { RealLoaderLab } from "../../labs/loader/RealLoaderLab";
import { CursorCompanion } from "../motion/CursorCompanion";
import { LiquidLens } from "../../features/liquid/LiquidLens";
import { RouteTransition } from "../motion/RouteTransition";
import { ViewportAtmosphere } from "../motion/ViewportAtmosphere";
import { ScrollTracker } from "./ScrollTracker";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { resolveAppUrl } from "../../lib/basePath";
import { startPointerSignal } from "../../lib/pointerSignal";
import { useSmoothScroll } from "../../lib/useSmoothScroll";
import { onTransitionFrame, transitionIsRunning } from "../../features/transition/transitionClock";
import { routeIdentity } from "../../lib/chapters";
import { sculptureForPath } from "../../features/relief/sculptures";
import styles from "./SiteLayout.module.css";

/** One route's place in the document, frozen at the moment it started leaving. */
type SlotContent = { routeKey: string; pathname: string; node: ReactNode };

function RouteShell({ slot, live }: { slot: SlotContent; live: boolean }) {
  return (
    <div className={styles.shell} data-route-shell data-route-root={live ? "" : undefined}>
      <main id={live ? "main-content" : undefined} tabIndex={-1}>
        {slot.node}
      </main>
      <SiteFooter />
    </div>
  );
}

export function SiteLayout({ children, pathname }: { children: ReactNode; pathname: string }) {
  /*
   * One authority for scrolling and one for pointing, both owned here.
   *
   * Held at the layout, there is exactly one of each for the whole site and
   * every route inherits the same behaviour.
   */
  useSmoothScroll();
  useEffect(() => startPointerSignal(), []);

  const contentRoot = useRef<HTMLDivElement>(null);
  const criticalPoster = useRef<HTMLImageElement>(null);
  const [loaderVisible, setLoaderVisible] = useState(true);
  const loaderRuns = !pathname.startsWith("/labs-") && import.meta.env.MODE !== "test";
  const siteHandedOver = !loaderRuns || !loaderVisible;

  /*
   * The document knows whether it is still being opened.
   *
   * Published as an attribute rather than passed down, because the thing that
   * needs it is a CSS rule on the landing page's type: the opening ends by
   * cross-fading a particle figure into the real one, and the headline has to
   * arrive *after* that rather than being already sitting there when the veil
   * clears. A page with no opening never gets the attribute and its type is
   * simply visible, which is what a return visit and a reduced-motion visit both
   * want.
   */
  useEffect(() => {
    const root = document.documentElement;
    if (siteHandedOver) delete root.dataset.opening;
    else root.dataset.opening = "running";
    return () => {
      delete root.dataset.opening;
    };
  }, [siteHandedOver]);

  /*
   * Which of the two slots currently holds the live route.
   *
   * They alternate. A route mounted into slot zero stays in slot zero for its
   * whole life, and the next route mounts into slot one — so when a transition
   * starts, the outgoing tree is never re-parented and therefore never
   * remounted. That is the difference between the outgoing page continuing to
   * exist and it being torn down and rebuilt: its scroll position, its component
   * state and its live WebGL scenes all survive the handover untouched.
   */
  const identity = routeIdentity(pathname);
  const [swap, setSwap] = useState<{
    identity: string;
    liveSlot: 0 | 1;
    leaving: SlotContent | null;
  }>(() => ({ identity, liveSlot: 0, leaving: null }));
  const previous = useRef<SlotContent | null>(null);

  /*
   * The slot assignment is derived *during* render, not in an effect.
   *
   * This is the load-bearing detail of the whole layering scheme, and getting it
   * wrong is silent. An effect — even a layout effect — runs after React has
   * already committed the new route into the DOM, so the outgoing tree would be
   * unmounted on that commit and then mounted again a moment later when the
   * effect moved it to the other slot. That destroys exactly what these slots
   * exist to preserve: its component state, its scroll position and its live
   * WebGL scenes. It also collapsed the document to the incoming page's height
   * for one commit, which yanked the reader to the top of a page that was still
   * on screen.
   *
   * Setting state during render is the documented way to adjust state when a
   * prop changes: React throws this pass away and immediately re-renders with
   * the corrected slots, so the wrong arrangement is never committed at all.
   */
  if (swap.identity !== identity) {
    const transitioning = transitionIsRunning();
    setSwap({
      identity,
      liveSlot: transitioning ? (swap.liveSlot === 0 ? 1 : 0) : swap.liveSlot,
      leaving: transitioning ? previous.current : null,
    });
  }
  // The outgoing page, captured with no copy, clone or rasterisation anywhere:
  // it is simply the element tree the last render already had.
  previous.current = { routeKey: identity, pathname, node: children };

  const { liveSlot, leaving } = swap;

  // The outgoing route is released the moment the movement stops, however it
  // stopped — completed, cancelled, or abandoned by a second navigation.
  useEffect(
    () =>
      onTransitionFrame(() => {
        if (transitionIsRunning()) return;
        setSwap((current) => (current.leaving ? { ...current, leaving: null } : current));
      }),
    [],
  );

  const focusMainContent = (event: MouseEvent<HTMLAnchorElement>) => {
    const main = document.getElementById("main-content");
    if (!main) return;
    event.preventDefault();
    main.focus({ preventScroll: false });
  };

  const live: SlotContent = { routeKey: pathname, pathname, node: children };
  const slots: Array<SlotContent | null> = [null, null];
  slots[liveSlot] = live;
  if (leaving) slots[liveSlot === 0 ? 1 : 0] = leaving;

  return (
    <>
      <a className="skip-link" href="#main-content" onClick={focusMainContent}>
        Skip to main content
      </a>
      <SiteHeader pathname={pathname} />
      <div ref={contentRoot}>
        {slots.map((slot, index) => {
          const isLive = index === liveSlot;
          const role = slot ? (isLive ? (leaving ? "arriving" : "live") : "leaving") : "empty";
          return (
            <div
              key={index}
              className={styles.slot}
              data-route-slot={index}
              data-role={role}
              // The page being left is finished with: it must not take a click,
              // a tab stop or a screen reader's attention while it dissolves.
              inert={slot ? !isLive : undefined}
              aria-hidden={slot && !isLive ? "true" : undefined}
            >
              {slot ? <RouteShell slot={slot} live={isLive} /> : null}
            </div>
          );
        })}
      </div>
      {/*
        The room the site is in — and only the site. Both of these sit above the
        arriving route, so they stay continuous across a change rather than being
        dissolved and rebuilt with the page.
      */}
      <ViewportAtmosphere />
      <ScrollTracker />
      {/*
        Mounted unconditionally.

        It has to outlive every navigation it starts. When this was skipped on
        one route, navigating *to* that route unmounted the transition halfway
        through its own movement — taking its frame subscription with it and
        leaving whatever was last drawn on screen. Whether a given route dissolves
        is decided inside, not by whether the component exists.
      */}
      <RouteTransition pathname={pathname} />
      {/*
        Held back until the opening has finished, for the same reason the lens
        is: it offers sound, and it was drawing that offer straight over the
        loader — a control inviting a click on a page the visitor cannot reach
        yet, floating in the middle of the mark while the mark was still
        gathering.
      */}
      {siteHandedOver ? <CursorCompanion /> : null}
      {/*
        Last in the tree and last in the stack. It has to run over a finished
        page, so it waits for the loader to hand the site over rather than
        disturbing the opening.
      */}
      {siteHandedOver ? <LiquidLens /> : null}
      {/* The loader waits on this decoding before it resolves. */}
      <img
        ref={criticalPoster}
        src={resolveAppUrl("/assets/house-adel/relief-depth-1024.png")}
        alt=""
        aria-hidden="true"
        style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
      />
      {loaderVisible && loaderRuns ? (
        <RealLoaderLab
          criticalPoster={criticalPoster}
          criticalSculpture={sculptureForPath(pathname)}
          contentRoot={contentRoot}
          graphicsMode="auto"
          preview={false}
          visitMode="auto"
          variant="production"
          autoEnter
          onComplete={() => setLoaderVisible(false)}
          onReport={() => undefined}
        />
      ) : null}
    </>
  );
}
