import { useEffect, useRef } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { commitNavigation, setNavigationInterceptor } from "../../lib/router";
import styles from "./PageTransition.module.css";

const routeNames = {
  "/": { en: "Home", id: "Beranda" },
  "/work": { en: "Work", id: "Karya" },
  "/commissions": { en: "Commissions", id: "Komisi" },
} as const;

function routeName(path: string, language: "en" | "id") {
  const pathname = new URL(path, window.location.origin).pathname as keyof typeof routeNames;
  return routeNames[pathname]?.[language] ?? "House Adel";
}

export function PageTransition() {
  const rootReference = useRef<HTMLDivElement>(null);
  const destinationReference = useRef<HTMLSpanElement>(null);
  const activeTimeline = useRef<{ kill: () => void } | null>(null);
  const transitioning = useRef(false);
  const { language } = useLanguage();

  useEffect(() => {
    const root = rootReference.current;
    const destination = destinationReference.current;
    if (!root || !destination) return;
    let disposed = false;

    const removeInterceptor = setNavigationInterceptor((to, options) => {
      const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      const target = new URL(to, window.location.origin);
      if (
        transitioning.current ||
        to === current ||
        target.origin !== window.location.origin ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        window.matchMedia("(forced-colors: active)").matches
      ) {
        if (!transitioning.current) commitNavigation(to, options);
        return true;
      }

      transitioning.current = true;
      destination.textContent = routeName(to, language);
      root.dataset.active = "true";
      root.setAttribute("aria-hidden", "false");

      void import("gsap").then(({ gsap }) => {
        if (disposed) return;
        const timeline = gsap.timeline({ defaults: { ease: "power4.inOut" } });
        activeTimeline.current = timeline;
        timeline
          .set(root, { yPercent: 100 })
          .to(root, { yPercent: 0, duration: 0.42 })
          .add(() => commitNavigation(to, { ...options, immediate: true }))
          .to(
            root.querySelector("[data-transition-rule]"),
            { scaleX: 1, duration: 0.28, ease: "power2.inOut" },
            0.12,
          )
          .to(root, {
            yPercent: -100,
            duration: 0.46,
            delay: 0.08,
            onComplete: () => {
              gsap.set(root, { yPercent: 100 });
              root.dataset.active = "false";
              root.setAttribute("aria-hidden", "true");
              activeTimeline.current = null;
              transitioning.current = false;
            },
          });
      });

      return true;
    });

    return () => {
      disposed = true;
      removeInterceptor();
      activeTimeline.current?.kill();
      activeTimeline.current = null;
      transitioning.current = false;
    };
  }, [language]);

  return (
    <div
      ref={rootReference}
      className={styles.overlay}
      data-active="false"
      aria-hidden="true"
      aria-live="polite"
    >
      <div className={styles.meta}>
        <span>House Adel</span>
        <span>{language === "en" ? "Entering" : "Menuju"}</span>
      </div>
      <span ref={destinationReference} className={styles.destination} />
      <span className={styles.rule} data-transition-rule aria-hidden="true" />
    </div>
  );
}

