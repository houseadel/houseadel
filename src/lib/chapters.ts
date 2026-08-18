/**
 * The site is one continuous document divided into chapters.
 *
 * Each chapter owns a real path, so it can be linked to, bookmarked and shared,
 * but moving between them is a scroll rather than a navigation: the URL is
 * rewritten with `replaceState` as a chapter takes the viewport, which changes the
 * address bar without touching history depth and without waking the router.
 *
 * Adding a chapter means adding a line here and marking the section with
 * `data-chapter="<id>"`. Nothing else needs to know.
 */
export type Chapter = {
  id: string;
  path: string;
  title: string;
  /** Label used in navigation, when the chapter appears there. */
  label?: { en: string; id: string };
};

export const chapters: Chapter[] = [
  { id: "home", path: "/", title: "House Adel" },
  {
    id: "work",
    path: "/work",
    title: "Work — House Adel",
    label: { en: "Work", id: "Karya" },
  },
];

export function chapterForPath(pathname: string): Chapter | undefined {
  return chapters.find((chapter) => chapter.path === pathname);
}

/** Paths that are chapters of the continuous document rather than routes. */
export function isChapterPath(pathname: string): boolean {
  return chapters.some((chapter) => chapter.path === pathname);
}

/**
 * What counts as "a different page" for the purposes of mounting and
 * transitioning.
 *
 * Every chapter answers with the same identity, because they are the same
 * mounted document — moving between them is a scroll, exactly as the note at the
 * top of this file says. Treating their paths as different routes meant that
 * clicking Work tore the entire home document down and rebuilt it, relief and
 * forest and all, to arrive at a place it was already displaying further down
 * the page. Everything else is its own identity, which is its path.
 */
export function routeIdentity(pathname: string): string {
  return isChapterPath(pathname) ? "document" : pathname;
}
