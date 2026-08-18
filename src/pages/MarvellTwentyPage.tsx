import { useEffect, useRef } from "react";
import { useLanguage } from "../context/LanguageContext";
import { InkText } from "../components/motion/InkText";
import { resolveAppUrl } from "../lib/basePath";
import { motionIsReduced } from "../lib/preferences";
import { scrollSignal } from "../lib/scrollSignal";
import { Link } from "../lib/router";
import { work } from "../data/work";
import styles from "./MarvellTwentyPage.module.css";

/**
 * The one published project, shown properly.
 *
 * Everything here describes work that was actually made and an event that
 * actually ran: the moments listed are the four the invitation itself sets out,
 * the dates and the address are the ones it gives, and the images are captures of
 * the live site rather than mock-ups of it. Nothing is claimed that the thing at
 * the other end of the link does not show.
 *
 * **The structure changes as you travel through it.** What was here ran one
 * rhythm from top to bottom — heading, paragraph, image, paragraph, image,
 * metadata — and a case study built that way reads as a list of assets no matter
 * how good the assets are. The page now moves through distinct compositional
 * modes: an opening that holds the screen, a statement set large with nothing
 * beside it, a plate that goes edge to edge, a narrow column of quiet prose held
 * to one side, an image sitting small in a great deal of space, a sequence that
 * steps laterally across the frame, and metadata set as small as metadata should
 * be. Each mode arrives once, so the shape of the page is itself information
 * about where in it you are.
 *
 * The grammar is borrowed; the look is not. What is taken from studying case
 * studies elsewhere is the principle that the *mode* should change — full bleed
 * against offset, large against small, dense against empty — not any particular
 * layout, and certainly not the palette. This stays House Adel's dark, quiet,
 * atmospheric page.
 */

/**
 * A plate that sits in depth.
 *
 * The image drifts fractionally against the page as it is scrolled, and keeps
 * drifting for a moment after the scroll stops. It is a few pixels of movement,
 * and it is the difference between a picture printed on the page and a picture
 * held a little behind it. Typography is deliberately left out of this: the
 * words settle with the scroll, the media trails it.
 */
function useMediaDepth(depth = 1) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || motionIsReduced()) return;
    let frame = 0;
    let running = true;
    // Only while it is actually on screen: a page of plates each asking for a
    // frame forever is a page that never lets the compositor idle.
    let visible = false;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame) frame = window.requestAnimationFrame(tick);
    }, { rootMargin: "20% 0px" });

    function tick() {
      if (!running) return;
      const lag = scrollSignal().lag;
      element!.style.setProperty("--depth-shift", `${(-lag * 26 * depth).toFixed(2)}px`);
      element!.style.setProperty("--depth-scale", (1 + Math.abs(lag) * 0.012 * depth).toFixed(4));
      frame = visible ? window.requestAnimationFrame(tick) : 0;
    }

    observer.observe(element);
    return () => {
      running = false;
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [depth]);

  return ref;
}

function Shot({
  name,
  alt,
  eager = false,
}: {
  name: string;
  alt: string;
  eager?: boolean;
}) {
  const base = `/assets/marvell-20/${name}`;
  return (
    <picture className={styles.shot}>
      <source
        type="image/avif"
        srcSet={`${resolveAppUrl(`${base}-900w.avif`)} 900w, ${resolveAppUrl(`${base}-1600w.avif`)} 1600w`}
        sizes="(max-width: 60rem) 100vw, 60rem"
      />
      <source
        type="image/webp"
        srcSet={`${resolveAppUrl(`${base}-900w.webp`)} 900w, ${resolveAppUrl(`${base}-1600w.webp`)} 1600w`}
        sizes="(max-width: 60rem) 100vw, 60rem"
      />
      <img
        src={resolveAppUrl(`${base}-900w.webp`)}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    </picture>
  );
}

