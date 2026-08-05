import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import styles from "./CapabilityInstrument.module.css";

const layers = [
  {
    id: "direction",
    number: "01",
    title: { en: "Art direction", id: "Arahan seni" },
    summary: {
      en: "A premise drawn from private material—not a visual theme selected from a shelf.",
      id: "Sebuah premis yang lahir dari materi privat—bukan tema visual yang dipilih dari katalog.",
    },
  },
  {
    id: "information",
    number: "02",
    title: { en: "Information", id: "Informasi" },
    summary: {
      en: "Dates, travel, gatherings and responses arranged so every guest knows what to do.",
      id: "Tanggal, perjalanan, rangkaian acara, dan respons ditata agar setiap tamu memahami langkahnya.",
    },
  },
  {
    id: "motion",
    number: "03",
    title: { en: "Motion", id: "Gerak" },
    summary: {
      en: "Movement introduces place, reveals material and gives the invitation a measured rhythm.",
      id: "Gerak memperkenalkan tempat, menyingkap material, dan memberi undangan ritme yang terukur.",
    },
  },
  {
    id: "development",
    number: "04",
    title: { en: "Development", id: "Pengembangan" },
    summary: {
      en: "A resilient build across languages, screens, access needs and changing guest details.",
      id: "Sistem tangguh lintas bahasa, layar, kebutuhan akses, dan detail tamu yang dapat berubah.",
    },
  },
] as const;

export function CapabilityInstrument() {
  const [active, setActive] = useState(0);
  const rootReference = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const selected = layers[active];

  useEffect(() => {
    const root = rootReference.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let disposed = false;
    let context: { revert: () => void } | undefined;
    void import("gsap").then(({ gsap }) => {
      if (disposed) return;
      context = gsap.context(() => {
        gsap.fromTo(
          "[data-instrument-active]",
          { autoAlpha: 0.35, y: 8, rotate: -0.35 },
          { autoAlpha: 1, y: 0, rotate: 0, duration: 0.5, ease: "power3.out" },
        );
        gsap.fromTo(
          "[data-instrument-copy]",
          { autoAlpha: 0, y: 5 },
          { autoAlpha: 1, y: 0, duration: 0.34, ease: "power2.out" },
        );
      }, root);
    });
    return () => {
      disposed = true;
      context?.revert();
    };
  }, [active, language]);

  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    event.currentTarget.style.setProperty("--instrument-x", x.toFixed(3));
    event.currentTarget.style.setProperty("--instrument-y", y.toFixed(3));
  };

  const reset = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty("--instrument-x", "0");
    event.currentTarget.style.setProperty("--instrument-y", "0");
  };

  return (
    <div ref={rootReference} className={styles.instrument}>
      <div
        className={styles.stage}
        data-active={selected.id}
        onPointerMove={move}
        onPointerLeave={reset}
        aria-hidden="true"
      >
        <div className={styles.coordinateField} />
        <div className={styles.paperBack} />
        <div className={styles.paperMiddle} />
        <div className={styles.invitation} data-instrument-active>
          <span className={styles.invitationMeta}>House Adel · Private digital invitation</span>
          <span className={styles.invitationTitle}>The place between two names</span>
          <span className={styles.invitationRule} />
          <span className={styles.invitationDetail}>Saturday · 18.30 · A private study</span>
          <span className={styles.invitationAction}>Respond</span>
        </div>
        <svg className={styles.routeLine} viewBox="0 0 800 520" role="presentation">
          <path d="M84 410C215 352 246 157 424 168c126 8 164 120 288 54" />
          <circle cx="84" cy="410" r="5" />
          <circle cx="712" cy="222" r="5" />
        </svg>
        <span className={styles.modeLabel}>{selected.number} / {selected.title[language]}</span>
      </div>

      <div className={styles.controls}>
        <div className={styles.readout} aria-live="polite" data-instrument-copy>
          <p>{selected.number} / 04</p>
          <h3>{selected.title[language]}</h3>
          <p>{selected.summary[language]}</p>
        </div>
        <div className={styles.layerButtons} aria-label={language === "en" ? "Capability layers" : "Lapisan kapabilitas"}>
          {layers.map((layer, index) => (
            <button
              key={layer.id}
              type="button"
              aria-pressed={index === active}
              onClick={() => setActive(index)}
              data-sonic
            >
              <span>{layer.number}</span>
              {layer.title[language]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

