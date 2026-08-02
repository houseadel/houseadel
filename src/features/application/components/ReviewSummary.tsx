import type { ReactNode } from "react";
import {
  CONFIDENTIALITY_LABELS,
  CONTACT_METHOD_LABELS,
  ENGAGEMENT_LABELS,
  EVENT_COUNT_LABELS,
  GUEST_COUNT_LABELS,
  NEED_LABELS,
} from "../applicationOptions";
import type { ApplicationValues } from "../applicationSchema";
import styles from "./ApplicationForm.module.css";

type ReviewSummaryProps = {
  values: ApplicationValues;
  onEdit: (sectionId: string) => void;
};

type ReviewGroupProps = {
  id: string;
  title: string;
  onEdit: (sectionId: string) => void;
  children: ReactNode;
};

function ReviewGroup({ id, title, onEdit, children }: ReviewGroupProps) {
  return (
    <section className={styles.reviewGroup} aria-labelledby={`review-${id}`}>
      <header>
        <h3 id={`review-${id}`}>{title}</h3>
        <button className={styles.editButton} type="button" onClick={() => onEdit(id)}>
          Edit <span className="sr-only">{title}</span>
        </button>
      </header>
      <dl>{children}</dl>
    </section>
  );
}

function ReviewRow({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value?.trim() || "Not supplied"}</dd>
    </div>
  );
}

export function ReviewSummary({ values, onEdit }: ReviewSummaryProps) {
  return (
    <div className={styles.reviewSummary}>
      <ReviewGroup id="your-celebration" title="Your celebration" onEdit={onEdit}>
        <ReviewRow label="Applicant" value={values.applicantName} />
        <ReviewRow label="Names or project" value={values.celebrationNames} />
        <ReviewRow label="Celebration date" value={values.celebrationDate} />
        <ReviewRow label="Location" value={values.location} />
        <ReviewRow label="Guest count" value={GUEST_COUNT_LABELS[values.approximateGuestCount]} />
        <ReviewRow label="Number of events" value={EVENT_COUNT_LABELS[values.numberOfEvents]} />
        <ReviewRow label="Required launch" value={values.requiredLaunchDate} />
      </ReviewGroup>

      <ReviewGroup id="what-you-need" title="What you need" onEdit={onEdit}>
        <ReviewRow
          label="Functions"
          value={values.needs.map((value) => NEED_LABELS[value]).join(" · ")}
        />
      </ReviewGroup>

      <ReviewGroup id="the-story" title="The story" onEdit={onEdit}>
        <ReviewRow label="About you" value={values.storyTogether} />
        <ReviewRow label="Meaningful material" value={values.meaningfulMaterial} />
        <ReviewRow label="Opening feeling" value={values.openingFeeling} />
        <ReviewRow label="Reference links" value={values.referenceLinks} />
        <ReviewRow label="Existing site or mood board" value={values.existingWebsite} />
      </ReviewGroup>

      <ReviewGroup id="scope" title="Scope" onEdit={onEdit}>
        <ReviewRow label="Project path" value={ENGAGEMENT_LABELS[values.engagementType]} />
        <ReviewRow label="Budget range" value={values.budgetRange} />
        <ReviewRow label="Project deadline" value={values.projectDeadline} />
        <ReviewRow label="Languages" value={values.languages} />
        <ReviewRow label="Collaborators" value={values.collaborators} />
        <ReviewRow label="Confidentiality" value={CONFIDENTIALITY_LABELS[values.confidentiality]} />
      </ReviewGroup>

      <ReviewGroup id="contact" title="Contact" onEdit={onEdit}>
        <ReviewRow label="Name" value={values.contactName} />
        <ReviewRow label="Email" value={values.email} />
        <ReviewRow label="WhatsApp or phone" value={values.phone} />
        <ReviewRow label="Preferred method" value={CONTACT_METHOD_LABELS[values.preferredContact]} />
        <ReviewRow label="Country" value={values.country} />
        <ReviewRow label="Time zone" value={values.timeZone} />
        <ReviewRow label="Best contact time" value={values.bestContactTime} />
      </ReviewGroup>
    </div>
  );
}
