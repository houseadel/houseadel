import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAudio } from "../../context/AudioContext";
import { useLanguage } from "../../context/LanguageContext";
import { primaryNavigation } from "../../data/navigation";
import { Link } from "../../lib/router";
import styles from "./MobileMenu.module.css";

/**
 * Navigation on a phone, as a place rather than a compressed toolbar.
 *
 * The header used to squeeze the desktop navigation into the top right corner:
 * three tracked micro-labels at ten pixels, side by side, on a device operated
 * with a thumb. That is a desktop navigation made smaller, which is not the same
 * thing as a mobile navigation.
 *
 * This is the small set of places this site actually has, set at a size a thumb
 * can hit, with everything that is not a place — the language, the sound — kept
 * peripheral underneath. Nothing is invented: the routes come from the same
 * table the desktop navigation reads.
 *
 * It is also where sound is offered on a phone. The cursor companion carries
 * that offer on a desktop and cannot exist here, and the opening no longer asks
 * on the way in — so the gesture that starts audio is a real press on a real
 * control, which is both what the browser requires and the honest version of it.
 */
export function MobileMenu({ pathname }: { pathname: string }) {
  const { language, toggleLanguage } = useLanguage();
  const audio = useAudio();
  const isEnglish = language === "en";
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const close = useCallback(() => setOpen(false), []);

  // Any route change closes it, including one the reader did not start here:
  // browser Back out of a page reached from this menu should not reveal it
  // still standing open behind the transition.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;

    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    // The trigger lives in the header, and the header is its own stacking
    // context below the panel — so while the panel is up, the control that
    // closes it is painted underneath the thing it closes. The header is lifted
    // over the panel for as long as the menu is open rather than the close
    // button being duplicated inside it.
    document.documentElement.dataset.menu = "open";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        triggerRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      // Kept inside while it is the only thing on screen.
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    // Focus the first route once the panel has actually been painted, so the
    // browser does not scroll to it while it is still transparent.
    const frame = window.requestAnimationFrame(() => {
      panel?.querySelector<HTMLElement>("a[href]")?.focus();
    });

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.cancelAnimationFrame(frame);
      document.documentElement.style.overflow = previous;
      delete document.documentElement.dataset.menu;
    };
  }, [close, open]);

  const soundLabel = audio.enabled
    ? isEnglish ? "Sound on" : "Suara aktif"
    : isEnglish ? "Sound off" : "Suara nonaktif";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((was) => !was)}
        data-sonic
      >
        {open ? (isEnglish ? "Close" : "Tutup") : isEnglish ? "Menu" : "Menu"}
      </button>

      {createPortal(
        <div
          ref={panelRef}
          id={panelId}
          className={styles.panel}
          data-open={open}
          // Hidden from assistive technology and from the tab order while shut,
          // rather than merely transparent.
          inert={open ? undefined : true}
          aria-label={isEnglish ? "Navigation" : "Navigasi"}
        >
          <nav className={styles.routes}>
            {primaryNavigation.map((item, index) => {
              const current = pathname === item.href || (pathname === "/begin-a-project" && item.href === "/contact");
              return (
                <Link
                  key={item.href}
                  className={styles.route}
                  style={{ ["--index" as string]: index }}
                  to={item.href}
                  data-current={current || undefined}
                  aria-current={current ? "page" : undefined}
                  onClick={close}
                  data-sonic
                >
                  {isEnglish ? item.label : item.labelId}
                  {current ? <span className={styles.here} aria-hidden="true" /> : null}
                </Link>
              );
            })}
          </nav>

          <div className={styles.aside}>
            <Link to="/privacy" onClick={close} data-sonic>
              {isEnglish ? "Privacy" : "Privasi"}
            </Link>
            <Link to="/terms" onClick={close} data-sonic>
              {isEnglish ? "Terms" : "Ketentuan"}
            </Link>
            <button type="button" onClick={toggleLanguage} data-sonic>
              {isEnglish ? "Bahasa Indonesia" : "English"}
            </button>
            {audio.supported ? (
              <button type="button" onClick={audio.toggle} aria-pressed={audio.enabled} data-sonic>
                {soundLabel}
              </button>
            ) : null}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
