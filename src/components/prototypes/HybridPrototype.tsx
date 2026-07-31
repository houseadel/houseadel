import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import { worlds, type World } from "../../data/review";
import { navigate } from "../../lib/router";
import { usePreferences } from "../../lib/preferences";
import { PrototypeShell } from "../PrototypeShell";
import { FractureNexus } from "./FractureNexus";
import { HybridScene } from "./hybrid/HybridScene";

export function HybridPrototype() {
  const [active, setActive] = useState<World["id"]>(worlds[0].id);
  const [fallbackReason, setFallbackReason] = useState<"context" | "simulated" | null>(null);
  const matteRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Tween | null>(null);
  const { reduceMotion, graphics } = usePreferences();
  const useFallback = graphics === "fallback" || fallbackReason !== null;
  const handleContextLoss = useCallback(() => setFallbackReason("context"), []);

  useEffect(
    () => () => {
      timelineRef.current?.kill();
    },
    [],
  );

  const enterWorld = (id: World["id"], event?: MouseEvent<HTMLAnchorElement>) => {
    if (event && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return;
    event?.preventDefault();
    const destination = `/studies/${id}?from=hybrid`;
    timelineRef.current?.kill();
    if (reduceMotion || !matteRef.current) {
      navigate(destination);
      return;
    }
    timelineRef.current = gsap.to(matteRef.current, {
      opacity: 1,
      duration: 0.48,
      ease: "power3.inOut",
      onComplete: () => navigate(destination),
    });
  };

  return (
    <PrototypeShell
      className="prototype-page--hybrid"
      label="Prototype B / real-time system"
      title="Hybrid WebGL glass"
      note="R3F mirrors DOM selection through raycasting. The links below remain canonical; context failure activates Prototype A at the same routes."
    >
      <div className="hybrid-nexus">
        <div className="hybrid-transition-matte" ref={matteRef} aria-hidden="true" />
        {useFallback ? (
          <div className="hybrid-fallback">
            <div className="fallback-notice" role="status">
              <span>Static / semantic mode</span>
              <p>
                {fallbackReason === "simulated"
                  ? "A simulated context loss activated the DOM/SVG fallback."
                  : fallbackReason === "context"
                    ? "WebGL was unavailable or lost; the DOM/SVG fallback is active."
                    : "No-WebGL review mode is active."}
              </p>
            </div>
            <FractureNexus embedded source="hybrid" />
          </div>
        ) : (
          <div className="hybrid-canvas" aria-hidden="true">
            <Canvas
              orthographic
              camera={{ position: [0, 0, 10], zoom: 180, near: 0.1, far: 100 }}
              dpr={window.innerWidth < 720 ? 1 : [1, 1.5]}
              gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
              fallback={<div className="canvas-fallback">WebGL unavailable.</div>}
            >
              <HybridScene
                active={active}
                reduceMotion={reduceMotion}
                onActive={setActive}
                onSelect={enterWorld}
                onContextLoss={handleContextLoss}
              />
            </Canvas>
          </div>
        )}

        {!useFallback && (
          <>
            <div className="hybrid-title" aria-hidden="true">
              <span>One surface</span>
              <strong>Three realities</strong>
            </div>
            <nav className="hybrid-dom-links" aria-label="Fictional world studies">
              {worlds.map((world, index) => (
                <a
                  key={world.id}
                  href={`/studies/${world.id}?from=hybrid`}
                  data-active={active === world.id}
                  onPointerEnter={() => setActive(world.id)}
                  onFocus={() => setActive(world.id)}
                  onClick={(event) => enterWorld(world.id, event)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{world.title}</strong>
                  <small>{world.type}</small>
                </a>
              ))}
            </nav>
            <button
              className="context-loss-button"
              type="button"
              onClick={() => setFallbackReason("simulated")}
            >
              Simulate WebGL failure
            </button>
          </>
        )}
      </div>
    </PrototypeShell>
  );
}
