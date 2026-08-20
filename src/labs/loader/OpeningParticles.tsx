import { useEffect, useRef } from "react";
import { loadPointCloud } from "../../features/gallery/pointCloud";
import { fieldFromCloud, fieldFromSvg, type PointField } from "./pointFields";
import styles from "./OpeningParticles.module.css";

/**
 * The opening, as one cloud of particles becoming two things in turn.
 *
 * A loader is a promise about what is coming, and the old one made the wrong
 * promise: a ring stroking itself around a small mark said "a form is being
 * drawn", which is a graphic, when the site it opens onto is a figure held as
 * points. This one says what is true — the site is made of particles, and here
 * they are, gathering.
 *
 * Four movements, and no cut anywhere in them:
 *
 * **The fill.** Particles drift as dust across the whole frame, and the House
 * Adel mark fills from its foot upward as the critical assets settle. The
 * waterline *is* the readiness figure, so the percentage is not a decoration
 * printed beside a spinner: at a hundred per cent the mark is exactly full,
 * because full is what a hundred per cent means.
 *
 * **The settle.** The mark holds, complete, for long enough to be seen.
 *
 * **The jitter.** It shakes, briefly. The beat that makes the last movement read
 * as a release rather than as a switch being thrown.
 *
 * **The morph.** The mark becomes the figure the landing page stands on. It does
 * not come apart and it does not explode: the same particles travel to the
 * silhouette of the sculpture, at the exact size and position the WebGL stage is
 * about to draw it, and the two are cross-faded. The page is uncovered underneath
 * a form that is already the right one, and the type fades in over it.
 *
 * Drawn on a 2D canvas rather than in WebGL on purpose. The opening runs while
 * the relief stage behind it is already building its own context, and the site's
 * whole graphics budget is two live scenes; a third context taken and dropped
 * during the first second of a visit is how a page arrives with its sculpture
 * missing. A few thousand rectangles a frame is nothing, and it cannot fail.
 */

/** Density. Enough to read as a surface, few enough to cost nothing on a phone. */
const DESKTOP_POINTS = 5400;
const MOBILE_POINTS = 2400;

/**
 * The floor under the fill's pace.
 *
 * Assets that are already in cache settle in one frame, which without this makes
 * the whole opening a single-frame jump from empty to full. The waterline is
 * still honest — it never shows more than has actually settled — it is only
 * forbidden from rising faster than the eye can follow.
 */
const FILL_RATE = 0.95;

/**
 * The beat between the waterline reaching the top and the shake starting.
 *
 * Without it the mark is never actually seen. The particles that complete the
 * fill are the ones that have only just been released, so at the instant the
 * figure reads a hundred per cent they are still crossing the frame — and the
 * jitter, which is supposed to be a formed thing vibrating, was being applied to
 * a cloud still on its way in. The opening arrives at its own subject and holds
 * there for a moment before anything else happens.
 */
const SETTLE_MS = 480;

/** How long the full mark holds and shakes before it lets go. */
const JITTER_MS = 700;

const BINS = 6;

type Phase = "fill" | "settle" | "jitter" | "ending";

type Props = {
  /** 0 to 1, how much of the critical work has settled. Read per frame. */
  readinessRef: { current: number };
  /** The House Adel mark, already resolved against the deployment base. */
  markSrc: string;
  /** The landing page's baked cloud. The mark becomes its silhouette. */
  sculptureSrc?: string | null;
  /** The whole-percent fill level, for the readout beside the mark. */
  onLevel?: (percent: number) => void;
  /** The opening is over and the site is uncovered. */
  onFinished: () => void;
};

