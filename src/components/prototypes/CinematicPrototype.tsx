import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import { worlds } from "../../data/review";
import { navigate } from "../../lib/router";
import { usePreferences } from "../../lib/preferences";
import { PrototypeShell } from "../PrototypeShell";
import { WorldImage } from "../WorldImage";
import { CinematicScene } from "./cinematic/CinematicScene";

export function CinematicPrototype() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(0);
  const [canvasFailed, setCanvasFailed] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const navigationTimerRef = useRef<number | null>(null);
  const { reduceMotion, graphics } = usePreferences();
  const active = worlds[activeIndex];
  const staticMode = graphics === "fallback" || canvasFailed;
  const handleContextLoss = useCallback(() => setCanvasFailed(true), []);

  useEffect(
    () => () => {
      timelineRef.current?.kill();
      if (navigationTimerRef.current !== null) {
        window.clearTimeout(navigationTimerRef.current);
      }
    },
    [],
  );

  const select = (index: number) => {
    if (index === activeIndex) return;
    setPreviousIndex(activeIndex);
    setActiveIndex(index);
  };

  const enter = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const destination = `/studies/${active.id}?from=cinematic`;
    timelineRef.current?.kill();
    if (navigationTimerRef.current !== null) {
      window.clearTimeout(navigationTimerRef.current);
    }
    if (reduceMotion || !overlayRef.current) {
      navigate(destination);
      return;
    }
    const commitRoute = () => {
      if (navigationTimerRef.current !== null) {
        window.clearTimeout(navigationTimerRef.current);
        navigationTimerRef.current = null;
      }
      navigate(destination);
    };
    timelineRef.current = gsap
      .timeline({ defaults: { ease: "power3.inOut" } })
      .to(".cinematic-copy > *", { opacity: 0, y: -16, stagger: 0.035, duration: 0.28 }, 0)
      .to(".cinematic-index", { opacity: 0, x: 16, duration: 0.3 }, 0)
      .to(imageRef.current, { scale: 1.045, duration: 0.75 }, 0)
      .to(overlayRef.current, { opacity: 1, duration: 0.4 }, 0.34)
      .call(commitRoute);
    navigationTimerRef.current = window.setTimeout(commitRoute, 1_100);
  };

  return (
    <PrototypeShell
      className="prototype-page--cinematic"
      label="Prototype C / asset-led system"
      title="Cinematic compositing"
      note="One shader plane blends generated stills; DOM type and semantic study links remain independent. No complex real-time geometry is used."
    >
      <div className="cinematic-nexus" style={{ "--world-accent": active.accent } as CSSProperties}>
        <div className="cinematic-route-matte" ref={overlayRef} aria-hidden="true" />
        {canvasFailed && (
          <div className="cinematic-fallback-notice" role="status">
            WebGL was lost; the static composition is active.
          </div>
        )}
        {staticMode ? (
          <WorldImage
            world={active}
            className="cinematic-static"
            alt=""
            fetchPriority="high"
          />
        ) : (
          <div className="cinematic-canvas" aria-hidden="true">
            <Canvas
              orthographic
              camera={{ position: [0, 0, 5], zoom: 100 }}
              dpr={window.innerWidth < 720 ? 1 : [1, 1.35]}
              frameloop="demand"
              gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
            >
              <CinematicScene
                activeIndex={activeIndex}
                previousIndex={previousIndex}
                reduceMotion={reduceMotion}
                onContextLoss={handleContextLoss}
              />
            </Canvas>
          </div>
        )}
        <WorldImage
          key={active.id}
          ref={imageRef}
          world={active}
          className="cinematic-foreground"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
        />
        <div className="cinematic-shade" aria-hidden="true" />
        <div className="cinematic-grain" aria-hidden="true" />

        <div className="cinematic-copy">
          <p>{active.eyebrow}</p>
          <h2>{active.title}</h2>
          <p>{active.description}</p>
          <a href={`/studies/${active.id}?from=cinematic`} onClick={enter}>
            Enter this study <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="cinematic-counter" aria-hidden="true">
          <strong>{String(activeIndex + 1).padStart(2, "0")}</strong>
          <span>/ {String(worlds.length).padStart(2, "0")}</span>
        </div>

        <div className="cinematic-index">
          <p>Choose a reality</p>
          {worlds.map((world, index) => (
            <button
              type="button"
              key={world.id}
              aria-pressed={index === activeIndex}
              onClick={() => select(index)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{world.title}</strong>
              <small>{world.type}</small>
            </button>
          ))}
        </div>

        <nav className="cinematic-semantic-links" aria-label="Direct links to every study">
          {worlds.map((world) => (
            <a key={world.id} href={`/studies/${world.id}?from=cinematic`}>
              {world.title}
            </a>
          ))}
        </nav>
      </div>
    </PrototypeShell>
  );
}
