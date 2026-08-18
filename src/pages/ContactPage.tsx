import { useRef } from "react";
import { InkText } from "../components/motion/InkText";
import { studioContacts } from "../config/studioContacts";
import { useLanguage } from "../context/LanguageContext";
import { SpatialBackdropStage } from "../features/atmosphere/SpatialBackdrop";
import { ApplicationForm } from "../features/application/components/ApplicationForm";
import { CupidField } from "../features/contact/CupidField";
import { useScrollProgress } from "../hooks/useScrollProgress";
import styles from "./ContactPage.module.css";

/**
 * The direct routes, in the order a studio would actually offer them.
 *
 * TikTok is not here. The footer carries every channel the studio keeps, which
 * is where an exhaustive list belongs; this is the short answer to "I would
 * rather not fill in a form", and a fourth entry makes it a list again.
 */
const DIRECT_CONTACTS = [
  studioContacts.whatsapp,
  studioContacts.instagram,
  studioContacts.email,
];

/**
 * One statement, the enquiry, and a quieter way out of it.
 *
 * The page had a single register: a headline, a qualifying line and nine
 * questions, all arriving at much the same weight, with the choice of how to be
 * reached set as three bordered rectangles in the middle of it — the loudest
 * object on the page attached to the least consequential decision on it. Nothing
 * said what the page was for.
 *
 * It is three tiers now. The statement and the questionnaire are the reason
 * anyone is here and hold the left column at full size. The line under the
 * headline and the helper text inside the form explain, quietly, and are set to
 * be read second. The studio's own WhatsApp, Instagram and email are the way out
 * for someone who does not want to answer questions, so they wait at the end,
 * set as small as type on this site gets.
 *
 * The right-hand half is Cupid. It is not decoration filling a gap: the page is
 * a column of type down one side, and what was opposite it was half a screen of
 * nothing.
 */
export function ContactPage() {
  const { language } = useLanguage();
  const isEnglish = language === "en";
  const pageRef = useRef<HTMLDivElement>(null);
  // The same measurement Home turns its relief with, over this page instead.
  const progressRef = useScrollProgress(pageRef);

  return (
    <div className={styles.page} ref={pageRef}>
      <SpatialBackdropStage className={styles.atmosphere} placement="full" />
      <CupidField progressRef={progressRef} language={language} />

      {/*
        The frame keeps the site's gutter and stays aligned with the header and
        the footer; the column inside it holds the measure and is left-aligned
        within it. Putting the measure on the frame itself was what centred the
        questionnaire: `page-frame` carries `margin-inline: auto`, so narrowing
        that element split the leftover width evenly and pushed the whole
        enquiry into the middle of the page.
      */}
      <div className={`${styles.layout} page-frame`}>
        <div className={styles.column}>
          {/*
            The CONTACT eyebrow is gone and stays gone. The navigation already
            says where the reader is, the tab says it, and the heading underneath
            says it in words — a fourth announcement in tracked capitals was the
            page introducing itself three times before asking its first question.
          */}
          <header className={styles.intro}>
            <InkText as="h1" id="contact-title" className={styles.heading}>
              {isEnglish ? "Tell us what is taking shape." : "Ceritakan apa yang sedang terbentuk."}
            </InkText>
            <p className={styles.support}>
              {isEnglish
                ? "A project, an occasion, a strange idea, or something you have not named yet. Answer as much as you can; we will take it from there."
                : "Sebuah proyek, acara, ide yang asing, atau sesuatu yang belum memiliki nama. Jawab sebisa Anda; selebihnya kami yang lanjutkan."}
            </p>
          </header>

          <div className={styles.formFrame}>
            <ApplicationForm />
          </div>

          {/*
            The way out of the form.

            Plain type on a rule, at the size of an aside, because that is what
            it is: someone who would rather send a message than answer nine
            questions should be able to, without the page offering it as an equal
            choice. No tiles, no icons and no boxes — the label is the channel
            and the link is the address, which is the whole composition.
          */}
          <aside className={styles.direct} aria-labelledby="contact-direct">
            <h2 className={styles.directTitle} id="contact-direct">
              {isEnglish ? "Or write to the studio directly" : "Atau hubungi studio secara langsung"}
            </h2>
            <ul className={styles.directList}>
              {DIRECT_CONTACTS.map((contact) => (
                <li key={contact.label} className={styles.directItem}>
                  <span className={styles.directLabel}>{contact.label}</span>
                  <a
                    className={`${styles.directValue} action`}
                    href={contact.href}
                    target={contact.href.startsWith("https:") ? "_blank" : undefined}
                    rel={contact.href.startsWith("https:") ? "noreferrer" : undefined}
                    aria-label={`${contact.label} ${contact.value}`}
                    data-sonic
                  >
                    {contact.value}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}
