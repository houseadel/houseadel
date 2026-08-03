import { useEffect, useRef } from "react";
import {
  ENGAGEMENT_LABELS,
  EVENT_COUNT_LABELS,
  GUEST_COUNT_LABELS,
  NEED_LABELS,
} from "../applicationOptions";
import type { ApplicationValues } from "../applicationSchema";
import { deferMotion } from "../../../lib/deferredMotion";
import styles from "./ApplicationForm.module.css";

type BriefCardProps = {
  values: ApplicationValues;
};

function answer(value: string, fallback: string) {
  return value.trim() || fallback;
}

const ASSEMBLY_STEP_COUNT = 6;

function getAssemblyStates(values: ApplicationValues) {
  return [
    values.celebrationNames.trim().length > 0,
    values.location.trim().length > 0 || values.celebrationDate.trim().length > 0,
    values.openingFeeling.trim().length > 0,
    values.needs.length > 0,
    values.contactName.trim().length > 0,
    values.languages.trim().length > 0,
  ];
}

export function BriefCard({ values }: BriefCardProps) {
  const assemblyStates = getAssemblyStates(values);
  const assemblyCount = assemblyStates.filter(Boolean).length;
  const cardRef = useRef<HTMLElement>(null);
  const previousCount = useRef(assemblyCount);
  const selectedNeeds = values.needs.map((value) => NEED_LABELS[value]).join(" · ");

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const previous = previousCount.current;
    previousCount.current = assemblyCount;
    return deferMotion((gsap) => {
      const media = gsap.matchMedia();
      const context = gsap.context(() => {
        media.add("(prefers-reduced-motion: reduce)", () => {
          gsap.set(card, { "--brief-progress": assemblyCount / ASSEMBLY_STEP_COUNT });
        });

        media.add(
          {
            wide: "(min-width: 80rem)",
            compact: "(max-width: 79.99rem)",
            motion: "(prefers-reduced-motion: no-preference)",
          },
          ({ conditions }) => {
            const { motion, wide } = conditions ?? {};
            if (!motion) return;

            gsap.fromTo(
              card,
              { "--brief-progress": previous / ASSEMBLY_STEP_COUNT },
              {
                "--brief-progress": assemblyCount / ASSEMBLY_STEP_COUNT,
                duration: wide ? 0.48 : 0.32,
                ease: "power2.out",
                overwrite: "auto",
              },
            );

            if (assemblyCount !== previous) {
              gsap.fromTo(
                card.querySelector<HTMLElement>("[data-brief-corner]"),
                { scale: assemblyCount > previous ? 0.72 : 1.12, autoAlpha: 0.44 },
                { scale: 1, autoAlpha: 1, duration: 0.42, ease: "power2.out", overwrite: "auto" },
              );
            }
          },
        );
      }, card);

      return () => {
        media.revert();
        context.revert();
      };
    });
  }, [assemblyCount]);

  return (
    <aside ref={cardRef} className={styles.briefCard} aria-labelledby="living-brief-title">
      <div className={styles.briefAssembly} aria-hidden="true">
        {assemblyStates.map((complete, index) => (
          <span key={index} data-complete={complete} />
        ))}
      </div>
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
      <span className={styles.briefCorner} data-brief-corner aria-hidden="true" />
    </aside>
  );
}
