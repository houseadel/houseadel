/**
 * The single source for work shown on the site.
 *
 * Shaped so a CMS can replace this file without touching a component: every field
 * a project page renders lives here, including the screenshot path and the live
 * URL. Until a CMS is connected, adding a project means adding one entry.
 *
 * `status` exists so nothing on this site can quietly imply a client relationship
 * that does not exist. `published` means real, delivered work. `placeholder`
 * means a piece built by House Adel to stand in the index until real work
 * replaces it, and the index labels it as such rather than presenting it as a
 * commissioned project.
 *
 * Nothing is a placeholder here any more. The wedding invitation was the only
 * entry that ever was, and a label is a weak way to hold a distinction this
 * important: it is a piece the studio made for itself, so it belongs in
 * `data/studies.ts` and this index is delivered work and nothing else. The
 * `placeholder` status is kept in the type because the situation it describes can
 * recur, and because the alternative is a silent index of mixed claims.
 */
export type Project = {
  slug: string;
  title: string;
  year: string;
  client?: string;
  status: "published" | "placeholder";
  /** The one sentence that represents the project in any index. */
  sentence: { en: string; id: string };
  disciplines: string[];
  /** Screenshot of the work. Empty until a real capture is supplied. */
  image?: string;
  /** Live destination. Omitted while none exists. */
  url?: string;
};

export const work: Project[] = [
  {
    slug: "marvell-20",
    title: "MARVELL 20",
    year: "2026",
    client: "Marvell Florist",
    status: "published",
    sentence: {
      en: "A digital experience created for Marvell Florist's twentieth anniversary.",
      id: "Sebuah pengalaman digital untuk ulang tahun ke-20 Marvell Florist.",
    },
    disciplines: [
      "Digital direction",
      "Website design",
      "Frontend development",
      "Interactive event tools",
    ],
    image: "/assets/marvell-20/marvell-20-opening-1600w.webp",
    url: "https://marvellflorist.github.io/marvell20/",
  },
];
