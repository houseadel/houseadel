import { useEffect, useRef, useState } from "react";
import { useAudio } from "../../context/AudioContext";
import { useLanguage } from "../../context/LanguageContext";
import { isBackgroundClick } from "../../lib/interactive";
import { interactionLayerDisabled } from "../../lib/preferences";
import styles from "./CursorCompanion.module.css";

/**
 * A dot that sits on the pointer and carries the sound control with it.
 *
 * There is no sound button in the chrome. This is the control: it reads "Click to
 * enable sound", and clicking anywhere that is not already interactive toggles it.
 * The native cursor is never hidden — the dot is drawn alongside it, so the
 * pointer the operating system provides remains the real one, and the label reads
 * off to its right rather than sitting under the hand.
 */
export function CursorCompanion() {
  const audio = useAudio();
  const { language } = useLanguage();
  const haloRef = useRef<HTMLDivElement>(null);
  // Capability decides whether the halo exists, and it has to be decided at first
  // render. An earlier version set this from inside the effect after reading the
  // halo's own ref, which could never be anything but null while the halo was not
  // rendered yet: the companion, its labels and the sound control it carries were
  // all silently dead.
  const [active] = useState(() => !interactionLayerDisabled());
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    if (!active) return;
    const halo = haloRef.current;
    if (!halo) return;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { ...target };
    let frame = 0;

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      target.x = event.clientX;
      target.y = event.clientY;
      // Any element can ask the halo to say something instead of the default.
      const labelled = (event.target as Element | null)?.closest?.("[data-cursor-label]");
      setHint(labelled?.getAttribute("data-cursor-label") ?? null);
      if (!frame) {
        last = performance.now();
        frame = window.requestAnimationFrame(render);
      }
    };

    let last = performance.now();
    const render = (now: number) => {
      const step = Math.min((now - last) / 1000, 0.05);
      last = now;
      // Effectively on the pointer. The damping is kept only to take the
      // stair-stepping off a fast move, and it is against elapsed time rather than
      // a fixed fraction per frame, which would follow at different speeds on
      // 60Hz and 120Hz displays and jerk to catch up after a dropped frame.
      const ease = 1 - Math.pow(1e-11, step);
      current.x += (target.x - current.x) * ease;
      current.y += (target.y - current.y) * ease;
      halo.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-0.15rem, -0.15rem)`;
      // Parked once it has caught up, and woken by the next pointer move. A
      // companion that asks for a frame forever holds the compositor awake for
      // the whole session over a transform that is not changing.
      const settled =
        Math.abs(target.x - current.x) < 0.05 && Math.abs(target.y - current.y) < 0.05;
      frame = settled ? 0 : window.requestAnimationFrame(render);
    };
    frame = window.requestAnimationFrame(render);

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, [active]);

  /*
   * Clicking the page toggles sound. Clicking a control never does.
   *
   * The test used to be a short list written out here — links, buttons and the
   * four form elements someone happened to think of — which meant everything it
   * had not heard of was treated as bare page. Choosing a way to be contacted,
   * pressing a label, opening a disclosure or tapping the questionnaire's own
   * controls all muted the score as a side effect, and the visitor had no way to
   * connect the two.
   *
   * The decision belongs to the site rather than to this listener, so it is
   * asked for by name and made once, semantically, in lib/interactive. Nothing
   * downstream needs a stopPropagation: a control is recognised by what it is,
   * from wherever inside it the click actually landed.
   */
  useEffect(() => {
    if (!active || !audio.supported) return;
    const onClick = (event: MouseEvent) => {
      if (!isBackgroundClick(event)) return;
      audio.toggle();
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [active, audio]);

  if (!active) return null;

  const soundLabel = audio.enabled
    ? language === "en" ? "Click to mute" : "Klik untuk membisukan"
    : language === "en" ? "Click to enable sound" : "Klik untuk menyalakan suara";

  return (
    <div ref={haloRef} className={styles.halo} aria-hidden="true" data-enabled={audio.enabled}>
      <span className={styles.dot} />
      <span className={styles.label}>{hint ?? soundLabel}</span>
    </div>
  );
}
