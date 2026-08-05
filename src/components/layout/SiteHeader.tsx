import { useEffect, useRef, useState } from "react";
import { useAudio } from "../../context/AudioContext";
import { useLanguage } from "../../context/LanguageContext";
import { primaryNavigation } from "../../data/navigation";
import { Link } from "../../lib/router";
import { resolveAppUrl } from "../../lib/basePath";
import styles from "./SiteHeader.module.css";

type SiteHeaderProps = {
  pathname: string;
};

export function SiteHeader({ pathname }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstMenuLink = useRef<HTMLAnchorElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const { language, toggleLanguage } = useLanguage();
  const audio = useAudio();

  const copy = {
    menu: language === "en" ? "Menu" : "Menu",
    close: language === "en" ? "Close" : "Tutup",
    navigation: language === "en" ? "Primary navigation" : "Navigasi utama",
    languageLabel:
      language === "en" ? "Change language to Indonesian" : "Ganti bahasa ke Inggris",
    soundLabel: audio.enabled
      ? language === "en"
        ? "Turn sound off"
        : "Matikan suara"
      : language === "en"
        ? "Turn sound on"
        : "Nyalakan suara",
    studio:
      language === "en"
        ? "Wedding websites · Art direction, design and development"
        : "Situs pernikahan · Arahan seni, desain, dan pengembangan",
  };

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    document.body.dataset.menuOpen = String(menuOpen);
    const inertTargets = [
      document.getElementById("main-content"),
      document.querySelector<HTMLElement>("footer"),
    ].filter((target): target is HTMLElement => Boolean(target));
    const previous = inertTargets.map((target) => target.inert);
    inertTargets.forEach((target) => {
      target.inert = menuOpen;
    });
    if (menuOpen) firstMenuLink.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!menuOpen) return;
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [
        ...(panel.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []),
        menuButton.current,
      ].filter((element): element is HTMLElement => Boolean(element));
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      inertTargets.forEach((target, index) => {
        target.inert = previous[index] ?? false;
      });
      delete document.body.dataset.menuOpen;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const isCurrent = (href: string) => pathname === href;

  return (
    <header className={styles.header} data-open={menuOpen}>
      <div className={`${styles.inner} page-frame`}>
        <Link className={styles.mark} to="/" aria-label="House Adel, home" data-sonic>
          <img className={styles.markSymbol} src={resolveAppUrl("/adel-mark.svg")} alt="" aria-hidden="true" />
          <span>House Adel</span>
        </Link>

        <div className={styles.controls}>
          <button
            className={styles.utilityButton}
            type="button"
            aria-label={copy.languageLabel}
            onClick={toggleLanguage}
            data-sonic
          >
            <span aria-hidden="true">{language === "en" ? "EN" : "ID"}</span>
          </button>
          <button
            className={styles.utilityButton}
            type="button"
            aria-label={copy.soundLabel}
            aria-pressed={audio.enabled}
            onClick={audio.toggle}
            disabled={!audio.supported}
            data-sonic
          >
            <span className={styles.soundDot} data-enabled={audio.enabled} aria-hidden="true" />
            <span aria-hidden="true">{language === "en" ? "Sound" : "Suara"}</span>
          </button>
          <button
            ref={menuButton}
            className={styles.menuButton}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="site-navigation"
            onClick={() => setMenuOpen((open) => !open)}
            data-sonic
          >
            <span>{menuOpen ? copy.close : copy.menu}</span>
            <span className={styles.menuGlyph} aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
      </div>

      <div
        ref={panel}
        className={styles.panel}
        id="site-navigation"
        data-open={menuOpen}
        aria-hidden={!menuOpen}
        role="dialog"
        aria-modal={menuOpen ? "true" : undefined}
        aria-label={copy.navigation}
      >
        <div className={`${styles.panelInner} page-frame`}>
          <p className={styles.studioNote}>{copy.studio}</p>
          <nav className={styles.navigation} aria-label={copy.navigation}>
            {primaryNavigation.map((item, index) => (
              <Link
                ref={index === 0 ? firstMenuLink : undefined}
                className={styles.navigationLink}
                to={item.href}
                key={item.href}
                tabIndex={menuOpen ? 0 : -1}
                aria-current={isCurrent(item.href) ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
                data-sonic
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{language === "en" ? item.label : item.labelId}</strong>
                <em>{isCurrent(item.href) ? (language === "en" ? "Current" : "Aktif") : "↗"}</em>
              </Link>
            ))}
          </nav>
          <div className={styles.panelMeta}>
            <span>Jakarta · Worldwide</span>
            <a href="mailto:studio@houseadel.com" tabIndex={menuOpen ? 0 : -1} data-sonic>
              studio@houseadel.com
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
