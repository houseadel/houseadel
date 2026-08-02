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

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.dataset.menuOpen = String(menuOpen);
    if (menuOpen) firstMenuLink.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !menuOpen) return;
      setMenuOpen(false);
      menuButton.current?.focus();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      delete document.body.dataset.menuOpen;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const isCurrent = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <header className={styles.header}>
      <div className={`${styles.inner} page-frame`}>
        <Link className={styles.mark} to="/" aria-label="House Adel, home">
          House Adel
        </Link>

        <nav className={styles.desktopNavigation} aria-label="Primary navigation">
          {primaryNavigation.map((item) => (
            <Link
              className={styles.navigationLink}
              to={item.href}
              key={item.href}
              aria-current={isCurrent(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

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
            {menuOpen ? "×" : "＋"}
          </span>
        </button>
      </div>

      <div
        className={styles.mobilePanel}
        id="mobile-navigation"
        data-open={menuOpen}
        aria-hidden={!menuOpen}
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
