import { resolveAppUrl } from "../../lib/basePath";
import { isChapterPath } from "../../lib/chapters";

/**
 * Which sculpture each page is not finished without.
 *
 * The sculptures are the subject of the pages they stand on, not decoration
 * applied to them: Home *is* the figure held in the dark, and Contact is a
 * question asked beside one. A page that has painted its type and its form
 * fields but has no sculpture yet is not a page that has loaded quickly, it is
 * the wrong page — and the sculpture arriving afterwards reads as a mistake
 * being corrected rather than as a page opening.
 *
 * So this is the one place that answers "what must be here", and both the thing
 * that waits and the thing that draws read it. They used to know separately:
 * each stage named its own cloud and the loader knew about none of them, which
 * is exactly how the site came to hand over before its subject had arrived.
 *
 * A page with no entry here has no sculpture and waits for nothing.
 */
const SCULPTURES: Record<string, string> = {
  "/contact": "/assets/house-adel/cupid-cloud.bin",
  "/begin-a-project": "/assets/house-adel/cupid-cloud.bin",
};

/** The continuous document's own sculpture, shared by every chapter of it. */
const DOCUMENT_SCULPTURE = "/assets/house-adel/home-cloud.bin";

/** Resolved so callers get a URL they can fetch, whatever the deployment base. */
export function sculptureForPath(pathname: string): string | null {
  if (isChapterPath(pathname)) return resolveAppUrl(DOCUMENT_SCULPTURE);
  const sculpture = SCULPTURES[pathname];
  return sculpture ? resolveAppUrl(sculpture) : null;
}

export const HOME_SCULPTURE = resolveAppUrl(DOCUMENT_SCULPTURE);
export const CONTACT_SCULPTURE = resolveAppUrl(SCULPTURES["/contact"]);
