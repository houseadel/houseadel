import {
  ENGAGEMENT_LABELS,
  EVENT_COUNT_LABELS,
  GUEST_COUNT_LABELS,
  NEED_LABELS,
} from "../applicationOptions";
import type { ApplicationValues } from "../applicationSchema";
import styles from "./ApplicationForm.module.css";

type BriefCardProps = {
  values: ApplicationValues;
};

function answer(value: string, fallback: string) {
  return value.trim() || fallback;
}

export function BriefCard({ values }: BriefCardProps) {
  const selectedNeeds = values.needs.map((value) => NEED_LABELS[value]).join(" · ");

  return (
    <aside className={styles.briefCard} aria-labelledby="living-brief-title">
      <header className={styles.briefHeader}>
        <p>Project brief · live draft</p>
        <span aria-hidden="true">HA</span>
      </header>
      <h2 id="living-brief-title">{answer(values.celebrationNames, "An occasion in formation")}</h2>
      <p className={styles.briefPremise}>
        {answer(values.openingFeeling, "The intended feeling will appear here as the brief takes shape.")}
      </p>
      <dl className={styles.briefDetails}>
        <div>
          <dt>Path</dt>
          <dd>{ENGAGEMENT_LABELS[values.engagementType]}</dd>
        </div>
        <div>
          <dt>Place</dt>
          <dd>{answer(values.location, "To be confirmed")}</dd>
        </div>
        <div>
          <dt>Date</dt>
          <dd>{answer(values.celebrationDate, "To be confirmed")}</dd>
        </div>
        <div>
          <dt>Guests</dt>
          <dd>{GUEST_COUNT_LABELS[values.approximateGuestCount]}</dd>
        </div>
        <div>
          <dt>Events</dt>
          <dd>{EVENT_COUNT_LABELS[values.numberOfEvents]}</dd>
        </div>
        <div>
          <dt>Languages</dt>
          <dd>{answer(values.languages, "To be confirmed")}</dd>
        </div>
      </dl>
      <div className={styles.briefNeeds}>
        <p>Functions</p>
        <p>{selectedNeeds || "No functions selected yet"}</p>
      </div>
      <p className={styles.briefFooter}>This card is a working outline, not a submitted application.</p>
    </aside>
  );
}

