import { useEffect, useRef, useState } from "react";
import { primaryNavigation } from "../../data/navigation";
import { Link } from "../../lib/router";
import styles from "./SiteHeader.module.css";

type SiteHeaderProps = {
  pathname: string;
};

export function SiteHeader({ pathname }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstMenuLink = useRef<HTMLAnchorElement>(null);
  const mobilePanel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.dataset.menuOpen = String(menuOpen);
    if (menuOpen) firstMenuLink.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!menuOpen) return;
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;

      const links = [...(mobilePanel.current?.querySelectorAll<HTMLElement>("a[href]") ?? [])];
      const lastLink = links.at(-1);
      if (!event.shiftKey && document.activeElement === lastLink) {
        event.preventDefault();
        menuButton.current?.focus();
      } else if (event.shiftKey && document.activeElement === menuButton.current) {
        event.preventDefault();
        lastLink?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      delete document.body.dataset.menuOpen;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const isCurrent = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  const link = (item: (typeof primaryNavigation)[number]) => (
    <Link
      className={styles.navigationLink}
      to={item.href}
      key={item.href}
      aria-current={isCurrent(item.href) ? "page" : undefined}
    >
      {item.label}
    </Link>
  );

  return (
    <header className={styles.header}>
      <div className={`${styles.inner} page-frame`}>
        <nav className={styles.desktopNavigation} aria-label="Primary navigation">
          <span className={styles.navigationGroup}>{primaryNavigation.slice(0, 3).map(link)}</span>
          <span className={styles.navigationGroup}>{primaryNavigation.slice(3).map(link)}</span>
        </nav>

        <Link className={styles.mark} to="/" aria-label="House Adel, home">
          <img className={styles.markSymbol} src="/adel-mark.svg" alt="" aria-hidden="true" />
          <span>House Adel</span>
        </Link>

        <button
          ref={menuButton}
          className={styles.menuButton}
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span>{menuOpen ? "Close" : "Menu"}</span>
          <span className={styles.menuGlyph} aria-hidden="true">
            {menuOpen ? "×" : "+"}
          </span>
        </button>
      </div>

      <div
        ref={mobilePanel}
        className={styles.mobilePanel}
        id="mobile-navigation"
        data-open={menuOpen}
        aria-hidden={!menuOpen}
        role="dialog"
        aria-modal={menuOpen ? "true" : undefined}
        aria-label="House Adel navigation"
      >
        <nav className={`${styles.mobileNavigation} page-frame`} aria-label="Mobile navigation">
          {primaryNavigation.map((item, index) => (
            <Link
              ref={index === 0 ? firstMenuLink : undefined}
              className={styles.mobileLink}
              to={item.href}
              key={item.href}
              tabIndex={menuOpen ? 0 : -1}
              aria-current={isCurrent(item.href) ? "page" : undefined}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
