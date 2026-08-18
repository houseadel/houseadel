import { useEffect, useRef, useState } from "react";
import { interactionLayerDisabled } from "../../lib/preferences";
import { LiquidField } from "./liquidField";
import styles from "./LiquidLens.module.css";

/**
 * The cursor disturbs the finished screen, not a layer inside it.
 *
 * Everything the site draws — DOM type, photographs, both particle stages, the
 * header, the sound companion, the background itself — is already composited by
 * the time these two layers run. They sit on top of all of it and change what
 * comes out, which is why nothing can be "behind" the effect: there is nothing
 * left to be behind.
 *
 * Two mechanisms, because no single one does both halves.
 *
 * **What the page becomes** is a difference composite. A canvas of the fluid
 * mask is blended over the page with `difference`, so white means the page comes
 * out inverted and black means it comes out exactly as it was. This is real
 * inversion of the real screen; it needs no copy of the content and cannot be
 * out of register with it.
 *
 * **How the page bends** is a backdrop filter. A small box tracking the pointer
 * runs an SVG displacement over whatever the browser has already composited
 * beneath it, which pushes the actual glyphs and the actual photograph sideways.
 * Nothing is blurred: the coordinates move, the pixels stay sharp.
 *
 * The two are stacked so the bend happens first and the inversion reads the bent
 * result, which is the order light would meet them in.
 */

/**
 * Side of the box the backdrop displacement runs inside, in CSS pixels.
 *
 * Kept smaller than the fluid's own splat so the bend is always somewhere the
 * liquid actually is. A larger box warps type a hundred pixels away from any
 * visible trail, and that reads as a lens stuck to the page rather than as the
 * page being disturbed.
 */
const REFRACT_BOX = 210;
/** Peak displacement in CSS pixels, at full pointer speed. */
const REFRACT_SCALE = 20;
/** How far the noise drifts per second, so a still hand still sees it move. */
const NOISE_DRIFT = 34;

function refractionSupported() {
  if (typeof CSS === "undefined" || !CSS.supports) return false;
  return (
    CSS.supports("backdrop-filter", "url(#a)") || CSS.supports("-webkit-backdrop-filter", "url(#a)")
  );
}

