import { commissionBackend } from "../../config/commissionBackend";
import { normalizeApplicationInput, type ApplicationValues } from "./applicationSchema";
import { composeBackendContact } from "./contactMethods";

export type CommissionPayload = {
  submissionId: string;
  name: string;
  contact: string;
  planning: string;
  eventDate: string;
  websitePurpose: string;
  projectMeaning: string;
  moreDetails: string;
  references: string;
  anythingElse: string;
  submittedAt: string;
  formStartedAt: string;
  source: string;
  frontendVersion: string;
  website: string;
};

const TOKEN_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateInquiryId(now = new Date(), randomSource: Pick<Crypto, "getRandomValues"> = crypto) {
  const bytes = new Uint8Array(8);
  randomSource.getRandomValues(bytes);
  const token = Array.from(bytes, (value) => TOKEN_ALPHABET[value % TOKEN_ALPHABET.length]).join("");
  return `HA-I-${now.getUTCFullYear()}-${token}`;
}

export function createCommissionPayload(
  values: ApplicationValues,
  metadata: { submissionId: string; submittedAt: Date; formStartedAt: Date },
): CommissionPayload {
  const normalized = normalizeApplicationInput(values);
  return {
    submissionId: metadata.submissionId,
    name: normalized.name,
    contact: composeBackendContact(normalized),
    planning: normalized.planning,
    eventDate: normalized.eventDate,
    websitePurpose: normalized.websitePurpose,
    projectMeaning: normalized.projectMeaning,
    moreDetails: normalized.moreDetails,
    references: normalized.references,
    anythingElse: normalized.anythingElse,
    submittedAt: metadata.submittedAt.toISOString(),
    formStartedAt: metadata.formStartedAt.toISOString(),
    source: commissionBackend.source,
    frontendVersion: commissionBackend.frontendVersion,
    website: normalized.website,
  };
}
