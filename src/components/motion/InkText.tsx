import { createElement, useId, useLayoutEffect, useMemo, useRef } from "react";
import { motionIsReduced } from "../../lib/preferences";
import styles from "./InkText.module.css";

type InkTextProps = {
  as?: "h1" | "h2" | "h3" | "p" | "span";
  children: string;
  className?: string;
  id?: string;
  /** Blur at rest, relative to font size. */
  blurEm?: number;
  durationSeconds?: number;
};

/**
 * Text resolves out of ink and stays resolved.
 *
 * The reveal blurs the whole element through an SVG filter whose alpha is
 * re-contrasted, which is what makes strokes pool together rather than simply
 * going soft, and takes that away as the line arrives.
 *
 * **The reveal is an arrival, not a position.** It used to be scrubbed across a
 * quarter of a screen of scrolling, which tied how sharp a line was to where the
 * page happened to be sitting, and three things followed from that — all of them
 * read as the effect being broken rather than as an effect. The words dissolved
 * again the moment the reader scrolled back up. The last of the blur came off
 * over the final pixels of the range, so a line parked just short of it sat
 * permanently and slightly out of focus, which is the worst possible amount.
 * And the whole thing lagged the wheel by the length of the scrub, so type was
 * still settling after the page had stopped. A line now resolves once, on its
 * own clock, when it arrives — and is then finished with.
 *
 * There is no pointer behaviour here any more. Type used to blur under the hand,
 * character by character; the liquid lens now refracts the finished screen
 * instead, so a hand passing over a line bends and inverts it rather than
 * softening it. Two answers to the same gesture is one too many, and the one
 * that defocuses the words is the wrong one.
 *
 * Characters are grouped into non-breaking words so splitting never changes where
 * a line wraps.
 */

/** How far up the screen a line has to be before it starts resolving. */
const REVEAL_AT = 0.88;

/**
 * How long the resting state may survive without the motion runtime, in ms.
 *
 * The blur is applied synchronously and only ever lifted by a chunk fetched over
 * the network. On a slow connection — or one where that fetch simply fails —
 * there is nothing else standing between the reader and ink that never becomes
 * words, so this is the point at which the type stops waiting and is legible
 * whatever happened to GSAP.
 */
const RESOLVE_DEADLINE = 2000;