export function LiquidLens() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const refractRef = useRef<HTMLDivElement>(null);
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null);
  const noiseOffsetRef = useRef<SVGFEOffsetElement>(null);
  // Decided once, at first render. Reading it later would mean the layers exist
  // for a frame on hardware that cannot run them.
  const [active] = useState(() => !interactionLayerDisabled());
  const [canRefract] = useState(refractionSupported);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const field = LiquidField.create(canvas);
    if (!field) return;

    const refraction = refractRef.current;
    const displacement = displacementRef.current;
    const noiseOffset = noiseOffsetRef.current;

    const pixelRatio = () => Math.min(window.devicePixelRatio || 1, 2);
    /**
     * The canvas's own box, never `window.innerWidth`.
     *
     * A classic scrollbar makes the two differ by its width, and normalising the
     * pointer against the wrong one scales the whole field: the trail then sits
     * increasingly to the right of the hand the further right the hand goes.
     * That is a coordinate bug and it is fixed here rather than compensated for
     * with an offset somewhere downstream.
     */
    let box = canvas.getBoundingClientRect();
    const measure = () => {
      box = canvas.getBoundingClientRect();
      field.resize(box.width, box.height, pixelRatio());
    };
    measure();

    // Where the head of the trail is drawn, and how hard. Eased rather than
    // snapped so the bend has the same weight as the fluid it sits in; the
    // fluid's own injection point is never eased, which is what keeps the
    // liquid registered to the physical pointer.
    const lens = { x: -1e4, y: -1e4, angle: 0, speed: 0, presence: 0 };
    const pointer = { x: -1e4, y: -1e4, seen: false };
    let noisePhase = 0;
    let frame = 0;
    let last = 0;
    let parked = true;

    const start = () => {
      if (frame) return;
      parked = false;
      last = performance.now();
      frame = window.requestAnimationFrame(render);
    };

    const render = (now: number) => {
      const dt = Math.min(Math.max((now - last) / 1000, 0.001), 1 / 30);
      last = now;
      field.step(dt);

      if (refraction && displacement && noiseOffset) {
        // Follows closely but not instantly: the disturbance in a liquid arrives
        // a moment after the finger, and the fluid mask is already exactly on
        // the pointer, so this is the part that is allowed to lag.
        const ease = 1 - Math.pow(0.0004, dt);
        const previousX = lens.x;
        const previousY = lens.y;
        if (!pointer.seen) {
          lens.x = pointer.x;
          lens.y = pointer.y;
        } else {
          lens.x += (pointer.x - lens.x) * ease;
          lens.y += (pointer.y - lens.y) * ease;
        }
        const travel = Math.hypot(lens.x - previousX, lens.y - previousY) / Math.max(dt, 0.001);
        lens.speed += (Math.min(travel / 2200, 1) - lens.speed) * (1 - Math.pow(0.002, dt));
        if (travel > 40) lens.angle = Math.atan2(lens.y - previousY, lens.x - previousX);
        lens.presence += ((field.alive ? 1 : 0) - lens.presence) * (1 - Math.pow(0.004, dt));

        // Pulled out along the direction of travel, the way a drop of ink is.
        const stretch = 1 + lens.speed * 0.85;
        const squash = 1 / (1 + lens.speed * 0.3);
        const size = REFRACT_BOX * (0.62 + lens.presence * 0.38);
        refraction.style.transform =
          `translate3d(${(lens.x - size / 2).toFixed(2)}px, ${(lens.y - size / 2).toFixed(2)}px, 0)` +
          ` rotate(${lens.angle.toFixed(3)}rad) scale(${(stretch * (size / REFRACT_BOX)).toFixed(3)}, ${(squash * (size / REFRACT_BOX)).toFixed(3)})`;
        // Strongest while the hand is moving, gone when it is not. Displacement
        // that persists at rest reads as a lens stuck to the screen.
        const strength =
          REFRACT_SCALE * (0.24 + lens.speed * 0.76) * lens.presence;
        displacement.setAttribute("scale", strength.toFixed(2));
        noisePhase += dt;
        noiseOffset.setAttribute("dx", (Math.sin(noisePhase * 0.7) * NOISE_DRIFT).toFixed(2));
        noiseOffset.setAttribute("dy", (Math.cos(noisePhase * 0.53) * NOISE_DRIFT).toFixed(2));
        refraction.dataset.active = lens.presence > 0.02 ? "true" : "false";
      }

      if (field.alive) {
        frame = window.requestAnimationFrame(render);
        return;
      }
      // Settled. One black frame hands the page back untouched, and the loop
      // stops rather than holding the compositor awake over a still image.
      field.clear();
      if (refraction) refraction.dataset.active = "false";
      frame = 0;
      parked = true;
    };

    const sample = (event: PointerEvent) => {
      // Straight from the pointer into the canvas's own box, with no scroll
      // offset, no transformed parent and no easing in between. The injection
      // point is the physical pointer; only the fluid behind it is allowed to
      // lag.
      field.push(
        (event.clientX - box.left) / box.width,
        1 - (event.clientY - box.top) / box.height,
      );
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      // A mouse reports faster than the display refreshes. Taking every sample
      // the browser coalesced means a fast sweep is one continuous stroke rather
      // than a stroke sampled once a frame with gaps between.
      const coalesced = event.getCoalescedEvents?.() ?? [];
      if (coalesced.length > 1) for (const step of coalesced) sample(step);
      else sample(event);
      if (!pointer.seen) {
        pointer.seen = true;
        lens.x = event.clientX;
        lens.y = event.clientY;
      }
      if (parked) start();
    };

    const onResize = () => {
      measure();
      if (parked) field.clear();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    // The box also changes when a scrollbar appears or disappears, which no
    // resize event announces.
    const observer = new ResizeObserver(onResize);
    observer.observe(canvas);

    const onContextLost = (event: Event) => {
      event.preventDefault();
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      parked = true;
    };
    canvas.addEventListener("webglcontextlost", onContextLost);

    field.clear();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
      canvas.removeEventListener("webglcontextlost", onContextLost);
      field.dispose();
    };
  }, [active]);

  if (!active) return null;

  return (
    <>
      {canRefract ? (
        <svg className={styles.defs} aria-hidden="true" focusable="false">
          <defs>
            <filter
              id="house-adel-liquid-refract"
              x="-30%"
              y="-30%"
              width="160%"
              height="160%"
              colorInterpolationFilters="sRGB"
            >
              {/*
                The shape of the disturbance. Two octaves of fractal noise, wide
                enough that it bends the page in slow folds rather than shaking
                it — this is a liquid surface being pushed, not a glitch.
              */}
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.0065 0.009"
                numOctaves={2}
                seed={11}
                result="noise"
              />
              {/* Scrolled rather than reseeded: reseeding rebuilds the whole
                  field every frame and pops as it does. */}
              <feOffset ref={noiseOffsetRef} in="noise" dx="0" dy="0" result="flow" />
              <feDisplacementMap
                ref={displacementRef}
                in="SourceGraphic"
                in2="flow"
                scale="0"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      ) : null}
      {canRefract ? (
        <div
          ref={refractRef}
          className={styles.refraction}
          data-active="false"
          aria-hidden="true"
          style={{ width: REFRACT_BOX, height: REFRACT_BOX }}
        />
      ) : null}
      <canvas ref={canvasRef} className={styles.composite} aria-hidden="true" />
    </>
  );
}
