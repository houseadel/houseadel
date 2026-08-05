import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import styles from "./LoaderLabPage.module.css";

const LOADER_VISIT_KEY = "house-adel:loader-seen";
const READINESS_TIMEOUT = 3_500;

export type LoaderVisitMode = "auto" | "first" | "repeat";
export type LoaderGraphicsMode = "auto" | "fallback";
export type LoaderGraphicsState = "ready" | "fallback";

export type LoaderReport = {
  visit: Exclude<LoaderVisitMode, "auto">;
  graphics: LoaderGraphicsState;
  motion: "full" | "reduced";
  readiness: "settled" | "timed-out";
  durationMs: number;
  failures: string[];
};

type RealLoaderLabProps = {
  criticalPoster: RefObject<HTMLImageElement | null>;
  contentRoot: RefObject<HTMLDivElement | null>;
  graphicsMode: LoaderGraphicsMode;
  preview: boolean;
  visitMode: LoaderVisitMode;
  onComplete: (reason: "complete" | "skipped") => void;
  onReport: (report: LoaderReport) => void;
  variant?: "lab" | "production";
};

type ReadinessTask = {
  label: string;
  task: Promise<unknown>;
};

function visitForRun(requested: LoaderVisitMode): Exclude<LoaderVisitMode, "auto"> {
  if (requested !== "auto") return requested;
  try {
    return window.sessionStorage.getItem(LOADER_VISIT_KEY) === "true" ? "repeat" : "first";
  } catch {
    return "first";
  }
}

function waitForImage(image: HTMLImageElement | null, label: string) {
  if (!image) return Promise.reject(new Error(`${label} was not mounted.`));
  if (image.complete) {
    return image.naturalWidth > 0
      ? image.decode().catch(() => undefined)
      : Promise.reject(new Error(`${label} failed to load.`));
  }

  return new Promise<void>((resolve, reject) => {
    const loaded = () => {
      cleanup();
      resolve();
    };
    const failed = () => {
      cleanup();
      reject(new Error(`${label} failed to load.`));
    };
    const cleanup = () => {
      image.removeEventListener("load", loaded);
      image.removeEventListener("error", failed);
    };

    image.addEventListener("load", loaded, { once: true });
    image.addEventListener("error", failed, { once: true });
  });
}

function probeGraphics(mode: LoaderGraphicsMode): Promise<LoaderGraphicsState> {
  if (
    mode === "fallback" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    window.matchMedia("(forced-colors: active)").matches
  ) {
    return Promise.resolve("fallback");
  }

  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!context) return Promise.resolve("fallback");
    context.getExtension("WEBGL_lose_context")?.loseContext();
    return Promise.resolve("ready");
  } catch {
    return Promise.resolve("fallback");
  }
}

async function waitForCriticalAssets(tasks: ReadinessTask[]) {
  const failures: string[] = [];
  const trackedTasks = tasks.map(async ({ label, task }) => {
    try {
      await task;
    } catch (error) {
      failures.push(label);
      if (import.meta.env.DEV) console.warn(`[House Adel loader] ${label} did not settle.`, error);
      throw error;
    }
  });

  let timeout = 0;
  const readiness = await Promise.race([
    Promise.allSettled(trackedTasks).then(() => "settled" as const),
    new Promise<"timed-out">((resolve) => {
      timeout = window.setTimeout(() => resolve("timed-out"), READINESS_TIMEOUT);
    }),
  ]);
  window.clearTimeout(timeout);
  return { failures, readiness };
}

