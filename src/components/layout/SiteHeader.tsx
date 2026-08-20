import { useLanguage } from "../../context/LanguageContext";
import { primaryNavigation } from "../../data/navigation";
import { InkHover } from "../motion/InkHover";
import { Link } from "../../lib/router";
import { resolveAppUrl } from "../../lib/basePath";
import { chapterForPath, isChapterPath } from "../../lib/chapters";
import { useActiveChapter } from "../../lib/useChapters";
import { MobileMenu } from "./MobileMenu";
import styles from "./SiteHeader.module.css";

/**
 * There is no header bar. The mark and the links float directly over the page so
 * the relief runs edge to edge behind them. The mark carries no wordmark: it is
 * the icon alone, and its only job is returning home.
 *
 * Nav hover resolves each letter out of blur, the site's own gesture, and the
 * words hold still while it happens.
 *
 * On a phone the row is replaced rather than shrunk — see MobileMenu.
 */

/**
 * Whether a navigation entry is where the reader already is.
 *
 * Two things have to be reconciled. Some routes are ordinary routes; Work and
 * Studies are chapters of the home document, so their addresses are rewritten by
 * scrolling and the router never hears about it. Reading the chapter as well as
 * the path means the navigation is honest about where the reader is in both
 * cases — and it is read from the chapter table rather than from a list of paths
 * repeated here, so a new chapter arrives in the navigation already working.
 */
function isCurrent(href: string, pathname: string, chapter: string) {
  /*
   * Inside the continuous document the chapter is the authority, not the path.
   *
   * Scrolling rewrites the address without waking the router, so `pathname` here
   * is only where the reader came in: someone who opened Work and scrolled on to
   * Studies still has "/work" in this prop. Asking the chapter instead means one
   * entry is current at a time, and it is the right one.
   */
  if (isChapterPath(pathname)) {
    return chapterForPath(href)?.id === chapter;
  }
  if (href === "/contact") return pathname === "/contact" || pathname === "/begin-a-project";
  return pathname === href;
}

export function SiteHeader({ pathname }: { pathname: string }) {
  const { language, toggleLanguage } = useLanguage();
  const chapter = useActiveChapter();
  const isEnglish = language === "en";

  return (
    <header className={styles.header}>
      <Link
        className={styles.mark}
        to="/"
        aria-label={isEnglish ? "House Adel, home" : "House Adel, beranda"}
        data-cursor-label={isEnglish ? "Home" : "Beranda"}
        data-sonic
      >
        <img src={resolveAppUrl("/adel-mark.svg")} alt="" aria-hidden="true" />
      </Link>

      <nav className={styles.nav} aria-label={isEnglish ? "Primary navigation" : "Navigasi utama"}>
        {primaryNavigation.map((item) => {
          const current = isCurrent(item.href, pathname, chapter);
          return (
            <Link
              key={item.href}
              className={styles.link}
              to={item.href}
              /*
               * Being on a page is not news. The word for the place you are
               * already in recedes and stops offering itself, rather than sitting
               * there at full weight telling you what you can plainly see. It
               * stays a link — where you are should still be somewhere you can
               * point at — it simply stops competing with where you could go.
               */
              data-current={current || undefined}
              aria-current={current ? "page" : undefined}
              data-sonic
            >
              <InkHover>{isEnglish ? item.label : item.labelId}</InkHover>
            </Link>
          );
        })}
        <button type="button" className={styles.link} onClick={toggleLanguage} data-sonic>
          <InkHover>{isEnglish ? "ID" : "EN"}</InkHover>
        </button>
      </nav>

      <MobileMenu pathname={pathname} />
    </header>
  );
}
