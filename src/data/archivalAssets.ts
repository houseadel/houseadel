export type ArchivalAsset = {
  id: "met-389774" | "met-390163";
  title: string;
  credit: string;
  source: string;
  avif: string;
  webp: string;
  alt: string;
};

export const archivalAssets = {
  interior: {
    id: "met-389774",
    title: "Drawing for an Interior",
    credit: "Anonymous, Italian, 18th century. The Metropolitan Museum of Art. Public Domain.",
    source: "https://www.metmuseum.org/art/collection/search/389774",
    avif: "/assets/open-access/met-389774-1600w.avif",
    webp: "/assets/open-access/met-389774-1600w.webp",
    alt: "An eighteenth-century architectural interior drawing in ink and wash.",
  },
  drawingRoom: {
    id: "met-390163",
    title: "Interior of a Drawing Room",
    credit: "Anonymous, Italian, 1838. The Metropolitan Museum of Art. Public Domain.",
    source: "https://www.metmuseum.org/art/collection/search/390163",
    avif: "/assets/open-access/met-390163-1600w.avif",
    webp: "/assets/open-access/met-390163-1600w.webp",
    alt: "A nineteenth-century watercolor study of an Italian drawing room.",
  },
} as const satisfies Record<string, ArchivalAsset>;

