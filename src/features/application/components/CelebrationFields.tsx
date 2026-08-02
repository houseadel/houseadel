import { useFormContext } from "react-hook-form";
import {
  EVENT_COUNT_LABELS,
  EVENT_COUNT_VALUES,
  GUEST_COUNT_LABELS,
  GUEST_COUNT_VALUES,
} from "../applicationOptions";
import { FIELD_LIMITS, type ApplicationValues } from "../applicationSchema";
import { ApplicationSection } from "./ApplicationSection";
import { FieldShell } from "./FieldShell";
import styles from "./ApplicationForm.module.css";

export function CelebrationFields() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ApplicationValues>();

  return (
    <ApplicationSection
      id="your-celebration"
      number="01"
      title="Your celebration"
      introduction="Begin with the practical outline. Dates may remain unconfirmed."
    >
      <FieldShell
        id="applicant-name"
        label="Applicant name"
        description="The person preparing this application."
        error={errors.applicantName?.message}
        required
      >
        {(describedBy) => (
          <input
            className={styles.input}
            id="applicant-name"
            type="text"
            autoComplete="name"
            maxLength={120}
            required
            aria-invalid={Boolean(errors.applicantName)}
            aria-describedby={describedBy}
            {...register("applicantName")}
          />
        )}
      </FieldShell>

      <FieldShell
        id="celebration-names"
        label="Partner or project names"
        description="The names or working title that should identify the celebration."
        error={errors.celebrationNames?.message}
        required
      >
        {(describedBy) => (
          <input
            className={styles.input}
            id="celebration-names"
            type="text"
            autoComplete="off"
            maxLength={FIELD_LIMITS.short}
            required
            aria-invalid={Boolean(errors.celebrationNames)}
            aria-describedby={describedBy}
            {...register("celebrationNames")}
          />
        )}
      </FieldShell>

      <div className={styles.fieldPair}>
        <FieldShell
          id="celebration-date"
          label="Wedding or celebration date"
          description="Leave blank if it is not confirmed."
          error={errors.celebrationDate?.message}
        >
          {(describedBy) => (
            <input
              className={styles.input}
              id="celebration-date"
              type="date"
              aria-invalid={Boolean(errors.celebrationDate)}
              aria-describedby={describedBy}
              {...register("celebrationDate")}
            />
          )}
        </FieldShell>
        <FieldShell
          id="required-launch-date"
          label="Required website launch date"
          description="The latest useful date, if known."
          error={errors.requiredLaunchDate?.message}
        >
          {(describedBy) => (
            <input
              className={styles.input}
              id="required-launch-date"
              type="date"
              aria-invalid={Boolean(errors.requiredLaunchDate)}
              aria-describedby={describedBy}
              {...register("requiredLaunchDate")}
            />
          )}
        </FieldShell>
      </div>

      <FieldShell
        id="celebration-location"
        label="Location"
        description="City, country, venue, or “Not sure yet.”"
        error={errors.location?.message}
        required
      >
        {(describedBy) => (
          <input
            className={styles.input}
            id="celebration-location"
            type="text"
            autoComplete="off"
            maxLength={FIELD_LIMITS.location}
            required
            aria-invalid={Boolean(errors.location)}
            aria-describedby={describedBy}
            {...register("location")}
          />
        )}
      </FieldShell>

      <div className={styles.fieldPair}>
        <FieldShell
          id="guest-count"
          label="Approximate guest count"
          description="A broad range is enough."
          error={errors.approximateGuestCount?.message}
          required
        >
          {(describedBy) => (
            <select
              className={styles.select}
              id="guest-count"
              required
              aria-invalid={Boolean(errors.approximateGuestCount)}
              aria-describedby={describedBy}
              {...register("approximateGuestCount")}
            >
              {GUEST_COUNT_VALUES.map((value) => (
                <option key={value} value={value}>
                  {GUEST_COUNT_LABELS[value]}
                </option>
              ))}
            </select>
          )}
        </FieldShell>
        <FieldShell
          id="event-count"
          label="Number of events"
          description="Include every event the invitation may need to distinguish."
          error={errors.numberOfEvents?.message}
          required
        >
          {(describedBy) => (
            <select
              className={styles.select}
              id="event-count"
              required
              aria-invalid={Boolean(errors.numberOfEvents)}
              aria-describedby={describedBy}
              {...register("numberOfEvents")}
            >
              {EVENT_COUNT_VALUES.map((value) => (
                <option key={value} value={value}>
                  {EVENT_COUNT_LABELS[value]}
                </option>
              ))}
            </select>
          )}
        </FieldShell>
      </div>
    </ApplicationSection>
  );
}

