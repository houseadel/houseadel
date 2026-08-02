import { useFormContext } from "react-hook-form";
import {
  CONFIDENTIALITY_LABELS,
  CONFIDENTIALITY_VALUES,
  ENGAGEMENT_LABELS,
  ENGAGEMENT_VALUES,
} from "../applicationOptions";
import { FIELD_LIMITS, type ApplicationValues } from "../applicationSchema";
import { ApplicationSection } from "./ApplicationSection";
import { FieldShell } from "./FieldShell";
import styles from "./ApplicationForm.module.css";

export function ScopeFields() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ApplicationValues>();

  return (
    <ApplicationSection
      id="scope"
      number="04"
      title="Scope"
      introduction="Indicate the likely path and constraints. “Not sure yet” is welcome."
    >
      <FieldShell
        id="engagement-type"
        label="Project path"
        description="An Edition begins with a House Adel world. A Private Commission begins with yours."
        error={errors.engagementType?.message}
        required
      >
        {(describedBy) => (
          <select
            className={styles.select}
            id="engagement-type"
            required
            aria-invalid={Boolean(errors.engagementType)}
            aria-describedby={describedBy}
            {...register("engagementType")}
          >
            {ENGAGEMENT_VALUES.map((value) => (
              <option key={value} value={value}>
                {ENGAGEMENT_LABELS[value]}
              </option>
            ))}
          </select>
        )}
      </FieldShell>

      <div className={styles.fieldPair}>
        <FieldShell
          id="budget-range"
          label="Budget range"
          description="Include a currency and approximate range, or write “Not sure yet.”"
          error={errors.budgetRange?.message}
          required
        >
          {(describedBy) => (
            <input
              className={styles.input}
              id="budget-range"
              type="text"
              maxLength={120}
              required
              aria-invalid={Boolean(errors.budgetRange)}
              aria-describedby={describedBy}
              {...register("budgetRange")}
            />
          )}
        </FieldShell>
        <FieldShell
          id="project-deadline"
          label="Project deadline"
          description="Leave blank if it is not fixed."
          error={errors.projectDeadline?.message}
        >
          {(describedBy) => (
            <input
              className={styles.input}
              id="project-deadline"
              type="date"
              aria-invalid={Boolean(errors.projectDeadline)}
              aria-describedby={describedBy}
              {...register("projectDeadline")}
            />
          )}
        </FieldShell>
      </div>

      <FieldShell
        id="languages"
        label="Languages"
        description="List every language the guest experience may require, or write “Not sure yet.”"
        error={errors.languages?.message}
        required
      >
        {(describedBy) => (
          <input
            className={styles.input}
            id="languages"
            type="text"
            maxLength={FIELD_LIMITS.short}
            required
            aria-invalid={Boolean(errors.languages)}
            aria-describedby={describedBy}
            {...register("languages")}
          />
        )}
      </FieldShell>

      <FieldShell
        id="collaborators"
        label="Planner or creative collaborators"
        description="Share names and roles only when useful at this stage."
        error={errors.collaborators?.message}
      >
        {(describedBy) => (
          <textarea
            className={styles.textarea}
            id="collaborators"
            rows={3}
            maxLength={FIELD_LIMITS.collaborators}
            aria-invalid={Boolean(errors.collaborators)}
            aria-describedby={describedBy}
            {...register("collaborators")}
          />
        )}
      </FieldShell>

      <FieldShell
        id="confidentiality"
        label="Confidentiality needs"
        description="Choose the handling that feels appropriate for an initial enquiry."
        error={errors.confidentiality?.message}
        required
      >
        {(describedBy) => (
          <select
            className={styles.select}
            id="confidentiality"
            required
            aria-invalid={Boolean(errors.confidentiality)}
            aria-describedby={describedBy}
            {...register("confidentiality")}
          >
            {CONFIDENTIALITY_VALUES.map((value) => (
              <option key={value} value={value}>
                {CONFIDENTIALITY_LABELS[value]}
              </option>
            ))}
          </select>
        )}
      </FieldShell>
    </ApplicationSection>
  );
}