export function OpeningParticles({
  readinessRef,
  markSrc,
  sculptureSrc = null,
  onLevel,
  onFinished,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  // Read through refs so a change of callback identity cannot restart the
  // opening halfway through it.
  const finishedRef = useRef(onFinished);
  finishedRef.current = onFinished;
  const levelRef = useRef(onLevel);
  levelRef.current = onLevel;

  useEffect(() => {
    const canvas = canvasRef.current;
    const veil = veilRef.current;
    if (!canvas || !veil) return;
    const context = canvas.getContext("2d");
    if (!context) {
      finishedRef.current();
      return;
    }

    let disposed = false;
    let frame = 0;

    const compact = window.matchMedia("(max-width: 47.99rem)").matches;
    const count = compact ? MOBILE_POINTS : DESKTOP_POINTS;

    // Position, velocity, the mark's own target, the drift home, the ending's
    // target, and the per-particle constants. Held as parallel arrays because
    // this loop touches every one of them every frame.
    const px = new Float32Array(count);
    const py = new Float32Array(count);
    const vx = new Float32Array(count);
    const vy = new Float32Array(count);
    const markX = new Float32Array(count);
    const markY = new Float32Array(count);
    const driftX = new Float32Array(count);
    const driftY = new Float32Array(count);
    const figureX = new Float32Array(count);
    const figureY = new Float32Array(count);
    const fillAt = new Float32Array(count);
    const lit = new Float32Array(count);
    const dot = new Float32Array(count);
    const stiffness = new Float32Array(count);

    const bins: Int32Array[] = Array.from({ length: BINS }, () => new Int32Array(count));
    const binCounts = new Int32Array(BINS);

    let width = 0;
    let height = 0;
    let markUnit = 0;
    let mark: PointField | null = null;
    let figure: PointField | null = null;
    let figureUnit = 0;

    const paper =
      getComputedStyle(document.documentElement).getPropertyValue("--color-paper").trim() ||
      "#f2efe9";

    /** The mark's fitted size. Deliberately large: it is the subject, not a badge. */
    const unitFor = (w: number, h: number) => Math.min(w * 0.62, h * 0.58);

    const resize = () => {
      /*
       * Capped at 1.25 on a narrow viewport, the same ceiling every other canvas
       * on the site holds to — this one had been left at the flat desktop figure
       * of 2, which on an actual phone (commonly 2-3 already) drew the opening at
       * its native resolution instead of the site's mobile budget. A drifting
       * dust field carries no fine detail for the extra density to serve.
       */
      const dpr = Math.min(window.devicePixelRatio || 1, compact ? 1.25 : 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const next = unitFor(width, height);
      if (mark && markUnit > 0 && next !== markUnit) {
        // Carry the run across the resize rather than restarting it: positions
        // are held in pixels, so they are rescaled by the same factor the
        // targets are.
        const factor = next / markUnit;
        for (let i = 0; i < count; i += 1) {
          px[i] *= factor;
          py[i] *= factor;
          markX[i] *= factor;
          markY[i] *= factor;
          driftX[i] *= factor;
          driftY[i] *= factor;
        }
      }
      markUnit = next;
      if (mark) buildFigureTargets();
    };

    /**
     * Where the figure sits on screen, in pixels from the centre.
     *
     * Fitted to the framing `ReliefStage` will give it a moment later, worked out
     * from the same contain-fit the stage uses, so the cloud the particles resolve
     * into is exactly the size and position the real one arrives at. That is what
     * makes the handover invisible: the particle figure and the WebGL figure are
     * the same picture, so one can be faded out under the other. Landing on a
     * figure of the wrong size is worse than not landing on one at all — it reads
     * as the page correcting itself.
     */
    const buildFigureTargets = () => {
      if (!figure) return;
      const RELIEF_ASPECT = 0.5892;
      const CONTAIN_SCALE = 1.16;
      const CLOUD_FIT = 0.98;
      figureUnit = CLOUD_FIT * CONTAIN_SCALE * Math.min(width / RELIEF_ASPECT, height);

      for (let i = 0; i < count; i += 1) {
        figureX[i] = figure.points[i * 2] * figureUnit;
        figureY[i] = figure.points[i * 2 + 1] * figureUnit;
      }
    };

    const seed = () => {
      if (!mark) return;
      let minY = Infinity;
      let maxY = -Infinity;
      for (let i = 0; i < count; i += 1) {
        const y = mark.points[i * 2 + 1];
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
      const span = Math.max(maxY - minY, 0.0001);
      const radius = Math.max(width, height) * 0.62;

      for (let i = 0; i < count; i += 1) {
        markX[i] = mark.points[i * 2] * markUnit;
        markY[i] = mark.points[i * 2 + 1] * markUnit;

        /*
         * Filled from the foot upward, with the waterline deliberately ragged.
         *
         * A clean horizontal edge climbing the glyph reads as a progress bar
         * wearing a logo. The jitter on the threshold is what turns it into
         * something settling — particles near the line arrive out of order, so
         * the boundary is a zone rather than a rule.
         */
        const base = (maxY - mark.points[i * 2 + 1]) / span;
        fillAt[i] = Math.min(Math.max(base * 0.94 + (Math.random() - 0.5) * 0.1, 0), 0.985);

        const angle = Math.random() * Math.PI * 2;
        const distance = radius * (0.55 + Math.random() * 0.75);
        driftX[i] = Math.cos(angle) * distance;
        driftY[i] = Math.sin(angle) * distance * 0.8;
        px[i] = driftX[i];
        py[i] = driftY[i];
        vx[i] = 0;
        vy[i] = 0;
        lit[i] = 0;
        dot[i] = 0.9 + Math.random() * 1.15;
        /*
         * Stiff enough to arrive, spread enough not to arrive together.
         *
         * A single stiffness across the field makes the mark snap into place as
         * one object, which reads as an image being switched on. The spread is
         * what turns it into a form gathering: the ones that get there first
         * hold the shape while the rest are still coming.
         */
        stiffness[i] = 0.17 + Math.random() * 0.1;
      }
    };

    /*
     * Published on the canvas as well as held here.
     *
     * The opening is four movements long and every one of them is a few hundred
     * milliseconds, which makes "did it do the right thing" almost impossible to
     * answer from a screenshot: a loose cloud is either a form still gathering or
     * a form already shaking, and those are opposite bugs. A test — or a person
     * with the element inspector open — can read which one it is.
     */
    let phase: Phase = "fill";
    const setPhase = (next: Phase) => {
      phase = next;
      canvas.dataset.openingPhase = next;
    };
    setPhase("fill");
    let shown = 0;
    let reported = -1;
    let phaseStart = 0;
    let started = 0;
    let last = 0;
    let fade = 1;

    /**
     * The morph, and the handover inside it.
     *
     * There is no explosion. The mark does not come apart and get replaced by the
     * page; it *becomes* the figure the page stands on, and the page is uncovered
     * underneath a form that is already the right one. Which means the veil can
     * only clear once the figure has actually arrived — clearing it early, as a
     * burst can afford to, would show the reader the real sculpture sitting behind
     * a cloud still on its way to the same place.
     */
    const MORPH_MS = 1150;
    const HOLD_MS = 260;
    const HANDOVER_MS = 620;
    const endingLength = MORPH_MS + HOLD_MS + HANDOVER_MS;

    const step = (now: number) => {
      if (disposed) return;
      frame = window.requestAnimationFrame(step);
      if (!mark) return;
      if (!started) {
        started = now;
        last = now;
      }
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;
      // Normalised against sixty frames a second, so the springs below behave
      // the same on a 120Hz screen as on a 60Hz one.
      /*
       * Capped, because these are springs and springs explode.
       *
       * `v += (target - p) * k; v *= damping; p += v * tick` is stable only while
       * `tick` stays near one. It is not a frame-rate normaliser that can be
       * trusted with any value: past about 1.7 the correction overshoots further
       * than it started, the next frame overshoots further still, and the cloud
       * blows apart instead of gathering.
       *
       * Which is exactly when it happens. The morph runs at the moment the relief
       * stage behind the overlay is compiling shaders and taking its WebGL
       * context, so frames there are the longest of the whole visit — the form
       * came apart precisely where it was supposed to resolve. Capping means a
       * stalled frame advances the simulation a little less rather than
       * catastrophically too much; the phases are on the wall clock, so nothing
       * drifts out of time.
       */
      const tick = Math.min(delta * 60, 1.6);

      if (phase === "fill") {
        /*
         * The waterline never overstates what has settled, but it is allowed to
         * creep while nothing is settling. A load that stalls on one slow asset
         * would otherwise show a mark frozen at the height of the last thing
         * that finished, which reads as a broken page rather than a slow one.
         */
        const creep = Math.min(0.9, (now - started) / 4200);
        const target = Math.max(readinessRef.current, creep);
        shown += Math.max(0, Math.min(target - shown, FILL_RATE * delta));
        const percent = Math.round(shown * 100);
        if (percent !== reported) {
          reported = percent;
          levelRef.current?.(percent);
        }
        if (shown >= 0.999 && readinessRef.current >= 1) {
          setPhase("settle");
          phaseStart = now;
        }
      }

      if (phase === "settle" && now - phaseStart >= SETTLE_MS) {
        setPhase("jitter");
        phaseStart = now;
      }

      const jitter =
        phase === "jitter" ? Math.sin(((now - phaseStart) / JITTER_MS) * Math.PI) : 0;

      if (phase === "jitter" && now - phaseStart >= JITTER_MS) {
        setPhase("ending");
        phaseStart = now;
      }

      const endAge = phase === "ending" ? now - phaseStart : 0;

      if (phase === "ending") {
        /*
         * The cross-fade, once the figure is standing.
         *
         * The particle figure and the WebGL one occupy the same pixels, so the
         * ground under the particles is taken away and the particles are taken
         * away with it, over the same span. What the reader sees is one figure
         * throughout: the same form, handed from a canvas to a scene.
         */
        const handover = Math.min(Math.max((endAge - MORPH_MS - HOLD_MS) / HANDOVER_MS, 0), 1);
        veil.style.opacity = (1 - handover).toFixed(3);
        fade = 1 - handover;
        if (endAge >= endingLength) {
          disposed = true;
          window.cancelAnimationFrame(frame);
          finishedRef.current();
          return;
        }
      }

      const morphing = phase === "ending" && figure !== null;

      for (let i = 0; i < count; i += 1) {
        if (morphing) {
          // Straight to where it belongs. Harder than the fill's spring and
          // damped harder with it, because the morph has about a second to
          // resolve a form the reader is meant to recognise, where the fill had
          // the whole load to do it in.
          const k = stiffness[i] * 1.25;
          vx[i] += (figureX[i] - px[i]) * k;
          vy[i] += (figureY[i] - py[i]) * k;
          vx[i] *= 0.68;
          vy[i] *= 0.68;
        } else if (phase === "ending") {
          // No figure to become — a cloud that failed to load, or a route with
          // no sculpture. The mark simply settles and the page is uncovered
          // under it rather than the opening stalling on a missing asset.
          vx[i] *= 0.86;
          vy[i] *= 0.86;
        } else if (shown > fillAt[i]) {
          let tx = markX[i];
          let ty = markY[i];
          if (jitter > 0) {
            const shake = jitter * markUnit * 0.02;
            tx += (Math.random() - 0.5) * shake;
            ty += (Math.random() - 0.5) * shake;
          }
          vx[i] += (tx - px[i]) * stiffness[i];
          vy[i] += (ty - py[i]) * stiffness[i];
          vx[i] *= 0.74;
          vy[i] *= 0.74;
          lit[i] += (1 - lit[i]) * Math.min(1, tick * 0.11);
        } else {
          // Dust. Held loosely around its drift point so the frame is alive
          // before the mark has anything in it, and kept well below the mark's
          // own brightness so the two never compete: at anything nearer, four
          // thousand points spread over the frame read as the subject and the
          // logo reads as a denser patch of them.
          vx[i] += (driftX[i] - px[i]) * 0.0035;
          vy[i] += (driftY[i] - py[i]) * 0.0035;
          vx[i] *= 0.95;
          vy[i] *= 0.95;
          lit[i] += (0.09 - lit[i]) * Math.min(1, tick * 0.05);
        }
        px[i] += vx[i] * tick;
        py[i] += vy[i] * tick;
      }

      binCounts.fill(0);
      for (let i = 0; i < count; i += 1) {
        const value = lit[i] * fade;
        if (value <= 0.02) continue;
        let bin = (value * BINS) | 0;
        if (bin >= BINS) bin = BINS - 1;
        bins[bin][binCounts[bin]] = i;
        binCounts[bin] += 1;
      }

      context.clearRect(0, 0, width, height);
      context.save();
      context.translate(width / 2, height / 2);
      context.fillStyle = paper;
      for (let bin = 0; bin < BINS; bin += 1) {
        const n = binCounts[bin];
        if (n === 0) continue;
        context.globalAlpha = ((bin + 1) / BINS) * 0.92;
        const list = bins[bin];
        for (let k = 0; k < n; k += 1) {
          const i = list[k];
          const size = dot[i];
          context.fillRect(px[i] - size / 2, py[i] - size / 2, size, size);
        }
      }
      context.restore();
      context.globalAlpha = 1;
    };

    const onResize = () => resize();

    const begin = async () => {
      const markField = await fieldFromSvg(markSrc, count);
      if (disposed) return;
      if (markField.count === 0) {
        finishedRef.current();
        return;
      }
      mark = markField;
      resize();
      seed();

      /*
       * The figure is prepared during the fill, not when it is needed.
       *
       * Sampling a hundred and fifty thousand cloud points takes a frame or two,
       * and spending them at the moment the mark begins to move would put a
       * stutter exactly where the movement has to be smoothest. A failure here is
       * not fatal: `figure` stays null, the mark settles where it is, and the
       * page is uncovered under it.
       */
      if (sculptureSrc) {
        try {
          const cloud = await loadPointCloud(sculptureSrc);
          if (disposed) return;
          figure = fieldFromCloud(cloud, count);
        } catch {
          figure = null;
        }
      }

      if (figure && figure.count === count) buildFigureTargets();
      else figure = null;

      window.addEventListener("resize", onResize, { passive: true });
      frame = window.requestAnimationFrame(step);
    };

    void begin();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, [markSrc, readinessRef, sculptureSrc]);

  return (
    <>
      <div ref={veilRef} className={styles.veil} aria-hidden="true" />
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
    </>
  );
}
