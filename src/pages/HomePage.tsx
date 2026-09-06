import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { ReliefStage } from "../features/relief/ReliefStage";
import { ForestStage } from "../features/forest/ForestStage";
import { InkText } from "../components/motion/InkText";
import { InkHover } from "../components/motion/InkHover";
import { useArrivals } from "../hooks/useArrivals";
import { useScrollProgress } from "../hooks/useScrollProgress";
import { resolveAppUrl, stripAppBasePath } from "../lib/basePath";
import { Link } from "../lib/router";
import { chapterForPath } from "../lib/chapters";
import { scrollToChapter, useChapters } from "../lib/useChapters";
import { work } from "../data/work";
import { HOME_SCULPTURE } from "../features/relief/sculptures";
import styles from "./HomePage.module.css";

const RELIEF_ALT =
  "A luminous particle sculpture of two figures held close together.";

/**
 * One document, two places.
 *
 * Home is the relief in air, held still while two statements pass over it: what
 * the studio makes, and how it works. Two, and no more. Work is a forest, and the
 * reader descends through it. Studies is a page of its own rather than a third
 * chapter here — an index is read by scanning, and this document is one long
 * movement that should not end in a list. See `pages/StudiesPage`.
 *
 * Between the two is a crossing rather than a cut. The relief releases as the
 * forest takes hold, over a screen of travel, so neither place appears in front of
 * the other: the page arrives somewhere new instead of switching to it.
 */
