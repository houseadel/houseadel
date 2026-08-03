import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { SpatialFallback } from "./SpatialFallback";
import { setSpatialPointer, setSpatialProgress } from "./spatialState";
import styles from "./SpatialOpening.module.css";

const SpatialCanvas = lazy(() => import("./SpatialCanvas"));

type SpatialOpeningProps = {
  children: ReactNode;
  className: string;
  stageClassName: string;
};

type GraphicsState = "fallback" | "loading" | "ready";
type MotionPreference = "pending" | "full" | "reduce";

class SpatialCanvasBoundary extends Component<
  { children: ReactNode; onUnavailable: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
    this.props.onUnavailable();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function userRequestedFallback() {
  try {
    return window.localStorage.getItem("house-adel:graphics") === "fallback";
  } catch {
    return false;
  }
}

function connectionRequestsRestraint() {
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean };
    }
  ).connection;

  return connection?.saveData === true;
}

function supportsWebGL() {
  if (import.meta.env.MODE === "test") return false;
  return typeof window.WebGL2RenderingContext !== "undefined";
}

export function SpatialOpening({ children, className, stageClassName }: SpatialOpeningProps) {
  const rootReference = useRef<HTMLElement>(null);
  const [graphicsState, setGraphicsState] = useState<GraphicsState>("fallback");
  const [motionPreference, setMotionPreference] = useState<MotionPreference>("pending");
  const [stageVisible, setStageVisible] = useState(true);
  const [documentVisible, setDocumentVisible] = useState(!document.hidden);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forcedColors = window.matchMedia("(forced-colors: active)");
    let firstFrame = 0;
    let secondFrame = 0;
    let enhancementTimer = 0;
    let selection = 0;
    let removeIntentListeners = () => {};

    const selectGraphicsMode = () => {
      const currentSelection = ++selection;
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(enhancementTimer);
      removeIntentListeners();

      const restrainedMotion = reducedMotion.matches || forcedColors.matches;
      setMotionPreference(restrainedMotion ? "reduce" : "full");

      if (
        restrainedMotion ||
        userRequestedFallback() ||
        connectionRequestsRestraint() ||
        !supportsWebGL()
      ) {
        setGraphicsState("fallback");
        return;
      }

      let requested = false;
      const requestEnhancement = () => {
        if (requested || currentSelection !== selection) return;
        requested = true;
        removeIntentListeners();
        setGraphicsState("loading");
      };
      const intentEvents = ["pointerdown", "touchstart", "wheel", "keydown"] as const;
      intentEvents.forEach((eventName) =>
        window.addEventListener(eventName, requestEnhancement, { passive: true }),
      );
      window.addEventListener("house-adel:request-graphics", requestEnhancement);
      removeIntentListeners = () => {
        intentEvents.forEach((eventName) =>
          window.removeEventListener(eventName, requestEnhancement),
        );
        window.removeEventListener("house-adel:request-graphics", requestEnhancement);
      };

      // The code-drawn fallback is already a complete composition. Load the optional
      // renderer on visitor intent, or after a quiet grace period, without moving content.
      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => {
          enhancementTimer = window.setTimeout(requestEnhancement, 12_000);
        });
      });
    };

    selectGraphicsMode();
    reducedMotion.addEventListener("change", selectGraphicsMode);
    forcedColors.addEventListener("change", selectGraphicsMode);

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(enhancementTimer);
      removeIntentListeners();
      selection += 1;
      reducedMotion.removeEventListener("change", selectGraphicsMode);
      forcedColors.removeEventListener("change", selectGraphicsMode);
    };
  }, []);

  useEffect(() => {
    const root = rootReference.current;
    if (!root || !window.IntersectionObserver) return;

    const observer = new IntersectionObserver(
      ([entry]) => setStageVisible(entry.isIntersecting),
      { rootMargin: "15% 0px" },
    );
    observer.observe(root);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateVisibility = () => setDocumentVisible(!document.hidden);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(() => {
    const root = rootReference.current;
    if (!root || motionPreference === "pending") return;

    if (motionPreference === "reduce") {
      root.dataset.spatialMotion = "reduced";
      root.dataset.spatialProgress = "static";
      setSpatialProgress(0.44);
      return () => setSpatialProgress(0);
    }

    root.dataset.spatialMotion = "full";
    const stage = root.querySelector<HTMLElement>("[data-spatial-stage]");
    const fallback = root.querySelector<HTMLElement>("[data-spatial-fallback]");
    const canvasLayer = root.querySelector<HTMLElement>("[data-spatial-canvas-layer]");
    const content = root.querySelector<HTMLElement>("[data-spatial-content]");
    const leftPlane = root.querySelector<HTMLElement>("[data-spatial-plane='left']");
    const rightPlane = root.querySelector<HTMLElement>("[data-spatial-plane='right']");
    const floorPlane = root.querySelector<HTMLElement>("[data-spatial-plane='floor']");
    const vellum = root.querySelector<HTMLElement>("[data-spatial-plane='vellum']");
    const aperture = root.querySelector<HTMLElement>("[data-spatial-aperture]");

    if (!stage || !fallback || !content || !aperture) return;

    const compact = window.matchMedia("(max-width: 47.99rem)").matches;
    const finePointer = window.matchMedia("(pointer: fine)");
    const handlePointer = (event: PointerEvent) => {
      if (!finePointer.matches) return;
      const bounds = root.getBoundingClientRect();
      const pointerX = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      const pointerY = ((event.clientY - bounds.top) / Math.min(bounds.height, window.innerHeight)) * 2 - 1;
      setSpatialPointer(pointerX, pointerY);
    };
    const resetPointer = () => setSpatialPointer(0, 0);
    let cancelled = false;
    let disposeMotion: (() => void) | undefined;
    let motionTimer = 0;
    let motionRequested = false;
    const motionIntentEvents = ["wheel", "touchstart", "scroll", "keydown"] as const;
    const removeMotionIntentListeners = () => {
      motionIntentEvents.forEach((eventName) =>
        window.removeEventListener(eventName, requestMotion),
      );
      window.removeEventListener("house-adel:request-graphics", requestMotion);
    };
    const requestMotion = () => {
      if (motionRequested || cancelled) return;
      motionRequested = true;
      window.clearTimeout(motionTimer);
      removeMotionIntentListeners();
      void import("../../lib/motion").then(({ gsap }) => {
        if (cancelled) return;
        const context = gsap.context(() => {
          const timeline = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: root,
              start: () => {
                const headerHeight =
                  document.querySelector("header")?.getBoundingClientRect().height ?? 0;
                return `top top+=${Math.round(headerHeight)}`;
              },
              end: "bottom bottom",
              invalidateOnRefresh: true,
              scrub: 0.38,
              onRefresh: (self) => {
                root.dataset.spatialProgress = self.progress.toFixed(3);
                setSpatialProgress(self.progress);
              },
              onUpdate: (self) => {
                root.dataset.spatialProgress = self.progress.toFixed(3);
                stage.style.setProperty("--spatial-progress", self.progress.toFixed(4));
                setSpatialProgress(self.progress);
              },
            },
          });

          timeline
            .to(leftPlane, { rotation: 0, xPercent: 14, yPercent: -7, duration: 0.46 }, 0)
            .to(rightPlane, { rotation: 0, xPercent: -12, yPercent: 10, duration: 0.46 }, 0)
            .to(
              floorPlane,
              { rotation: 0, skewX: 0, xPercent: -8, yPercent: -8, duration: 0.46 },
              0,
            )
            .to(vellum, { rotation: 0, xPercent: -9, yPercent: -6, duration: 0.46 }, 0)
            .to(
              aperture,
              {
                scale: compact ? 1.34 : 1.66,
                xPercent: -50,
                yPercent: compact ? 3 : -2,
                duration: 0.48,
              },
              0.36,
            )
            .to(content, { yPercent: -2.4, duration: 1 }, 0)
            .to(fallback, { opacity: 0.12, duration: 0.2 }, 0.8);

          if (canvasLayer) timeline.to(canvasLayer, { opacity: 0.08, duration: 0.2 }, 0.8);
        }, root);

        root.addEventListener("pointermove", handlePointer, { passive: true });
        root.addEventListener("pointerleave", resetPointer);
        disposeMotion = () => {
          root.removeEventListener("pointermove", handlePointer);
          root.removeEventListener("pointerleave", resetPointer);
          context.revert();
        };
      });
    };
    motionIntentEvents.forEach((eventName) =>
      window.addEventListener(eventName, requestMotion, { passive: true }),
    );
    window.addEventListener("house-adel:request-graphics", requestMotion);
    motionTimer = window.setTimeout(requestMotion, 12_000);

    return () => {
      cancelled = true;
      window.clearTimeout(motionTimer);
      removeMotionIntentListeners();
      disposeMotion?.();
      stage.style.removeProperty("--spatial-progress");
      setSpatialPointer(0, 0);
      setSpatialProgress(0);
    };
  }, [motionPreference]);

  const renderCanvas = graphicsState !== "fallback";
  const sceneActive = stageVisible && documentVisible;

  return (
    <section
      ref={rootReference}
      className={className}
      aria-labelledby="home-title"
      data-graphics={graphicsState}
      data-spatial-opening
    >
      <div className={stageClassName} data-spatial-stage>
        <SpatialFallback />
        <div
          className={styles.canvasLayer}
          data-active={sceneActive ? "true" : "false"}
          data-ready={graphicsState === "ready" ? "true" : "false"}
          data-spatial-canvas-layer
        >
          {renderCanvas ? (
            <SpatialCanvasBoundary onUnavailable={() => setGraphicsState("fallback")}>
              <Suspense fallback={null}>
                <SpatialCanvas
                  active={sceneActive}
                  onReady={() => setGraphicsState("ready")}
                  onUnavailable={() => setGraphicsState("fallback")}
                />
              </Suspense>
            </SpatialCanvasBoundary>
          ) : null}
        </div>
        {children}
        <div className={styles.progressRule} aria-hidden="true" data-spatial-progress-rule />
      </div>
    </section>
  );
}