export function RealLoaderLab({
  criticalPoster,
  contentRoot,
  graphicsMode,
  preview,
  visitMode: requestedVisit,
  onComplete,
  onReport,
  variant = "lab",
}: RealLoaderLabProps) {
  const overlayReference = useRef<HTMLDivElement>(null);
  const markReference = useRef<HTMLImageElement>(null);
  const sealReference = useRef<HTMLDivElement>(null);
  const topPathReference = useRef<SVGTextPathElement>(null);
  const bottomPathReference = useRef<SVGTextPathElement>(null);
  const ruleReference = useRef<HTMLSpanElement>(null);
  const skipReference = useRef<HTMLButtonElement>(null);
  const timelineReference = useRef<{ kill: () => void } | null>(null);
  const finishReference = useRef<(reason: "complete" | "skipped") => void>(() => undefined);
  const [phase, setPhase] = useState<"waiting" | "animating" | "preview" | "complete">(
    "waiting",
  );
  const visit = useRef(visitForRun(requestedVisit)).current;
  const motion = useRef<"full" | "reduced">(
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "reduced" : "full",
  ).current;

  useEffect(() => {
    const overlay = overlayReference.current;
    if (!overlay) return;
    const startedAt = performance.now();
    let disposed = false;
    let finished = false;
    let context: { revert: () => void } | undefined;
    const inertTargets = [
      document.querySelector<HTMLElement>(".skip-link"),
      document.querySelector<HTMLElement>("header"),
      contentRoot.current,
      document.querySelector<HTMLElement>("footer"),
    ].filter((target): target is HTMLElement => Boolean(target));
    const previousInert = inertTargets.map((target) => target.inert);
    inertTargets.forEach((target) => {
      target.inert = true;
    });

    const restoreDocument = () => {
      inertTargets.forEach((target, index) => {
        target.inert = previousInert[index] ?? false;
      });
    };

    const finish = (reason: "complete" | "skipped") => {
      if (finished) return;
      finished = true;
      timelineReference.current = null;
      restoreDocument();
      setPhase("complete");
      try {
        window.sessionStorage.setItem(LOADER_VISIT_KEY, "true");
      } catch {
        // Storage can be unavailable in a privacy-restricted browsing context.
      }
      onComplete(reason);
      if (reason === "skipped" && document.activeElement === skipReference.current) {
        window.requestAnimationFrame(() => {
          contentRoot.current?.querySelector<HTMLElement>("[data-route-heading]")?.focus();
        });
      }
    };
    finishReference.current = finish;

    const run = async () => {
      const graphicsTask = probeGraphics(graphicsMode);
      const tasks: ReadinessTask[] = [
        { label: "Editorial fonts", task: document.fonts?.ready ?? Promise.resolve() },
        { label: "Hero poster", task: waitForImage(criticalPoster.current, "Hero poster") },
        { label: "House Adel mark", task: waitForImage(markReference.current, "House Adel mark") },
        { label: "Spatial capability", task: graphicsTask },
      ];
      const [{ failures, readiness }, graphics] = await Promise.all([
        waitForCriticalAssets(tasks),
        graphicsTask,
      ]);
      if (disposed || finished) return;

      onReport({
        visit,
        graphics,
        motion,
        readiness,
        durationMs: Math.round(performance.now() - startedAt),
        failures,
      });

      if (preview) {
        setPhase("preview");
        return;
      }

      if (motion === "reduced") {
        finish("complete");
        return;
      }

      setPhase("animating");
      const { gsap } = await import("gsap");
      if (disposed || finished) return;
      const revealTargets = contentRoot.current?.querySelectorAll<HTMLElement>(
        "[data-loader-reveal]",
      );
      const compact = window.matchMedia("(max-width: 47.99rem)").matches;
      const firstVisit = visit === "first";
      const exitDuration = firstVisit ? (compact ? 0.52 : 0.68) : 0.32;

      context = gsap.context(() => {
        const timeline = gsap.timeline({
          defaults: { ease: "power3.inOut" },
          onComplete: () => finish("complete"),
        });
        timelineReference.current = timeline;

        if (firstVisit) {
          timeline
            .fromTo(
              sealReference.current,
              { autoAlpha: 0, rotate: -10, scale: 0.94 },
              { autoAlpha: 1, rotate: 0, scale: 1, duration: compact ? 0.42 : 0.56 },
            )
            .to(
              topPathReference.current,
              { attr: { startOffset: compact ? "7%" : "11%" }, duration: compact ? 0.72 : 0.94, ease: "none" },
              0,
            )
            .to(
              bottomPathReference.current,
              { attr: { startOffset: compact ? "5%" : "9%" }, duration: compact ? 0.72 : 0.94, ease: "none" },
              0,
            )
            .fromTo(
              ruleReference.current,
              { scaleX: 0 },
              { scaleX: 1, duration: compact ? 0.62 : 0.82, ease: "power2.inOut" },
              0.08,
            );
        }

        timeline.to(
          overlay,
          { clipPath: "inset(0 0 100% 0)", duration: exitDuration },
          firstVisit ? (compact ? 0.62 : 0.78) : 0,
        );

        if (firstVisit && revealTargets?.length) {
          timeline.fromTo(
            revealTargets,
            { autoAlpha: 0, y: compact ? 10 : 18 },
            {
              autoAlpha: 1,
              y: 0,
              stagger: compact ? 0.035 : 0.055,
              duration: compact ? 0.34 : 0.46,
              ease: "power3.out",
            },
            compact ? 0.84 : 1.02,
          );
        }
      }, overlay);
    };

    void run();

    return () => {
      disposed = true;
      timelineReference.current?.kill();
      timelineReference.current = null;
      context?.revert();
      restoreDocument();
    };
  }, [contentRoot, criticalPoster, graphicsMode, motion, onComplete, onReport, preview, visit]);

  const skip = () => {
    timelineReference.current?.kill();
    finishReference.current("skipped");
  };

  if (phase === "complete") return null;

  return createPortal(
    <div
      ref={overlayReference}
      className={styles.loaderOverlay}
      data-loader-overlay
      data-loader-phase={phase}
      data-motion={motion}
      data-visit={visit}
      role="status"
      aria-live="polite"
      aria-label={
        variant === "production" ? "Preparing House Adel" : "Preparing the House Adel loader study"
      }
    >
      <div className={styles.loaderMasthead} aria-hidden="true">
        <span>House Adel</span>
        <span>{variant === "production" ? "Digital invitation studio" : "Interaction laboratory · 01"}</span>
      </div>

      <div ref={sealReference} className={styles.loaderSeal} aria-hidden="true">
        <svg className={styles.loaderOrbit} viewBox="0 0 240 240">
          <defs>
            <path id="loader-arc-top" d="M30 122 A90 90 0 0 1 210 122" />
            <path id="loader-arc-bottom" d="M210 136 A90 90 0 0 1 30 136" />
          </defs>
          <text textLength="214" lengthAdjust="spacing">
            <textPath ref={topPathReference} href="#loader-arc-top" startOffset="0%">
              HOUSE ADEL · DIGITAL INVITATION HOUSE ·
            </textPath>
          </text>
          <text textLength="202" lengthAdjust="spacing">
            <textPath ref={bottomPathReference} href="#loader-arc-bottom" startOffset="0%">
              ART DIRECTION · DESIGN · DEVELOPMENT ·
            </textPath>
          </text>
        </svg>
        <span className={styles.loaderMarkFrame}>
          <img ref={markReference} src="/adel-mark.svg" alt="" />
        </span>
      </div>

      <span ref={ruleReference} className={styles.loaderRule} aria-hidden="true" />
      <p className={styles.loaderStatus}>
        {phase === "waiting"
          ? variant === "production"
            ? "Preparing type, material and spatial fallback."
            : "Preparing type, image and spatial fallback."
          : "The page is ready."}
      </p>
      <button ref={skipReference} className={styles.loaderSkip} type="button" onClick={skip}>
        Skip animation
      </button>
    </div>,
    document.body,
  );
}
