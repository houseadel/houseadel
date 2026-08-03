import { useEffect, useRef } from "react";
import { deferMotion } from "../../lib/deferredMotion";
import styles from "./AtelierTable.module.css";

export function AtelierTable() {
  const figureRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const figureElement = figureRef.current;

    if (!figureElement) {
      return;
    }

    return deferMotion((gsap) => {
      const media = gsap.matchMedia();
      const context = gsap.context(() => {
      media.add(
        {
          desktop: "(min-width: 48rem) and (prefers-reduced-motion: no-preference)",
          mobile: "(max-width: 47.99rem) and (prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
          forced: "(forced-colors: active)",
        },
        ({ conditions }) => {
          const { desktop, mobile, reduced, forced } = conditions ?? {};
          const root = figureElement;

          const fragments = gsap.utils.toArray<HTMLElement>("[data-atelier-fragment]", root);
          const route = root.querySelector<SVGPathElement>("[data-atelier-route]");
          const register = root.querySelector<HTMLElement>("[data-atelier-register]");
          const measure = root.querySelector<HTMLElement>("[data-atelier-measure]");

          if (reduced || forced || (!desktop && !mobile)) {
            gsap.set(fragments, { clearProps: "opacity,transform" });
            gsap.set([route, register, measure], {
              clearProps: "opacity,transform,clipPath,strokeDasharray,strokeDashoffset",
            });
            return;
          }

          const desktopStarts = [
            { xPercent: -28, yPercent: -14, rotation: -11, scale: 0.94 },
            { xPercent: 26, yPercent: -17, rotation: 8, scale: 0.93 },
            { xPercent: -31, yPercent: 12, rotation: -7, scale: 0.96 },
            { xPercent: 30, yPercent: 20, rotation: 8, scale: 0.95 },
            { xPercent: -18, yPercent: 28, rotation: -9, scale: 0.92 },
            { xPercent: 18, yPercent: 25, rotation: 6, scale: 0.94 },
            { xPercent: 32, yPercent: 34, rotation: 11, scale: 0.9 },
          ];
          const mobileStarts = [
            { xPercent: -8, yPercent: -5, rotation: -5, scale: 0.98 },
            { xPercent: 9, yPercent: -4, rotation: 4, scale: 0.98 },
            { xPercent: -7, yPercent: 5, rotation: -3, scale: 0.99 },
            { xPercent: 8, yPercent: 6, rotation: 3, scale: 0.98 },
            { xPercent: -5, yPercent: 7, rotation: -4, scale: 0.98 },
            { xPercent: 5, yPercent: 7, rotation: 3, scale: 0.98 },
            { xPercent: 7, yPercent: 8, rotation: 4, scale: 0.97 },
          ];
          const starts = mobile ? mobileStarts : desktopStarts;

          const timeline = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: root,
              start: mobile ? "top 90%" : "top 80%",
              end: mobile ? "bottom 48%" : "bottom 58%",
              scrub: mobile ? 0.2 : 0.6,
              invalidateOnRefresh: true,
            },
          });

          fragments.forEach((fragment, index) => {
            timeline.from(
              fragment,
              {
                ...starts[index],
                duration: mobile ? 0.58 : 0.72,
                transformOrigin: "50% 50%",
              },
              index * (mobile ? 0.018 : 0.028),
            );
          });

          if (route) {
            const routeLength = route.getTotalLength();
            timeline.fromTo(
              route,
              { strokeDasharray: routeLength, strokeDashoffset: routeLength },
              { strokeDashoffset: 0, duration: 0.44 },
              mobile ? 0.2 : 0.34,
            );
          }

          if (measure) {
            timeline.from(measure, { scaleX: 0.18, opacity: 0.35, duration: 0.42 }, mobile ? 0.28 : 0.46);
          }

          if (register) {
            timeline.from(
              register,
              { clipPath: "inset(0 100% 0 0)", opacity: 0, duration: 0.38 },
              mobile ? 0.35 : 0.54,
            );
          }
        },
      );
      }, figureElement);

      return () => {
        media.revert();
        context.revert();
      };
    });
  }, []);

  return (
    <figure ref={figureRef} className={styles.figure} aria-labelledby="atelier-table-caption">
      <div className={styles.table} aria-hidden="true">
        <div className={`${styles.fragment} ${styles.photoFragment}`} data-atelier-fragment>
          <svg viewBox="0 0 360 260" role="presentation">
            <defs>
              <linearGradient id="atelier-light" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ded5c6" />
                <stop offset="0.48" stopColor="#8e8173" />
                <stop offset="1" stopColor="#392b2c" />
              </linearGradient>
            </defs>
            <rect width="360" height="260" fill="url(#atelier-light)" />
            <path d="M-10 224 145 70l78 190Z" fill="#f3eee4" fillOpacity=".55" />
            <path d="M190-15 366 32v116L242 91Z" fill="#6f2431" fillOpacity=".42" />
            <rect x="22" y="20" width="316" height="220" fill="none" stroke="#eee6da" strokeOpacity=".58" />
          </svg>
          <span>Light study / oblique interior</span>
        </div>

        <div className={`${styles.fragment} ${styles.mapFragment}`} data-atelier-fragment>
          <svg viewBox="0 0 360 230" role="presentation">
            <path d="M18 193C67 174 69 121 116 106s77 24 118-6 37-61 109-73" />
            <path d="M-4 154c62-5 88 18 132 1s48-65 100-64 57 22 140 3" />
            <path d="M35 228c2-65 56-70 77-108S112 47 159 8" />
            <circle cx="117" cy="106" r="5" />
            <circle cx="234" cy="100" r="5" />
            <path className={styles.route} data-atelier-route d="m117 106 40 24 77-30" />
          </svg>
          <span>Route / sequence / threshold</span>
        </div>

        <div className={`${styles.fragment} ${styles.dateFragment}`} data-atelier-fragment>
          <small>Date</small>
          <strong>DAY / MONTH / YEAR</strong>
          <span>Before dusk · late evening</span>
        </div>

        <div className={`${styles.fragment} ${styles.lineFragment}`} data-atelier-fragment>
          <span>Keep one room for silence.</span>
        </div>

        <div className={`${styles.fragment} ${styles.paperFragment}`} data-atelier-fragment>
          <span>Vellum</span>
          <span>Warm stock</span>
          <span>Oxblood ink</span>
        </div>

        <div className={`${styles.fragment} ${styles.planFragment}`} data-atelier-fragment>
          <svg viewBox="0 0 350 260" role="presentation">
            <path d="M24 22h298v215H24zM24 105h117V22m0 83v132m0-72h181M245 22v143M141 207h104" />
            <path d="M110 105a31 31 0 0 0 31 31M214 165a31 31 0 0 1 31 31" />
            <path d="M36 249h276M36 243v12m276-12v12" />
          </svg>
          <span>Unlocated plan / threshold study</span>
        </div>

        <div className={`${styles.fragment} ${styles.typeFragment}`} data-atelier-fragment>
          <span>ONE</span>
          <span>OF</span>
          <span>ONE</span>
        </div>

        <div className={styles.measurement} data-atelier-measure>
          <span>01</span>
          <span>Scale follows the story</span>
          <span>12</span>
        </div>

        <div className={styles.composedRegister} data-atelier-register>
          <span>Private / House Adel</span>
          <span>One source, one form</span>
        </div>
      </div>
      <figcaption id="atelier-table-caption">
        Light, route, date, language, paper and plan held apart before they are composed.
      </figcaption>
    </figure>
  );
}
