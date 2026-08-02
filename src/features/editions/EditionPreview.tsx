import { type CSSProperties, type FormEvent, useId, useState } from "react";
import type { Edition } from "../../data/editions";
import styles from "./EditionPreview.module.css";

type PreviewSize = "desktop" | "mobile";
type PreviewLanguage = "en" | "fr";
type PreviewSection = "welcome" | "schedule" | "rsvp";

type PreviewStyle = CSSProperties & {
  "--preview-field": string;
  "--preview-paper": string;
  "--preview-ink": string;
  "--preview-signature": string;
  "--preview-metal": string;
};

const copy = {
  en: {
    language: "English",
    welcome: "Invitation",
    schedule: "Order of the day",
    rsvp: "RSVP",
    invited: "You are invited",
    preparedFor: "Prepared for",
    scheduleHeading: "The gathering",
    arrive: "Arrival",
    ceremony: "Ceremony",
    table: "Dinner",
    attendance: "Will you attend?",
    yes: "Joyfully attending",
    no: "Unable to attend",
    respond: "Confirm sample response",
    confirmation: "Your sample response is held in this preview only.",
  },
  fr: {
    language: "Français",
    welcome: "Invitation",
    schedule: "Déroulement",
    rsvp: "Réponse",
    invited: "Vous êtes conviés",
    preparedFor: "Préparée pour",
    scheduleHeading: "La rencontre",
    arrive: "Arrivée",
    ceremony: "Cérémonie",
    table: "Dîner",
    attendance: "Serez-vous présents ?",
    yes: "Présents avec joie",
    no: "Dans l’impossibilité de venir",
    respond: "Confirmer la réponse d’exemple",
    confirmation: "Votre réponse d’exemple reste uniquement dans cet aperçu.",
  },
} as const;

