import { useEffect, useRef, useState } from "react";
import { Link } from "../../lib/router";
import styles from "./LegalNav.module.css";

/**
 * A way through a long document, and a way to the other one.
 *
 * Both legal pages are read by reference rather than end to end: someone arrives
 * wanting the refund rule, or what happens to their phone number, and everything
 * between them and it is friction. The Terms run to twenty-nine clauses, which is
 * several screens of scrolling to find out that clause 16 is the one you wanted.
 *
 * So: every clause is a click, the list stays with the reader as they scroll, and
 * it says which clause they are currently in. On a narrow screen it collapses to
 * a single line that opens on demand — a contents list occupying most of a phone
 * screen before the document has even begun is not a contents list, it is a wall.
 *
 * **Restraint is the brief.** This is an index, not a documentation sidebar: a
 * ruled block of small type in the same register as the clause numbers it points
 * at. It gets no art direction of its own, no icons, no search, no progress bar.
 *
 * **Plain anchors, deliberately.** The router passes `#` links straight through
 * to the browser, so these are ordinary in-page jumps: they work before any
 * script has run, they can be opened in a new tab, and the address bar ends up
 * holding a link to the clause that can be sent to someone else. Everything this
 * component adds — the highlight, the collapsing — is an enhancement on top of
 * links that already worked.
 *
 * **Each one carries the path it is already on**, which looks redundant and is
 * not. The document declares `<base href>`, and a bare `#clause` resolves
 * against the base rather than against the page — so on this site the obvious
 * spelling sent the reader to the homepage with a fragment nobody there
 * answers. Read from `location` rather than hard-coded so it stays correct under
 * a sub-directory deploy, where an absolute `/terms#…` would be wrong too.
 */

export type LegalNavItem = { id: string; title: string };

type LegalNavProps = {
  /** Heading for the list — "Contents", or its Indonesian equivalent. */
  label: string;
  items: LegalNavItem[];
  /** Namespace the page gives its section ids, so the anchors match. */
  anchorPrefix: string;
  /** The other document. */
  sibling: { to: string; label: string; description: string };
};

/**
 * Which section the reader is currently in.
 *
 * Decided by position rather than by intersection ratio. A clause can be taller
 * than the viewport, in which case nothing is "most visible" and a ratio-based
 * answer flickers between neighbours or reports none at all; and several short
 * clauses can be on screen at once, in which case the honest answer is the
 * topmost one that has passed the reading line rather than the largest.
 *
 * So: the current section is the last one whose heading has crossed a line a
 * little below the site header, which is exactly where a reader's eye is. The
 * observer is only used as a cheap trigger to re-read positions — it fires when
 * the set of visible headings changes, and it is the measurement afterwards that
 * decides, so the result never depends on which entry the browser happened to
 * report.
 */
function useCurrentSection(ids: string[]) {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    if (ids.length === 0) return;
    const headings = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));
    if (headings.length === 0) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      // The reading line: below the floating header, above the middle of the
      // screen, so a clause counts as current once it is genuinely being read
      // rather than the instant its first pixel appears.
      const line = window.innerHeight * 0.28;
      let active = headings[0];
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= line) active = heading;
        else break;
      }
      /*
       * The foot of the document is a special case. The last clause is often
       * short and can never reach the reading line, so scrolling to the very end
       * would leave the highlight stuck one clause early — on the one place a
       * reader is most sure of where they are.
       */
      const atEnd =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;
      setCurrent((atEnd ? headings[headings.length - 1] : active).id);
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    const observer = new IntersectionObserver(schedule, {
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    });
    headings.forEach((heading) => observer.observe(heading));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    measure();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ids]);

  return current;
}

export function LegalNav({ label, items, anchorPrefix, sibling }: LegalNavProps) {
  const here = window.location.pathname;
  const anchorId = (id: string) => `${anchorPrefix}-${id}`;
  /*
   * Rebuilt only when the document itself changes, not on every render. The
   * language toggle rewrites every title but not a single id, so keying the
   * effect on the ids alone stops a language change from tearing down and
   * rebuilding the observer for no reason.
   */
  const ids = items.map((item) => anchorId(item.id)).join(",");
  const idList = useRef<string[]>([]);
  if (idList.current.join(",") !== ids) idList.current = ids ? ids.split(",") : [];
  const current = useCurrentSection(idList.current);

  /*
   * Open on a wide screen, shut on a narrow one — and after that, whatever the
   * reader last chose. `<details>` is the whole mechanism: it is a disclosure
   * control with a disclosure control's keyboard behaviour and a disclosure
   * control's screen-reader announcement, already built, and `open` on a media
   * query is all that is needed to give the two screens different defaults.
   */
  const [open, setOpen] = useState(
    () => !window.matchMedia("(max-width: 47.99rem)").matches,
  );

  return (
    <nav className={styles.nav} aria-label={label}>
      <details className={styles.disclosure} open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
        <summary className={styles.label}>
          <span>{label}</span>
          {/*
            The clause the reader is in, shown on the closed control so the list
            does not have to be opened to answer "where am I". Hidden from
            assistive technology because the same fact is already carried by
            `aria-current` on the entry itself, and saying it twice is noise.
          */}
          <span className={styles.here} aria-hidden="true">
            {items.find((item) => anchorId(item.id) === current)?.title ?? ""}
          </span>
        </summary>
        <ol className={styles.list}>
          {items.map((item) => {
            const isCurrent = anchorId(item.id) === current;
            return (
              <li key={item.id}>
                <a
                  className={styles.entry}
                  href={`${here}#${anchorId(item.id)}`}
                  /*
                   * `location`, not `true`. This is "the section of the document
                   * you are currently in", which is what a screen reader should
                   * say — `aria-current="true"` on a link in a contents list is
                   * the vaguer claim and reads as "the current item" without
                   * saying current in what.
                   */
                  aria-current={isCurrent ? "location" : undefined}
                  data-current={isCurrent ? "true" : undefined}
                  onClick={() => {
                    // On a phone the list covers the document it points into, so
                    // choosing a clause has to put it away. On a wide screen the
                    // list is a rail beside the text and closing it would be a
                    // sidebar collapsing under the reader for no reason.
                    if (window.matchMedia("(max-width: 47.99rem)").matches) setOpen(false);
                  }}
                  data-sonic
                >
                  {item.title}
                </a>
              </li>
            );
          })}
        </ol>
      </details>
      <Link className={styles.sibling} to={sibling.to} data-sonic>
        <span className={styles.siblingLabel}>{sibling.label}</span>
        <span className={styles.siblingDescription}>{sibling.description}</span>
      </Link>
    </nav>
  );
}