export function InkText({
  as = "p",
  children,
  className,
  id,
  blurEm = 0.11,
  durationSeconds = 0.9,
}: InkTextProps) {
  const hostRef = useRef<HTMLElement>(null);
  const filterId = `ink-${useId().replace(/:/g, "")}`;

  // Split once per string, not per render.
  const words = useMemo(() => children.split(/(\s+)/), [children]);

  /*
   * A layout effect, not a passive one, and only because of the first frame.
   *
   * The resting blur is written from here, and React flushes passive effects
   * after the browser has already had the chance to paint — which it takes,
   * because these pages mount WebGL stages that block the main thread for long
   * enough to make that gap visible. The line was appearing sharp, blurring, and
   * then resolving again. Written before paint, the first frame the reader sees
   * is ink.
   */
  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (motionIsReduced()) {
      host.style.filter = "none";
      return;
    }

    let disposed = false;
    let settled = false;
    let played = false;
    let context: { revert: () => void } | undefined;

    const root = document.getElementById(filterId);
    const blurNode = root?.querySelector<SVGFEGaussianBlurElement>("[data-ink-blur]");
    const matrixNode = root?.querySelector<SVGFEColorMatrixElement>("feColorMatrix");

    const setThreshold = (contrast: number, offset: number) =>
      matrixNode?.setAttribute(
        "values",
        `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${contrast} ${offset}`,
      );

    /**
     * The resting blur, read from the type as it is at the moment of asking.
     *
     * Measured rather than remembered, because the reveal now happens whenever
     * the line arrives — which can be long after mount, by which time the
     * webfont has replaced the fallback it was first measured against and a
     * resize may have moved the whole scale.
     */
    const restingBlur = () =>
      (Number.parseFloat(window.getComputedStyle(host).fontSize) || 16) * blurEm;

    /**
     * The resolved end state, reachable from anywhere.
     *
     * Every path out leads here: the reveal finishing, the deadline expiring,
     * the runtime failing to load, the component unmounting. Type left blurred
     * is not a degraded effect, it is unreadable words, so nothing is allowed to
     * stop without passing through this.
     *
     * The filter is handed back to the browser exactly once, at zero blur and an
     * identity threshold, where the filtered and unfiltered renders of the line
     * are the same picture. The old code swapped it out mid-reveal, on the first
     * frame under a hair's width of blur — which changes how the glyphs are
     * rasterised while the reader is looking straight at them, and shows up as
     * the line jumping in weight.
     */
    const settle = () => {
      settled = true;
      blurNode?.setAttribute("stdDeviation", "0");
      setThreshold(1, 0);
      host.style.filter = "none";
    };

    // Seed the resting (blurred) state before GSAP arrives, so sharp text never
    // flashes on first paint...
    blurNode?.setAttribute("stdDeviation", String(restingBlur()));
    setThreshold(8, -1.6);
    host.style.filter = `url(#${filterId})`;
    // ...and give that state a deadline it cannot outlive.
    const deadline = window.setTimeout(settle, RESOLVE_DEADLINE);

    void import("../../lib/motion")
      .then(({ gsap, ScrollTrigger }) => {
        if (disposed || settled || !hostRef.current) return;
        // The deadline guards the wait for this chunk and nothing else. Once it
        // is here, a line below the fold is waiting on the reader rather than on
        // the network, and may wait as long as it likes.
        window.clearTimeout(deadline);

        context = gsap.context(() => {
          const state = { blur: restingBlur(), contrast: 8, offset: -1.6 };
          const apply = () => {
            blurNode?.setAttribute("stdDeviation", String(Math.max(state.blur, 0)));
            setThreshold(state.contrast, state.offset);
          };

          /*
           * One reveal, on its own clock, ending at exactly zero.
           *
           * Silent. Sound answers what the visitor does, not where they have
           * scrolled to; a cue on every line that arrives turns a long page into
           * a sequence of chimes.
           */
          const play = () => {
            if (played || settled) return;
            played = true;
            state.blur = restingBlur();
            apply();
            gsap.to(state, {
              blur: 0,
              contrast: 1,
              offset: 0,
              duration: durationSeconds,
              ease: "power2.out",
              onUpdate: apply,
              onComplete: settle,
            });
          };

          // Anything already on screen resolves now — including a heading above
          // the fold, which under the old scrub was simply declared finished
          // before it had begun and never played at all. Anything still below
          // resolves as it reaches the line, once, and the trigger then retires.
          if (host.getBoundingClientRect().top < window.innerHeight * REVEAL_AT) {
            play();
            return;
          }

          ScrollTrigger.create({
            trigger: host,
            start: `top ${REVEAL_AT * 100}%`,
            once: true,
            onEnter: play,
          });
        }, host);
      })
      .catch(settle);

    return () => {
      disposed = true;
      window.clearTimeout(deadline);
      context?.revert();
      settle();
    };
  }, [blurEm, durationSeconds, filterId, children]);

  return (
    <>
      <svg aria-hidden="true" focusable="false" className={styles.defs}>
        <defs>
          <filter
            id={filterId}
            x="-30%"
            y="-45%"
            width="160%"
            height="190%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="0" result="bleed" data-ink-blur />
            <feColorMatrix
              in="bleed"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 8 -1.6"
              result="pooled"
            />
            <feComposite in="pooled" in2="pooled" operator="atop" />
          </filter>
        </defs>
      </svg>
      {createElement(
        as,
        {
          ref: hostRef,
          className: [styles.host, className].filter(Boolean).join(" "),
          id,
          // A page's h1 is its route heading: what focus moves to after a
          // navigation, what the loader hands focus back to, and what the
          // measurement scripts wait on. Every h1 on this site is an InkText, so
          // marking it here is what keeps that contract from being forgotten.
          ...(as === "h1" ? { "data-route-heading": true, tabIndex: -1 } : {}),
        },
        // Assistive technology reads the sentence, not the pieces. Split into
        // characters the text has no accessible name worth having: engines join
        // the spans with spaces, so a heading is announced letter by letter.
        <span className="sr-only" key="label">
          {children}
        </span>,
        <span aria-hidden="true" key="visual">
          {words.map((word, wordIndex) =>
            /^\s+$/.test(word) ? (
              <span key={`s${wordIndex}`}> </span>
            ) : (
              <span key={`w${wordIndex}`} className={styles.word}>
                {Array.from(word).map((char, charIndex) => (
                  <span key={charIndex} className={styles.char} data-ink-char>
                    {char}
                  </span>
                ))}
              </span>
            ),
          )}
        </span>,
      )}
    </>
  );
}