export function MarvellTwentyPage() {
  const { language } = useLanguage();
  const isEnglish = language === "en";
  const project = work.find((entry) => entry.slug === "marvell-20");
  const bleedRef = useMediaDepth(1);
  const insetRef = useMediaDepth(0.6);
  if (!project) return null;

  return (
    <div className={styles.page}>
      {/* Mode one: an opening that holds the screen and says only the name. */}
      <section className={`${styles.opening} page-frame`}>
        <p className={styles.eyebrow}>
          {project.client} · {project.year}
        </p>
        <InkText as="h1" id="project-title" className={styles.title}>
          MARVELL 20
        </InkText>
        <InkText as="p" className={styles.sentence}>
          {isEnglish ? project.sentence.en : project.sentence.id}
        </InkText>
      </section>

      {/*
        Mode two: edge to edge, and the landing place for the picture carried in
        from the index. The route transition flies the pressed image to this
        exact rectangle and hands over, so arriving reads as following the work
        rather than as loading a page.
      */}
      <section className={styles.bleed} ref={bleedRef} data-transition-media-target>
        <Shot
          name="marvell-20-opening"
          eager
          alt={
            isEnglish
              ? "The MARVELL 20 invitation site, showing the title over a dark floral opening with the dates and address."
              : "Situs undangan MARVELL 20, menampilkan judul di atas pembuka bunga gelap dengan tanggal dan alamat."
          }
        />
      </section>

      {/* Mode three: the project in one sentence, at size, with nothing beside it. */}
      <section className={`${styles.statement} page-frame`}>
        <InkText as="p" className={styles.statementText}>
          {isEnglish
            ? "MARVELL 20 marked the twentieth anniversary of Marvell Florist with a pop-up in Batam."
            : "MARVELL 20 menandai ulang tahun ke-20 Marvell Florist melalui pop-up di Batam."}
        </InkText>
      </section>

      {/* Mode four: quiet prose, held to one side of a wide, mostly empty band. */}
      <section className={`${styles.aside} page-frame`}>
        <p className={styles.asideLabel}>{isEnglish ? "The work" : "Pekerjaan"}</p>
        <div className={styles.asideBody}>
          <p>
            {isEnglish
              ? "House Adel developed the digital direction, the invitation site and the browser-based tools used on site."
              : "House Adel mengembangkan arahan digital, situs undangan, dan alat berbasis peramban yang digunakan di lokasi."}
          </p>
          <p>
            {isEnglish
              ? "The invitation opens on a single stem and holds there until it is answered, then gives the guest the dates, the address and what waits inside. It reads in English or Indonesian, carries its own sound, and adds itself to a calendar."
              : "Undangan dibuka pada satu tangkai dan menunggu hingga dijawab, lalu memberi tamu tanggal, alamat, dan apa yang menanti di dalam. Tersedia dalam bahasa Inggris atau Indonesia, membawa suaranya sendiri, dan dapat ditambahkan ke kalender."}
          </p>
        </div>
      </section>

      {/* Mode five: a small image with a great deal of room around it. */}
      <section className={`${styles.inset} page-frame`} ref={insetRef}>
        <Shot
          name="marvell-20-venue"
          alt={
            isEnglish
              ? "The invitation's venue section, giving the address in large type with a map link and a countdown."
              : "Bagian lokasi pada undangan, menampilkan alamat dalam huruf besar dengan tautan peta dan hitung mundur."
          }
        />
        <p className={styles.caption}>
          {isEnglish
            ? "The venue section, with the address, a map link and a countdown to the opening."
            : "Bagian lokasi, dengan alamat, tautan peta, dan hitung mundur menuju pembukaan."}
        </p>
      </section>

      {/* Mode six: metadata, as quiet as metadata should be. */}
      <section className={`${styles.details} page-frame`}>
        <dl className={styles.table}>
          <div>
            <dt>{isEnglish ? "Client" : "Klien"}</dt>
            <dd>{project.client}</dd>
          </div>
          <div>
            <dt>{isEnglish ? "Year" : "Tahun"}</dt>
            <dd>{project.year}</dd>
          </div>
          <div>
            <dt>{isEnglish ? "Dates" : "Tanggal"}</dt>
            <dd>15 June – 4 July 2026</dd>
          </div>
          <div>
            <dt>{isEnglish ? "Place" : "Tempat"}</dt>
            <dd>Ruko Kintamani, Blok C No. 11, Batam</dd>
          </div>
          <div>
            <dt>{isEnglish ? "Work" : "Pekerjaan"}</dt>
            <dd>{project.disciplines.join(", ")}</dd>
          </div>
        </dl>

        <div className={styles.actions}>
          {project.url ? (
            <a
              className={`${styles.action} action`}
              href={project.url}
              target="_blank"
              rel="noreferrer noopener"
              data-sonic
            >
              {isEnglish ? "View the invitation" : "Lihat undangan"}
            </a>
          ) : null}
          <Link className={`${styles.action} action`} to="/work" data-sonic>
            {isEnglish ? "All work" : "Semua karya"}
          </Link>
        </div>
      </section>
    </div>
  );
}
