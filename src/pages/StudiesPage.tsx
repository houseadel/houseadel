import { useRef, useState } from "react";
import { InkText } from "../components/motion/InkText";
import { useLanguage } from "../context/LanguageContext";
import { resolveAppUrl } from "../lib/basePath";
import { Link } from "../lib/router";
import { residentStudies, studies, titleFor, type Study } from "../data/studies";
import styles from "./StudiesPage.module.css";

/**
 * The back of the house, as an index you stand in front of.
 *
 * Home and Work are two chapters of one continuous document, read by descending.
 * This is the opposite kind of page and is built to be: a fixed index down the
 * left and one piece held on the right, so nothing is read by scrolling past it.
 * A reader picks a study and looks at it.
 *
 * It is currently empty, and that is a real state rather than a gap to be papered
 * over. The one finished study has been taken off the site and nothing has
 * replaced it yet, so the page says exactly that: the statement, and a line
 * admitting there is nothing to show. The alternative — filling the frame with
 * whatever exists — is the single thing this page was separated from Work to
 * prevent.
 *
 * There is no explanatory copy. Three columns of small type arguing what a study
 * is and is not were most of the page, and all of it was the studio talking about
 * itself above an index with nothing in it. The heading already says what these
 * are; the pieces, when there are any, will say the rest.
 *
 * The bench below returns the moment `data/studies.ts` has an entry again. Only
 * standalone studies run live in the preview; a resident one is a technique
 * inside *this* site, and embedding those means a second copy of the whole
 * application with its own WebGL contexts inside the one page that deliberately
 * carries no scene of its own.
 */

type Entry = Study & {
  /** Runs live in the preview, at an address of its own. */
  standalone: boolean;
};

const ENTRIES: Entry[] = [
  ...studies.map((study) => ({ ...study, standalone: true })),
  ...residentStudies.map((study) => ({ ...study, standalone: false })),
];

export function StudiesPage() {
  const { language } = useLanguage();
  const isEnglish = language === "en";
  const pageRef = useRef<HTMLDivElement>(null);
  const [activeSlug, setActiveSlug] = useState(ENTRIES[0]?.slug ?? "");
  const active = ENTRIES.find((entry) => entry.slug === activeSlug) ?? ENTRIES[0];

  return (
    <div className={styles.page} ref={pageRef}>
      {/*
        The sheet the studies are set on. Held for the length of the page rather
        than scrolling with it.
      */}
      <div className={styles.sheetField} aria-hidden="true">
        <div className={styles.sheet} />
      </div>

      <div className={`${styles.layout} page-frame`}>
        <header className={styles.intro}>
          <InkText as="h1" id="studies-title" className={styles.heading}>
            {isEnglish
              ? "Work made without a brief, to find out how something behaves."
              : "Karya yang dibuat tanpa permintaan, untuk mengetahui bagaimana sesuatu bekerja."}
          </InkText>
        </header>

        {ENTRIES.length === 0 ? (
          <section className={styles.empty} aria-live="polite">
            <p className={styles.emptyLine}>
              {isEnglish
                ? "Nothing is published here at the moment."
                : "Belum ada yang dipublikasikan di sini."}
            </p>
            <p className={styles.sentence}>
              {isEnglish
                ? "The studies are being reworked. What the studio has actually delivered is in Work."
                : "Studi sedang dikerjakan ulang. Karya yang benar-benar telah diselesaikan studio ada di Karya."}
            </p>
            <Link className={`${styles.emptyWay} action`} to="/work" data-sonic>
              {isEnglish ? "See the work" : "Lihat karya"}
              <i aria-hidden="true">→</i>
            </Link>
          </section>
        ) : (
          <div className={styles.workbench}>
            {/*
              The index, held at the top of the frame while a study is being
              looked at. It is a list of choices, so it is a list of buttons — not
              links: nothing here changes the address, and a link that does not
              navigate is a lie told to the keyboard and to the status bar alike.
            */}
            <nav className={styles.index} aria-label={isEnglish ? "Studies" : "Studi"}>
              <ol>
                {ENTRIES.map((entry, position) => (
                  <li key={entry.slug}>
                    <button
                      type="button"
                      className={styles.entry}
                      aria-current={entry.slug === active?.slug ? "true" : undefined}
                      onClick={() => setActiveSlug(entry.slug)}
                      data-sonic
                    >
                      <span className={styles.entryIndex}>
                        {String(position + 1).padStart(2, "0")}
                      </span>
                      <span className={styles.entryName}>{titleFor(entry, isEnglish)}</span>
                      <span className={styles.entryYear}>{entry.year}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </nav>

            {active ? <Stage entry={active} isEnglish={isEnglish} /> : null}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * The selected study, held on the right.
 *
 * A standalone study runs in an iframe at a fixed logical width and is scaled
 * down to the pane. The fixed width is the point: sizing the frame to the pane
 * would hand the embedded piece a nine-hundred-pixel viewport and it would lay
 * itself out as a tablet, which is a preview of a layout the reader is not about
 * to see.
 */
function Stage({ entry, isEnglish }: { entry: Entry; isEnglish: boolean }) {
  return (
    <section
      className={styles.stage}
      aria-label={`${titleFor(entry, isEnglish)} — ${isEnglish ? "preview" : "pratinjau"}`}
    >
      <div className={styles.plate}>
        {entry.standalone ? (
          <div className={styles.viewport}>
            {/*
              Keyed on the slug so switching studies replaces the document rather
              than navigating the existing one, which would leave the previous
              piece's scroll position and audio state in the new one.
            */}
            <iframe
              key={entry.slug}
              className={styles.frame}
              src={resolveAppUrl(entry.seenAt.href)}
              title={`${titleFor(entry, isEnglish)} — ${isEnglish ? "live preview" : "pratinjau langsung"}`}
              loading="lazy"
              /* It is our own document. It gets to run, and nothing else. */
              referrerPolicy="same-origin"
            />
          </div>
        ) : (
          <div className={styles.resident}>
            <p className={styles.residentWhere}>
              {isEnglish ? "Runs inside this website" : "Berjalan di dalam situs ini"}
            </p>
            <p className={styles.residentNote}>
              {isEnglish
                ? "A technique rather than a piece, so there is nothing separate to open. It is running wherever it says below."
                : "Sebuah teknik, bukan karya tersendiri, jadi tidak ada yang perlu dibuka terpisah. Ia berjalan di tempat yang disebut di bawah."}
            </p>
          </div>
        )}

        {/*
          The way to see it properly, in the corner of the thing it applies to.
          Only where there is something to open: a resident study has no address
          of its own, and a control that says "show full screen" over a page that
          cannot be shown full screen is worse than no control.
        */}
        <div className={styles.corner}>
          <Link className={`${styles.expand} action`} to={entry.seenAt.href} data-sonic>
            {entry.standalone
              ? isEnglish
                ? "Show full screen"
                : "Tampilkan layar penuh"
              : isEnglish
                ? entry.seenAt.label.en
                : entry.seenAt.label.id}
            <i aria-hidden="true">↗</i>
          </Link>
        </div>
      </div>

      <div className={styles.caption}>
        <h2 className={styles.captionName}>{titleFor(entry, isEnglish)}</h2>
        <p className={styles.sentence}>{isEnglish ? entry.sentence.en : entry.sentence.id}</p>
        <p className={styles.tags}>
          {entry.disciplines.map((discipline) => (
            <span key={discipline} className={styles.tag}>
              {discipline}
            </span>
          ))}
          <span className={styles.tag}>{entry.year}</span>
        </p>
      </div>
    </section>
  );
}