export function HomePage() {
  const { language } = useLanguage();
  const isEnglish = language === "en";
  /*
   * The chapter the document was opened at, if it was not the first one.
   *
   * Read from the address once, on the way in, and never again: it is a fact
   * about this arrival, not a piece of state. Any chapter can be deep-linked, so
   * this asks the chapter table rather than testing for one path.
   */
  const entryChapter = useRef(
    chapterForPath(stripAppBasePath(window.location.pathname.replace(/\/+$/, "")) || "/")?.id ??
      "home",
  ).current;
  const enteredBelowHome = entryChapter !== "home";

  const homeRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const workRef = useRef<HTMLDivElement>(null);
  const reliefFieldRef = useRef<HTMLDivElement>(null);
  const crossingRef = useRef(enteredBelowHome ? 1 : 0);
  const forestFieldRef = useRef<HTMLDivElement>(null);
  const [forestActive, setForestActive] = useState(enteredBelowHome);

  // Each chapter's own travel. The relief turns on the first and the forest's
  // light, dove and camera all read the second.
  const homeProgressRef = useScrollProgress(homeRef);
  const forestRef = useScrollProgress(workRef);
  // A shared chapter route mounts the whole document. Place a direct visit to any
  // chapter below the first before effects measure the active one, otherwise the
  // observer sees Home at scroll zero and rewrites the address before the chapter
  // that was actually asked for has a chance to enter.
  useLayoutEffect(() => {
    if (enteredBelowHome) scrollToChapter(entryChapter, "instant");
  }, [enteredBelowHome, entryChapter]);

  const onTransition = useCallback(
    (progress: number) => {
      crossingRef.current = progress;
      // The relief leaves from the bottom up, and is gone early.
      //
      // A soft band travels up the frame, taking the foot of the scene first and
      // the head last. The band is wide, so any given part of it fades gently;
      // the band travels fast, so the whole thing has cleared by two fifths of the
      // crossing, well before the forest begins to arrive. Fading the scene evenly
      // instead meant it was still faintly there at the boundary and drew a visible line.
      const sweep = Math.min(Math.max(progress / 0.72, 0), 1) * 138;
      reliefFieldRef.current?.style.setProperty("--relief-sweep", sweep.toFixed(1));

      // Work arrives while Home is still leaving.
      //
      // The two used to be sequenced rather than crossed: the relief had swept
      // away by the time the forest began, which left a stretch of the crossing
      // where the frame was simply black and scrolling changed nothing at all.
      // Starting the forest early enough to overlap the relief's exit means the
      // crossing is a handover — one place resolving as the other releases —
      // instead of a gap between two places with nothing in it.
      //
      // Set on the element here rather than from inside the scene: the page knows
      // about the crossing before the canvas does, and driving it from the render
      // loop was circular — the loop is parked until the stage is active, so the
      // opacity deciding whether it shows was waiting on a frame that could not
      // run.
      const arriving = Math.min(Math.max((progress - 0.08) / 0.42, 0), 1);
      forestFieldRef.current?.style.setProperty("opacity", String(arriving));
      // Its own top edge is still mid-screen while it arrives, so it is feathered
      // until it has settled. Bringing it in early without this simply moves the
      // seam rather than removing it: the edge of its background gradient becomes
      // a horizontal line climbing the page.
      forestFieldRef.current?.style.setProperty("--forest-arrive", String(arriving));
      // One render when the forest starts mattering, not one per scroll frame.
      setForestActive((was) => (was === arriving > 0.001 ? was : arriving > 0.001));
    },
    [],
  );

  // Scrolling is the layout's, not this page's: see SiteLayout.
  useChapters(onTransition);

  // Each project arrives rather than being found already there. The observer is
  // shared with the studies index, so both use one decision about when something
  // has arrived: see `hooks/useArrivals`.
  useArrivals(pageRef);

  return (
    <div className={styles.page} ref={pageRef}>
      <div className={styles.chapter} data-chapter="home" ref={homeRef}>
        {/*
          Held for the whole chapter, so both statements are read over the same
          relief rather than each arriving with a backdrop of its own.
        */}
        {/*
          The sculpture is rendered as one continuous surface. Light describes
          the form without a separate particle or atmospheric overlay.
        */}
        <div className={styles.reliefField} ref={reliefFieldRef} aria-hidden="true">
          <div className={styles.relief}>
            <ReliefStage
              depthSrc={resolveAppUrl("/assets/house-adel/relief-depth-1024.png")}
              mode="particles"
              restingSrc={HOME_SCULPTURE}
              edgeParticles
              modelScale={1.16}
              /*
                Centred on the frame, on both axes.

                The bake already centres the cloud on its own bounding box and the
                stage contain-fits it about the origin, so leaving modelX and
                cameraY at their defaults is what puts the sculpture in the middle
                of the screen. It used to be nudged left and dropped down, which
                read as a form sitting off its own centre rather than as framing.
              */
              spatialBackdrop
              scrollRef={homeProgressRef}
              disperse={0}
              hoverDisperse={1}
              grain={0.68}
              dissolveRef={crossingRef}
              alt={RELIEF_ALT}
            />
          </div>
        </div>

        {/*
          The first statement waits for the opening.

          The mark has just become this page's own figure and been handed over to
          the live scene; the words arrive after that, so the reader watches the
          page finish rather than being given it finished. See `[data-opening-fade]`
          in `styles/global.css`.
        */}
        <section
          className={`${styles.screen} page-frame`}
          data-track="Studio"
          aria-labelledby="home-title"
          data-opening-fade
        >
          <InkText as="h1" id="home-title" className={styles.headline}>
            {isEnglish
              ? "Art-directed websites for practices, studios and brands, and for singular occasions."
              : "Situs dengan arahan seni untuk firma, studio dan merek, dan untuk acara yang tak terulang."}
          </InkText>
          <p className={styles.cue}>{isEnglish ? "Scroll" : "Gulir"}</p>
        </section>

        <section className={`${styles.screen} page-frame`} data-track="Practice" aria-labelledby="home-practice">
          <h2 className="sr-only" id="home-practice">
            {isEnglish ? "The studio" : "Studio"}
          </h2>
          <InkText as="p" className={styles.line}>
            {isEnglish
              ? "Art direction, interaction design and frontend development, built as one."
              : "Arahan seni, desain interaksi, dan pengembangan frontend, dibangun sebagai satu."}
          </InkText>
        </section>
      </div>

      <div className={styles.chapter} data-chapter="work" ref={workRef}>
        {/*
          The forest is held for the length of the chapter: the planting stays put
          and the reader descends through it. Its field starts a screen early so
          the crossing has room to happen.
        */}
        <div className={styles.forestField} ref={forestFieldRef} aria-hidden="true">
          <div className={styles.forest}>
            <ForestStage progressRef={forestRef} active={forestActive} />
          </div>
        </div>

        <div className={`${styles.masthead} page-frame`}>
          <p className={styles.chapterTitle}>{isEnglish ? "Work" : "Karya"}</p>
        </div>

        <section className={`${styles.chapterOpening} page-frame`} data-track="Work" aria-labelledby="work-title">
          <InkText as="h2" id="work-title" className={styles.chapterHeadline}>
            {isEnglish ? "Projects created by House Adel." : "Proyek yang dibuat oleh House Adel."}
          </InkText>
        </section>

        <div className={styles.projects}>
          {work.map((project, index) => (
            <section key={project.slug} className={`${styles.project} page-frame`} data-arrives data-shown="false" data-track={project.title}>
              <Link
                className={styles.entry}
                to={`/${project.slug}`}
                data-sonic
                data-cursor-label={isEnglish ? "View" : "Lihat"}
              >
                <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
                <span className={styles.name}>
                  <InkHover>{project.title}</InkHover>
                </span>
                {/*
                  Title, then the work itself. The forest is the room; this is what
                  is hung in it, so it sits in front and holds the middle of the
                  frame the planting was pushed aside to leave clear.
                */}
                <span className={styles.frame} data-transition-media>
                  {project.image ? (
                    <img src={project.image} alt="" loading="lazy" decoding="async" />
                  ) : (
                    <span className={styles.awaiting} aria-hidden="true" />
                  )}
                </span>
                <span className={styles.sentence}>
                  {isEnglish ? project.sentence.en : project.sentence.id}
                </span>
                <span className={styles.tags}>
                  {project.disciplines.map((discipline) => (
                    <span key={discipline} className={styles.tag}>
                      {discipline}
                    </span>
                  ))}
                  <span className={styles.tag}>{project.year}</span>
                </span>
              </Link>
            </section>
          ))}
        </div>

        {/*
          The end of the document.

          One screen, the ask centred in it, and the forest still standing behind
          it. Nothing follows but the addresses. The wood does not dissolve and it
          is not replaced: it simply scrolls away as the page ends, the way
          anything else on a page does.
        */}
        <section className={`${styles.closing} page-frame`} data-track="Contact">
          <Link className={styles.begin} to="/contact" data-sonic>
            {/*
              The same answer the navigation gives: the word resolves out of ink,
              letter by letter, through the spectrum the relief refracts. It is
              the site's one hover gesture, and the largest thing on the page had
              been the only thing not using it.
            */}
            <InkHover>{isEnglish ? "Begin a Project" : "Mulai sebuah Proyek"}</InkHover>
          </Link>
        </section>
      </div>
    </div>
  );
}
