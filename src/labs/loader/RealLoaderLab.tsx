import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useAudio } from "../../context/AudioContext";
import { useLanguage } from "../../context/LanguageContext";
import { resolveAppUrl } from "../../lib/basePath";
import { loadPointCloud } from "../../features/gallery/pointCloud";
import { OpeningParticles } from "./OpeningParticles";
import { openingHasRun, rememberOpeningRun } from "./visitRecord";
import styles from "./RealLoaderLab.module.css";

const READINESS_TIMEOUT = 3_500;
/*
 * The sculpture is allowed longer than everything else.
 *
 * It is the one critical asset measured in megabytes rather than kilobytes, and
 * it is the subject of the page rather than a detail of it — a page that opens
 * without it has opened wrong, so it is worth waiting appreciably longer for
 * than a font. Long enough to cover a slow connection; still a hard ceiling,
 * because a missing or broken cloud must degrade to a page without a sculpture
 * and never to a site that cannot be entered at all.
 */
const SCULPTURE_TIMEOUT = 8_000;

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
  /**
   * The point cloud the landing page is not finished without.
   *
   * Held to the same standard as the fonts and the poster, because it is the
   * subject of the page rather than an enhancement of it. Null on routes that
   * have no sculpture, and — like every other critical asset here — bounded by
   * the readiness timeout, so a slow or missing cloud delays the handover
   * briefly and never prevents it.
   */
  criticalSculpture?: string | null;
  contentRoot: RefObject<HTMLDivElement | null>;
  graphicsMode: LoaderGraphicsMode;
  preview: boolean;
  visitMode: LoaderVisitMode;
  onComplete: (reason: "complete" | "skipped") => void;
  onReport: (report: LoaderReport) => void;
  variant?: "lab" | "production";
  /**
   * Resolve and hand the site over without asking for anything.
   *
   * The site itself uses this: a visitor should arrive at House Adel, not at a
   * door to it. The sound offer that used to live here is gone with the gate —
   * a browser will not start audio without a gesture anyway, so the offer is
   * made later, by the cursor companion on a desktop and by the menu on a
   * phone, at a moment when the visitor is already interacting and the gesture
   * is real.
   */
  autoEnter?: boolean;
  /**
   * Run the opening even on a return visit.
   *
   * The lab sets it, and so does `?opening` on any address — the opening is a
   * once-per-visitor event, which makes it the one part of the site that cannot
   * be reviewed simply by reloading.
   */
  forceOpening?: boolean;
};

type ReadinessTask = {
  label: string;
  task: Promise<unknown>;
};

