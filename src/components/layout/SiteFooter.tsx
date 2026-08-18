import { studioContacts } from "../../config/studioContacts";
import { useLanguage } from "../../context/LanguageContext";
import { Link } from "../../lib/router";
import styles from "./SiteFooter.module.css";

/**
 * The footer: the addresses, and nothing else.
 *
 * It used to carry the ending as well — an invitation, then a mark rebuilt out of
 * the forest's own particles. Both have gone, and the reason is the same in each
 * case: whatever the document ends *with* belongs to the document, where the
 * scene still is. Set down here it arrived a screen after the wood had gone, on a
 * ground of its own, which turned the end of a descent into a fade to black
 * followed by a link. The ask now stands in the clearing over the planting — see
 * `HomePage`'s `.closing` — and this is what is left: the two legal pages and the
 * four ways to reach a person.
 *
 * Which means it is the same on every route. There is no branch here for the
 * continuous document, no branch for Contact, and nothing to suppress: an address
 * row cannot talk over a page.
 *
 * It has no ground and no ramp. It is a hairline and a line of type at the foot
 * of whatever the page already had on screen — which on the document is the
 * forest, still standing behind the links.
 *
 * And so it measures nothing. It used to publish `--arrival` on every scroll
 * frame for the ramp to paint a gradient with, and to clear a `data-chrome` flag
 * that nothing has set for some time. The ramp is gone, which took the only
 * reader of that figure with it; both are removed rather than left running. The
 * `[data-chrome="pale"]` rules in the header, menu and rail stay where they are —
 * they describe what to do when a genuinely pale surface sits under the chrome,
 * which is still a real situation and still correctly handled if one returns.
 */

/**
 * The addresses, in the order they are read.
 *
 * Legal first because it is the obligation, then the four channels. `Link` is
 * only correct for the two internal ones; the rest leave the site and are plain
 * anchors, which is also why they are not routed through the router's `to`.
 */
const CONTACTS = [studioContacts.email, studioContacts.instagram, studioContacts.whatsapp, studioContacts.tiktok];

export function SiteFooter() {
  const { language } = useLanguage();
  const isEnglish = language === "en";
  return (
    <footer className={styles.footer}>
      <div className={`${styles.periphery} page-frame`}>
        <nav className={styles.addresses} aria-label={isEnglish ? "Footer links" : "Tautan footer"}>
          <Link to="/privacy" data-sonic>
            {isEnglish ? "Privacy" : "Privasi"}
          </Link>
          <Link to="/terms" data-sonic>
            {isEnglish ? "Terms" : "Ketentuan"}
          </Link>
          {CONTACTS.map((contact) => {
            const external = contact.href.startsWith("https:");
            return (
              <a
                key={contact.label}
                href={contact.href}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
                aria-label={`${contact.label} ${contact.value}`}
                title={contact.value}
                data-sonic
              >
                {contact.label}
              </a>
            );
          })}
        </nav>

        <span className={styles.legal}>© {new Date().getFullYear()} House Adel</span>
      </div>
    </footer>
  );
}
