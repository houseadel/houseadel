/**
 * The single source for studies.
 *
 * A study is something House Adel built without a brief, to find out how it
 * behaves. It is kept in its own file rather than added to `data/work.ts` with a
 * flag, because the two indexes make different claims and only one of them is
 * about clients: Work is delivered work, and a demonstration piece sitting in
 * that list is the one thing that list must never imply. The wedding invitation
 * is here for exactly that reason — it is a complete piece, and it was made for
 * nobody but the studio.
 *
 * Shaped like `Project` in `data/work.ts` so the same CMS can serve both without
 * a second content model, and so a study can be promoted into work by moving the
 * entry rather than rewriting a component.
 */
export type Study = {
  slug: string;
  title: string;
  /**
   * The title in Indonesian, where the title is a description rather than a name.
   *
   * Shaped like `data/navigation.ts`'s `labelId` for the same reason: a short
   * label needs one alternative, not a pair of objects. A study named after
   * something — a couple, a project — has no `titleId` and is shown as it is in
   * both languages, because translating a name is how you get a different name.
   */
  titleId?: string;
  year: string;
  /** The one sentence that represents the study in any index. */
  sentence: { en: string; id: string };
  disciplines: string[];
  /**
   * Capture of the piece, and the widths it exists at.
   *
   * Omitted where there is no single frame to capture. `src` is the fallback a
   * browser with no modern format support gets; `sources` is what everything else
   * picks from, shaped like `data/invitation.ts`'s media so the two are read the
   * same way. A study plate is a large picture on an otherwise light page, so
   * shipping one width to every device is most of the page's weight spent on
   * pixels a phone cannot show.
   */
  image?: {
    src: string;
    sources: ReadonlyArray<{ width: number; avif: string; webp: string }>;
  };
  /** Where the study can actually be seen, and what to call the way in. */
  seenAt: { href: string; label: { en: string; id: string } };
  /**
   * The opening cannot be reached by following a link: it runs once and then
   * records that it has. Marked on the study that owns that state so the index
   * can offer to run it again instead of describing something unreachable.
   */
  replayable?: boolean;
};

/**
 * A study's title, translated only where the title is a description.
 *
 * Here rather than in the page because it is a fact about the content model: which
 * titles have an Indonesian form is decided by this file, and anything rendering a
 * study should not have to know the rule.
 */
export function titleFor(study: Study, isEnglish: boolean) {
  return isEnglish ? study.title : study.titleId ?? study.title;
}

/**
 * Studies that are a piece in their own right, at an address of their own.
 *
 * Empty, deliberately, and not for long. The wedding invitation was the only
 * entry and it has been taken off the site; nothing else is finished enough to
 * stand on its own address yet. An empty index is the honest state — a studies
 * page carrying work that is not ready would be the one thing this page exists to
 * avoid — and `StudiesPage` renders that state rather than assuming there is
 * always something here.
 */
export const studies: Study[] = [];

/**
 * Studies that run inside this website rather than as a piece of their own.
 *
 * Also empty for the moment. These were descriptions of the opening, the relief
 * and the forest — techniques rather than pieces — and they are being reworked
 * alongside the openings and endings they describe.
 */
export const residentStudies: Study[] = [];
