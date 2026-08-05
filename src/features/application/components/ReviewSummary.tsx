import type { ReactNode } from "react";
import { useLanguage } from "../../../context/LanguageContext";
import {
  CONFIDENTIALITY_LABELS,
  CONFIDENTIALITY_LABELS_ID,
  CONTACT_METHOD_LABELS,
  CONTACT_METHOD_LABELS_ID,
  ENGAGEMENT_LABELS,
  ENGAGEMENT_LABELS_ID,
  EVENT_COUNT_LABELS,
  EVENT_COUNT_LABELS_ID,
  GUEST_COUNT_LABELS,
  GUEST_COUNT_LABELS_ID,
  NEED_LABELS,
  NEED_LABELS_ID,
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
  editLabel: string;
};

function ReviewGroup({ id, title, onEdit, children, editLabel }: ReviewGroupProps) {
  return (
    <section className={styles.reviewGroup} aria-labelledby={`review-${id}`}>
      <header>
        <h3 id={`review-${id}`}>{title}</h3>
        <button className={styles.editButton} type="button" onClick={() => onEdit(id)}>
          {editLabel} <span className="sr-only">{title}</span>
        </button>
      </header>
      <dl>{children}</dl>
    </section>
  );
}

function ReviewRow({ label, value, empty }: { label: string; value: string | undefined; empty: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value?.trim() || empty}</dd>
    </div>
  );
}

export function ReviewSummary({ values, onEdit }: ReviewSummaryProps) {
  const { language } = useLanguage();
  const id = language === "id";
  const edit = id ? "Ubah" : "Edit";
  const empty = id ? "Tidak diisi" : "Not supplied";
  const needs = id ? NEED_LABELS_ID : NEED_LABELS;
  return (
    <div className={styles.reviewSummary}>
      <ReviewGroup id="your-celebration" title={id ? "Perayaan Anda" : "Your celebration"} onEdit={onEdit} editLabel={edit}>
        <ReviewRow label={id ? "Pemohon" : "Applicant"} value={values.applicantName} empty={empty} />
        <ReviewRow label={id ? "Nama atau proyek" : "Names or project"} value={values.celebrationNames} empty={empty} />
        <ReviewRow label={id ? "Tanggal perayaan" : "Celebration date"} value={values.celebrationDate} empty={empty} />
        <ReviewRow label={id ? "Lokasi" : "Location"} value={values.location} empty={empty} />
        <ReviewRow label={id ? "Jumlah tamu" : "Guest count"} value={(id ? GUEST_COUNT_LABELS_ID : GUEST_COUNT_LABELS)[values.approximateGuestCount]} empty={empty} />
        <ReviewRow label={id ? "Jumlah acara" : "Number of events"} value={(id ? EVENT_COUNT_LABELS_ID : EVENT_COUNT_LABELS)[values.numberOfEvents]} empty={empty} />
        <ReviewRow label={id ? "Peluncuran" : "Required launch"} value={values.requiredLaunchDate} empty={empty} />
      </ReviewGroup>

      <ReviewGroup id="what-you-need" title={id ? "Yang Anda butuhkan" : "What you need"} onEdit={onEdit} editLabel={edit}>
        <ReviewRow
          label={id ? "Fungsi" : "Functions"}
          value={values.needs.map((value) => needs[value]).join(" · ")}
          empty={empty}
        />
      </ReviewGroup>

      <ReviewGroup id="the-story" title={id ? "Cerita" : "The story"} onEdit={onEdit} editLabel={edit}>
        <ReviewRow label={id ? "Tentang kalian" : "About you"} value={values.storyTogether} empty={empty} />
        <ReviewRow label={id ? "Materi bermakna" : "Meaningful material"} value={values.meaningfulMaterial} empty={empty} />
        <ReviewRow label={id ? "Perasaan pembuka" : "Opening feeling"} value={values.openingFeeling} empty={empty} />
        <ReviewRow label={id ? "Tautan referensi" : "Reference links"} value={values.referenceLinks} empty={empty} />
        <ReviewRow label={id ? "Situs atau mood board" : "Existing site or mood board"} value={values.existingWebsite} empty={empty} />
      </ReviewGroup>

      <ReviewGroup id="scope" title={id ? "Lingkup" : "Scope"} onEdit={onEdit} editLabel={edit}>
        <ReviewRow label={id ? "Jalur proyek" : "Project path"} value={(id ? ENGAGEMENT_LABELS_ID : ENGAGEMENT_LABELS)[values.engagementType]} empty={empty} />
        <ReviewRow label={id ? "Kisaran anggaran" : "Budget range"} value={values.budgetRange} empty={empty} />
        <ReviewRow label={id ? "Tenggat proyek" : "Project deadline"} value={values.projectDeadline} empty={empty} />
        <ReviewRow label={id ? "Bahasa" : "Languages"} value={values.languages} empty={empty} />
        <ReviewRow label={id ? "Kolaborator" : "Collaborators"} value={values.collaborators} empty={empty} />
        <ReviewRow label={id ? "Kerahasiaan" : "Confidentiality"} value={(id ? CONFIDENTIALITY_LABELS_ID : CONFIDENTIALITY_LABELS)[values.confidentiality]} empty={empty} />
      </ReviewGroup>

      <ReviewGroup id="contact" title={id ? "Kontak" : "Contact"} onEdit={onEdit} editLabel={edit}>
        <ReviewRow label={id ? "Nama" : "Name"} value={values.contactName} empty={empty} />
        <ReviewRow label="Email" value={values.email} empty={empty} />
        <ReviewRow label={id ? "WhatsApp atau telepon" : "WhatsApp or phone"} value={values.phone} empty={empty} />
        <ReviewRow label={id ? "Metode pilihan" : "Preferred method"} value={(id ? CONTACT_METHOD_LABELS_ID : CONTACT_METHOD_LABELS)[values.preferredContact]} empty={empty} />
        <ReviewRow label={id ? "Negara" : "Country"} value={values.country} empty={empty} />
        <ReviewRow label={id ? "Zona waktu" : "Time zone"} value={values.timeZone} empty={empty} />
        <ReviewRow label={id ? "Waktu kontak" : "Best contact time"} value={values.bestContactTime} empty={empty} />
      </ReviewGroup>
    </div>
  );
}
