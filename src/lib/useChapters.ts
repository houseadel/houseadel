import { useEffect, useState } from "react";
import { chapters, type Chapter } from "./chapters";
import { resolveAppUrl } from "./basePath";
import { transitionIsRunning } from "../features/transition/transitionClock";

export const CHAPTER_EVENT = "house-adel:chapter";

/**
 * Turns a continuous scroll into addressable chapters.
 *
 * As a chapter takes the middle of the viewport the address bar is rewritten to
 * its path and the document title follows. `replaceState` rather than `pushState`:
 * scrolling should not fill the back button with entries, so going back leaves the
 * site rather than crawling up the page. It also does not fire `popstate`, so the
 * router never wakes and nothing re-renders — the URL is a label for where the
 * reader is, not a navigation.
 *
 * `onTransition` reports how far the reader has moved from the first chapter into
 * the second, which is what drives the environment sinking underwater and the
 * score muffling with it. It is measured over a full viewport of travel so the
 * change is gradual rather than a cut at a boundary.
 */
export function useChapters(onTransition?: (progress: number) => void) {
  useEffect(() => {
    let frame = 0;
    // Seeded from the address the document was opened at. Without this the first
    // measurement runs while the page is still at scroll zero and immediately
    // rewrites a deep link back to "/", before the jump to that chapter has even
    // happened.
    const chapterIdForLocation = () => {
      const here = window.location.pathname.replace(/\/+$/, "") || "/";
      return chapters.find((chapter) => resolveAppUrl(chapter.path) === here || chapter.path === here)
        ?.id;
    };
    let current = chapterIdForLocation() ?? "";

    const measure = () => {
      frame = 0;
      const viewport = window.innerHeight;
      const middle = viewport * 0.5;

      let active: Chapter | undefined;
      for (const chapter of chapters) {
        const element = document.querySelector<HTMLElement>(`[data-chapter="${chapter.id}"]`);
        if (!element) continue;
        const rect = element.getBoundingClientRect();
        // The last chapter whose top has passed the middle of the screen is the
        // one being read. Using the midpoint rather than the top means a chapter
        // claims the URL when it dominates the view, not when it first peeks in.
        if (rect.top <= middle && rect.bottom > 0) active = chapter;
      }

      /*
       * While a route transition is running the address belongs to the
       * navigation, not to the scroll position.
       *
       * Both routes are mounted during a transition, and an arriving home
       * document sits in its own layer at offset zero — so the first chapter is
       * squarely in the middle of the viewport and would claim the URL, quietly
       * rewriting the destination the reader actually asked for back to "/". The
       * tracker is kept in step with the real location instead, so that nothing
       * reads as having changed the moment the movement ends.
       */
      if (transitionIsRunning()) {
        current = chapterIdForLocation() ?? current;
      } else if (active && active.id !== current) {
        current = active.id;
        const target = resolveAppUrl(active.path);
        if (`${window.location.pathname}` !== target) {
          window.history.replaceState(window.history.state, "", target);
        }
        document.title = active.title;
        // Announced on its own channel rather than through the router. Waking the
        // router would re-run its route effects, and one of those scrolls the
        // document to the top — which would fight the scroll that got us here.
        window.dispatchEvent(new CustomEvent(CHAPTER_EVENT, { detail: active.id }));
      }

      if (onTransition) {
        const second = chapters[1]
          ? document.querySelector<HTMLElement>(`[data-chapter="${chapters[1].id}"]`)
          : null;
        if (second) {
          const top = second.getBoundingClientRect().top;
          onTransition(Math.min(Math.max(1 - top / viewport, 0), 1));
        }
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [onTransition]);
}

/**
 * Subscribes to the chapter the reader is in.
 *
 * Exists because the URL is rewritten without notifying the router, so anything
 * that needs to know the current chapter — the navigation marking itself current,
 * for one — cannot read it from the router’s location.
 */
export function useActiveChapter(): string {
  const [id, setId] = useState(() => {
    const path = window.location.pathname.replace(/\/+$/, "") || "/";
    return chapters.find((chapter) => chapter.path === path)?.id ?? "home";
  });
  useEffect(() => {
    const onChapter = (event: Event) => setId((event as CustomEvent<string>).detail);
    window.addEventListener(CHAPTER_EVENT, onChapter);
    return () => window.removeEventListener(CHAPTER_EVENT, onChapter);
  }, []);
  return id;
}

/** Scrolls a chapter into view, for navigation and for deep links. */
export function scrollToChapter(id: string, behavior: ScrollBehavior = "smooth") {
  const element = document.querySelector<HTMLElement>(`[data-chapter="${id}"]`);
  if (!element) return false;
  element.scrollIntoView({ behavior, block: "start" });
  return true;
}