function visitForRun(requested: LoaderVisitMode): Exclude<LoaderVisitMode, "auto"> {
  if (requested !== "auto") return requested;
  return openingHasRun() ? "repeat" : "first";
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

/**
 * @param onSettled Called with 0 to 1 as each critical task lands, whether it
 *   succeeded or failed. The opening's fill is driven by this, so it has to
 *   count a failure as progress: an asset that will never arrive is finished
 *   with, and a waterline that stops short of the top because one font 404'd
 *   would hold the site closed over something the page can do without.
 */
async function waitForCriticalAssets(
  tasks: ReadinessTask[],
  timeoutMs: number,
  onSettled?: (fraction: number) => void,
) {
  const failures: string[] = [];
  let settled = 0;
  const trackedTasks = tasks.map(async ({ label, task }) => {
    try {
      await task;
    } catch (error) {
      failures.push(label);
      if (import.meta.env.DEV) console.warn(`[House Adel loader] ${label} did not settle.`, error);
      throw error;
    } finally {
      settled += 1;
      onSettled?.(settled / tasks.length);
    }
  });

  let timeout = 0;
  const readiness = await Promise.race([
    Promise.allSettled(trackedTasks).then(() => "settled" as const),
    new Promise<"timed-out">((resolve) => {
      timeout = window.setTimeout(() => resolve("timed-out"), timeoutMs);
    }),
  ]);
  window.clearTimeout(timeout);
  return { failures, readiness };
}

export function RealLoaderLab({
  criticalPoster,
  criticalSculpture = null,
  contentRoot,
  graphicsMode,
  preview,
  visitMode: requestedVisit,
  onComplete,
  onReport,
  variant = "lab",
  autoEnter = false,
  forceOpening = false,
}: RealLoaderLabProps) {
  const audio = useAudio();
  const { language } = useLanguage();
  const overlayReference = useRef<HTMLDivElement>(null);
  const markReference = useRef<HTMLImageElement>(null);
  const sealReference = useRef<HTMLDivElement>(null);
  const ringReference = useRef<SVGCircleElement>(null);
  const ruleReference = useRef<HTMLSpanElement>(null);
  const skipReference = useRef<HTMLButtonElement>(null);
  const timelineReference = useRef<{ kill: () => void } | null>(null);
  const finishReference = useRef<(reason: "complete" | "skipped") => void>(() => undefined);
  // The exit is declared below the effect that schedules it, so it is reached
  // through a ref rather than by hoisting the whole thing above the timeline.
  const exitReference = useRef<() => void>(() => undefined);
  const [phase, setPhase] = useState<"waiting" | "animating" | "choice" | "preview" | "complete">(
    "waiting",
  );
  const visit = useRef(visitForRun(requestedVisit)).current;
  const motion = useRef<"full" | "reduced">(
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "reduced" : "full",
  ).current;

  /*
   * How much of the critical work has landed, 0 to 1.
   *
   * A ref rather than state: the opening reads it once per frame to set its
   * waterline, and re-rendering the tree on every settled asset to hand over a
   * float is the thing this avoids. The percentage beside the mark is the one
   * part that does need a render, and it arrives already rounded to a whole
   * number, so it costs at most a hundred of them across the whole opening.
   */
  const readinessRef = useRef(0);
  const [level, setLevel] = useState(0);
  /*
   * Whether this visit gets the particle opening.
   *
   * A first visit always does: it is the site introducing itself. A repeat visit
   * does not, because an opening that ran in full every time would be a toll on
   * returning — the short fade below is what a returning reader gets.
   */
  const forced =
    forceOpening || new URLSearchParams(window.location.search).has("opening");
  const runsParticles = motion === "full" && !preview && (visit === "first" || forced);

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
      rememberOpeningRun();
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
        /*
         * The sculpture is fetched and decoded here, not merely started.
         *
         * `loadPointCloud` caches by URL, so this is the very promise the stage
         * itself will await a moment later — waiting on it costs one decode for
         * the whole visit and guarantees the form is standing there when the
         * overlay lifts, rather than arriving into a page the reader is already
         * looking at.
         */
        {
          label: "Sculpture",
          task: criticalSculpture
            ? loadPointCloud(criticalSculpture).then(() => undefined)
            : Promise.resolve(),
        },
      ];
      const [{ failures, readiness }, graphics] = await Promise.all([
        waitForCriticalAssets(
          tasks,
          criticalSculpture ? SCULPTURE_TIMEOUT : READINESS_TIMEOUT,
          (fraction) => {
            readinessRef.current = fraction;
          },
        ),
        graphicsTask,
      ]);
      if (disposed || finished) return;
      // Timed out as well as settled. Whatever did not arrive is not coming
      // within the ceiling, and the opening must not hold at 90% over it.
      readinessRef.current = 1;

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

      /*
       * The particle opening is not sequenced from here.
       *
       * It has been running since mount, drawing the fill against the very
       * readiness figure this function is producing, and it ends the run itself
       * when its last movement is over. There is nothing left for the timeline
       * below to do, and starting one would put a second exit on top of the
       * explosion.
       */
      if (runsParticles) return;

      setPhase("animating");
      const { gsap } = await import("../../lib/motion");
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
          onComplete: () => {
            // Nothing is waiting to be asked for. The opening resolves and hands
            // the site over by itself.
            if (autoEnter) {
              exitReference.current();
              return;
            }
            if (firstVisit) {
              setPhase("choice");
              return;
            }
            finish("complete");
          },
        });
        timelineReference.current = timeline;

        if (firstVisit) {
          const ringLength = ringReference.current?.getTotalLength() ?? 0;
          if (ringReference.current) {
            gsap.set(ringReference.current, {
              strokeDasharray: ringLength,
              strokeDashoffset: ringLength,
            });
          }

          timeline
            .fromTo(
              sealReference.current,
              { autoAlpha: 0, rotate: -10, scale: 0.94 },
              { autoAlpha: 1, rotate: 0, scale: 1, duration: compact ? 0.42 : 0.56 },
              compact ? 0.22 : 0.3,
            )
            .to(
              ringReference.current,
              { strokeDashoffset: 0, duration: compact ? 0.72 : 0.94, ease: "none" },
              0,
            )
            .fromTo(
              ruleReference.current,
              { scaleX: 0 },
              { scaleX: 1, duration: compact ? 0.62 : 0.82, ease: "power2.inOut" },
              0.08,
            );
        }

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

        // The repeat-visit exit is part of the timeline. The automatic opening
        // runs its own, softer one afterwards, so it is left out here rather
        // than wiping and then fading.
        if (!firstVisit && !autoEnter) {
          timeline.to(overlay, { clipPath: "inset(0 0 100% 0)", duration: exitDuration }, 0);
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
  }, [autoEnter, contentRoot, criticalPoster, criticalSculpture, graphicsMode, motion, onComplete, onReport, preview, runsParticles, visit]);

  // The opening finishing *is* the loader finishing: there is no overlay left to
  // fade, because the ground under the particles cleared while they were still
  // in flight.
  const handleOpeningFinished = useCallback(() => finishReference.current("complete"), []);

  const skip = () => {
    timelineReference.current?.kill();
    finishReference.current("skipped");
  };

  /**
   * The overlay lets go.
   *
   * A wipe announces itself; this is meant to be the site simply becoming
   * visible, so the ground fades and the seal settles back a little as it goes.
   * The scale is small and inward, so the opening reads as a layer receding
   * rather than as something being pulled off the screen.
   */
  const exitAndFinish = () => {
    const overlay = overlayReference.current;
    if (!overlay) {
      finishReference.current("complete");
      return;
    }
    const duration = autoEnter ? 620 : 420;
    if (autoEnter) {
      overlay.style.transition = `opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1), transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`;
      overlay.style.opacity = "0";
      overlay.style.transform = "scale(1.035)";
    } else {
      overlay.style.transition = "clip-path 420ms cubic-bezier(0.76, 0, 0.24, 1)";
      overlay.style.clipPath = "inset(0 0 100% 0)";
    }
    window.setTimeout(() => finishReference.current("complete"), duration);
  };
  exitReference.current = exitAndFinish;

  const enterWithSound = () => {
    audio.enable();
    exitAndFinish();
  };

  const continueWithoutSound = () => {
    exitAndFinish();
  };

  if (phase === "complete") return null;

  const id = language === "id";

  return createPortal(
    <div
      ref={overlayReference}
      className={styles.loaderOverlay}
      data-loader-overlay
      data-loader-phase={phase}
      data-motion={motion}
      data-visit={visit}
      // The ground moves to the particle layer's own veil, which has to clear
      // while the cloud is still travelling. Left on the overlay it would hold
      // the site covered until the very last particle had gone.
      data-opening={runsParticles ? "particles" : undefined}
      role="status"
      aria-live="polite"
      aria-label={
        variant === "production" ? "Preparing House Adel" : "Preparing the House Adel loader study"
      }
    >
      {/*
        The mark is in the document either way, because waiting for it is one of
        the readiness tasks and an <img> that is never laid out is an <img> that
        never loads. When the particles are running it is the thing they are
        sampled from rather than the thing on screen, so it is held at a pixel
        and drawn by the canvas instead.
      */}
      <div
        ref={sealReference}
        className={styles.loaderSeal}
        data-sampled={runsParticles || undefined}
        aria-hidden="true"
      >
        {runsParticles ? null : (
          <svg className={styles.loaderOrbit} viewBox="0 0 240 240">
            <circle ref={ringReference} cx="120" cy="120" r="96" />
          </svg>
        )}
        <span className={styles.loaderMarkFrame}>
          <img ref={markReference} src={resolveAppUrl("/adel-mark.svg")} alt="" />
        </span>
      </div>

      {runsParticles ? (
        <>
          <OpeningParticles
            readinessRef={readinessRef}
            markSrc={resolveAppUrl("/adel-mark.svg")}
            sculptureSrc={criticalSculpture}
            onLevel={setLevel}
            onFinished={handleOpeningFinished}
          />
          {/* The figure the waterline is. Set as small as the site sets any
              administrative number, because the mark filling up is the reading
              and this only confirms it. */}
          <p className={styles.loaderLevel} aria-hidden="true">
            {level}
            <span>%</span>
          </p>
        </>
      ) : null}

      {runsParticles ? null : (
        <span ref={ruleReference} className={styles.loaderRule} aria-hidden="true" />
      )}

      {phase === "choice" && !autoEnter ? (
        <div className={styles.loaderChoice} data-loader-reveal>
          <button type="button" className={[styles.loaderChoicePrimary, "action"].join(" ")} onClick={enterWithSound}>
            {id ? "Masuk dengan suara" : "Enter with sound"}
          </button>
          <button type="button" className={[styles.loaderChoiceSecondary, "action"].join(" ")} onClick={continueWithoutSound}>
            {id ? "Lanjutkan tanpa suara" : "Continue without sound"}
          </button>
        </div>
      ) : null}

      {/* There is nothing to skip past when the opening resolves on its own. */}
      {autoEnter ? null : (
        <button ref={skipReference} className={[styles.loaderSkip, "action"].join(" ")} type="button" onClick={skip}>
          {id ? "Lewati" : "Skip"}
        </button>
      )}
    </div>,
    document.body,
  );
}