export function EditionPreview({ edition }: { edition: Edition }) {
  const [size, setSize] = useState<PreviewSize>("desktop");
  const [language, setLanguage] = useState<PreviewLanguage>("en");
  const [section, setSection] = useState<PreviewSection>("welcome");
  const [firstName, setFirstName] = useState("Name One");
  const [secondName, setSecondName] = useState("Name Two");
  const [guestName, setGuestName] = useState("Sample Guest");
  const [attendance, setAttendance] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const attendanceName = useId();
  const text = copy[language];
  const previewStyle: PreviewStyle = {
    "--preview-field": edition.theme.palette.field,
    "--preview-paper": edition.theme.palette.paper,
    "--preview-ink": edition.theme.palette.ink,
    "--preview-signature": edition.theme.palette.signature,
    "--preview-metal": edition.theme.palette.metal,
  };

  const submitResponse = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!attendance) return;
    setConfirmation(text.confirmation);
  };

  return (
    <section className={styles.demo} aria-labelledby="live-edition-heading">
      <div className={styles.demoHeader}>
        <div>
          <p className={styles.eyebrow}>Invitation in use</p>
          <h2 id="live-edition-heading">Live invitation demonstration</h2>
          <p>
            Change the sample names, move through the invitation and try its RSVP. This
            invitation is for exploration only; no response is sent.
          </p>
        </div>

        <div className={styles.viewControls} role="group" aria-label="Invitation preview size">
          <button
            type="button"
            aria-pressed={size === "desktop"}
            onClick={() => setSize("desktop")}
          >
            Desktop
          </button>
          <button
            type="button"
            aria-pressed={size === "mobile"}
            onClick={() => setSize("mobile")}
          >
            Mobile
          </button>
        </div>
      </div>

      <div className={styles.personalisation} role="group" aria-label="Sample personalisation">
        <label>
          First sample name
          <input value={firstName} maxLength={28} onChange={(event) => setFirstName(event.target.value)} />
        </label>
        <label>
          Second sample name
          <input value={secondName} maxLength={28} onChange={(event) => setSecondName(event.target.value)} />
        </label>
        <label>
          Sample guest name
          <input value={guestName} maxLength={40} onChange={(event) => setGuestName(event.target.value)} />
        </label>
      </div>

      <div className={`${styles.deviceStage} ${styles[size]}`}>
        <div className={styles.invitation} style={previewStyle}>
          <header className={styles.invitationHeader}>
            <p>{edition.number}</p>
            <div className={styles.languageControls} role="group" aria-label="Invitation language">
              {(Object.keys(copy) as PreviewLanguage[]).map((key) => (
                <button
                  type="button"
                  key={key}
                  aria-pressed={language === key}
                  aria-label={`Use ${copy[key].language}`}
                  onClick={() => {
                    setLanguage(key);
                    setConfirmation("");
                  }}
                >
                  {key.toUpperCase()}
                </button>
              ))}
            </div>
          </header>

          <nav className={styles.invitationNav} aria-label="Invitation sections">
            {(["welcome", "schedule", "rsvp"] as PreviewSection[]).map((item) => (
              <button
                type="button"
                key={item}
                aria-current={section === item ? "page" : undefined}
                onClick={() => {
                  setSection(item);
                  setConfirmation("");
                }}
              >
                {text[item]}
              </button>
            ))}
          </nav>

          <div className={styles.invitationBody}>
            {section === "welcome" ? (
              <section className={styles.welcome} aria-labelledby="preview-welcome-heading">
                <p className={styles.guestName}>
                  {text.preparedFor} {guestName.trim() || "Sample Guest"}
                </p>
                <p>{text.invited}</p>
                <h3 id="preview-welcome-heading">
                  <span>{firstName.trim() || "Name One"}</span>
                  <span aria-hidden="true">&amp;</span>
                  <span>{secondName.trim() || "Name Two"}</span>
                </h3>
                <p>{edition.preview.date}</p>
                <p>{edition.preview.place}</p>
                <button type="button" onClick={() => setSection("schedule")}>
                  {text.schedule}
                </button>
              </section>
            ) : null}

            {section === "schedule" ? (
              <section aria-labelledby="preview-schedule-heading">
                <p className={styles.sectionNumber}>01 / 03</p>
                <h3 id="preview-schedule-heading">{text.scheduleHeading}</h3>
                <p className={styles.invitationNote}>{edition.preview.note}</p>
                <dl className={styles.schedule}>
                  <div>
                    <dt>16:30</dt>
                    <dd>{text.arrive}</dd>
                  </div>
                  <div>
                    <dt>17:00</dt>
                    <dd>{text.ceremony}</dd>
                  </div>
                  <div>
                    <dt>19:00</dt>
                    <dd>{text.table}</dd>
                  </div>
                </dl>
                <button type="button" onClick={() => setSection("rsvp")}>
                  {text.rsvp}
                </button>
              </section>
            ) : null}

            {section === "rsvp" ? (
              <form
                className={styles.rsvp}
                aria-labelledby="preview-rsvp-heading"
                onSubmit={submitResponse}
              >
                <p className={styles.sectionNumber}>02 / 03</p>
                <h3 id="preview-rsvp-heading">{text.rsvp}</h3>
                <fieldset>
                  <legend>{text.attendance}</legend>
                  <label>
                    <input
                      type="radio"
                      name={attendanceName}
                      value="yes"
                      checked={attendance === "yes"}
                      onChange={(event) => setAttendance(event.target.value)}
                      required
                    />
                    <span>{text.yes}</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name={attendanceName}
                      value="no"
                      checked={attendance === "no"}
                      onChange={(event) => setAttendance(event.target.value)}
                    />
                    <span>{text.no}</span>
                  </label>
                </fieldset>
                <button type="submit">{text.respond}</button>
                <p className={styles.confirmation} role="status" aria-live="polite">
                  {confirmation}
                </p>
              </form>
            ) : null}
          </div>

          <footer className={styles.invitationFooter}>
            <p>Sample content · No data sent</p>
            <p>{edition.title}</p>
          </footer>
        </div>
      </div>
    </section>
  );
}
