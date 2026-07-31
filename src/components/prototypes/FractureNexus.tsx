import { useEffect, useRef, useState, type MouseEvent } from "react";
import gsap from "gsap";
import { worlds, type World } from "../../data/review";
import { navigate } from "../../lib/router";
import { usePreferences } from "../../lib/preferences";
import { WorldImage } from "../WorldImage";

export function FractureNexus({
  embedded = false,
  source = "fracture",
}: {
  embedded?: boolean;
  source?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [active, setActive] = useState(worlds[0].id);
  const [announced, setAnnounced] = useState(worlds[0].title);
  const { reduceMotion } = usePreferences();

  useEffect(
    () => () => {
      timelineRef.current?.kill();
    },
    [],
  );

  const enter = (world: World, event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const destination = `/studies/${world.id}?from=${source}`;

    timelineRef.current?.kill();
    if (reduceMotion || !rootRef.current) {
      navigate(destination);
      return;
    }

    const root = rootRef.current;
    const selected = root.querySelector<HTMLElement>(`[data-world="${world.id}"]`);
    const others = root.querySelectorAll<HTMLElement>(
      `.fracture-panel:not([data-world="${world.id}"])`,
    );
    const labels = root.querySelectorAll<HTMLElement>(".fracture-chrome, .fracture-instruction");

    timelineRef.current = gsap
      .timeline({ defaults: { ease: "power3.inOut" } })
      .to(others, { opacity: 0, scale: 0.94, duration: 0.34 }, 0)
      .to(labels, { opacity: 0, y: -12, duration: 0.25 }, 0)
      .to(
        selected,
        {
          scale: 1.12,
          filter: "saturate(1.08) contrast(1.03)",
          duration: 0.56,
        },
        0,
      )
      .to(".fracture-transition-matte", { opacity: 1, duration: 0.28 }, 0.36)
      .call(() => navigate(destination));
  };

  return (
    <div
      ref={rootRef}
      className={`fracture-nexus ${embedded ? "fracture-nexus--embedded" : ""}`.trim()}
      onPointerLeave={() => setActive(worlds[0].id)}
    >
      <div className="fracture-field" aria-hidden="true" />
      <div className="fracture-transition-matte" aria-hidden="true" />
      <div className="fracture-chrome fracture-chrome--left" aria-hidden="true">
        Connected realities
      </div>
      <div className="fracture-chrome fracture-chrome--right" aria-hidden="true">
        A / DOM + SVG
      </div>

      <nav className="fracture-panels" aria-label="Fictional world studies">
        {worlds.map((world, index) => (
          <a
            href={`/studies/${world.id}?from=${source}`}
            key={world.id}
            className={`fracture-panel fracture-panel--${index + 1}`}
            data-world={world.id}
            data-active={active === world.id}
            onPointerEnter={() => {
              setActive(world.id);
              setAnnounced(world.title);
            }}
            onFocus={() => {
              setActive(world.id);
              setAnnounced(world.title);
            }}
            onClick={(event) => enter(world, event)}
            aria-describedby={`fracture-meta-${world.id}`}
          >
            <WorldImage
              world={world}
              alt=""
              sizes="(max-width: 719px) 90vw, 42vw"
              loading={embedded ? "lazy" : "eager"}
            />
            <span className="fracture-sheen" aria-hidden="true" />
            <span className="fracture-label">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{world.title}</strong>
              <small id={`fracture-meta-${world.id}`}>{world.type}</small>
            </span>
          </a>
        ))}
      </nav>

      <div className="fracture-detail" aria-hidden="true">
        <span style={{ background: worlds.find((world) => world.id === active)?.accent }} />
        <p>{worlds.find((world) => world.id === active)?.palette}</p>
      </div>
      <p className="fracture-instruction">
        <span>Focus, hover, or tap a pane</span>
        <span>All destinations remain semantic links</span>
      </p>
      <p className="sr-only" aria-live="polite">
        Selected study: {announced}
      </p>
    </div>
  );
}
