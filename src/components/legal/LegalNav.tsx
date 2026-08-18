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
 * So: every clause is a click, and the two documents point at each other. They
 * are halves of the same answer — what the studio does with what you send, and
 * what a commission commits you both to — and a reader who has finished one has
 * almost always got a reason to see the other.
 *
 * Plain anchors, deliberately. The router passes `#` links straight through to
 * the browser, so these are ordinary in-page jumps: they work before any script
 * has run, they can be opened in a new tab, and the address bar ends up holding
 * a link to the clause that can be sent to someone else.
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

export function LegalNav({ label, items, anchorPrefix, sibling }: LegalNavProps) {
  const here = window.location.pathname;

  return (
    <nav className={styles.nav} aria-label={label}>
      <h2 className={styles.label} id={`${anchorPrefix}-contents`}>
        {label}
      </h2>
      <ol className={styles.list} aria-labelledby={`${anchorPrefix}-contents`}>
        {items.map((item) => (
          <li key={item.id}>
            <a className={styles.entry} href={`${here}#${anchorPrefix}-${item.id}`} data-sonic>
              {item.title}
            </a>
          </li>
        ))}
      </ol>
      <Link className={styles.sibling} to={sibling.to} data-sonic>
        <span className={styles.siblingLabel}>{sibling.label}</span>
        <span className={styles.siblingDescription}>{sibling.description}</span>
      </Link>
    </nav>
  );
}
