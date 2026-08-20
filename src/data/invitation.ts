export type Language = "en" | "id";
export type Bilingual = Readonly<Record<Language, string>>;

export type InvitationEvent = {
  id: "ceremony" | "reception";
  name: Bilingual;
  time: Bilingual;
  venue: string;
  address: Bilingual;
  note: Bilingual;
};

export type ScheduleMotif = "arrival" | "chapel" | "courtyard" | "glasshouse" | "dinner" | "toast" | "dance" | "moon";
export type ScheduleEntry = { time: string; what: Bilingual; context: Bilingual; motif: ScheduleMotif };
export type Question = { q: Bilingual; a: Bilingual };
export type InvitationMedia = {
  src: string;
  sources: ReadonlyArray<{ width: 720 | 1280 | 1920; avif: string; webp: string }>;
  alt: Bilingual;
  position: string;
  requirement: string;
};

const cinematicImage = (
  name: "touch" | "couple-veil" | "chapel" | "glasshouse" | "letter" | "sunlight-veil" | "closing",
  widths: ReadonlyArray<720 | 1280 | 1920> = [720, 1280, 1920],
): InvitationMedia["sources"] =>
  widths.map((width) => ({
    width,
    avif: `/assets/invitation/cinematic/${name}-${width}.avif`,
    webp: `/assets/invitation/cinematic/${name}-${width}.webp`,
  }));

/** Wedding content remains separate from presentation. Demo photography is
 * licensed editorial atmosphere and intentionally does not identify its stock
 * subjects as Amara or Daniel. The requirement field describes the couple-owned
 * replacement needed for a commissioned version. */
export const invitation = {
  couple: {
    one: { name: "Amara", full: "Amara Iswari", parents: { en: "daughter of Mr and Mrs Iswari", id: "putri dari Bapak dan Ibu Iswari" } },
    two: { name: "Daniel", full: "Daniel Prawira", parents: { en: "son of Mr and Mrs Prawira", id: "putra dari Bapak dan Ibu Prawira" } },
  },
  date: "2026-11-14T16:00:00+07:00",
  rsvpDeadline: "2026-10-01T23:59:59+07:00",
  dateLabel: { en: "Saturday, the fourteenth of November, two thousand and twenty six", id: "Sabtu, empat belas November dua ribu dua puluh enam" },
  invitationLine: { en: "together with their families, invite you to celebrate their marriage", id: "bersama keluarga mereka, mengundang Anda merayakan pernikahan mereka" },
  hashtag: "#AmaraAndDaniel",
  colors: { paper: "#eee7da", ink: "#1d1916", stone: "#a7957d", botanical: "#303c33", dusk: "#111817", ember: "#b77a45" },
  monogram: { letters: "AD", label: "A / D" },
  chapters: [
    { id: "touch", label: { en: "Touch", id: "Sentuhan" } },
    { id: "place", label: { en: "Place", id: "Tempat" } },
    { id: "anticipation", label: { en: "Anticipation", id: "Menanti" } },
    { id: "story", label: { en: "Before this day", id: "Sebelum hari ini" } },
    { id: "day", label: { en: "The day", id: "Hari itu" } },
    { id: "details", label: { en: "Before you come", id: "Sebelum datang" } },
    { id: "rsvp", label: { en: "Your reply", id: "Jawaban Anda" } },
    { id: "closing", label: { en: "Until then", id: "Sampai nanti" } },
  ],
  entry: {
    eyebrow: { en: "A private invitation", id: "Undangan pribadi" },
    prompt: { en: "Open the invitation", id: "Buka undangan" },
  },
  music: { src: null as string | null, label: { en: "Sound", id: "Suara" } },
  media: {
    veil: { src: "/assets/invitation/cinematic/sunlight-veil-1920.webp", sources: cinematicImage("sunlight-veil"), alt: { en: "Sunlight passing through a bridal veil", id: "Cahaya matahari menembus kerudung pengantin" }, position: "52% 46%", requirement: "Backlit veil or fabric detail from the couple's own wardrobe fitting." },
    chapel: { src: "/assets/invitation/cinematic/chapel-1920.webp", sources: cinematicImage("chapel"), alt: { en: "A quiet stone chapel illuminated through tall windows", id: "Kapel batu yang sunyi diterangi melalui jendela tinggi" }, position: "50% 54%", requirement: "Wide photograph of Chapel of Saint Anne with late-afternoon light entering the architecture." },
    reception: { src: "/assets/invitation/cinematic/glasshouse-1920.webp", sources: cinematicImage("glasshouse"), alt: { en: "Warm light glowing behind the rain-marked glasshouse", id: "Cahaya hangat berpendar di balik rumah kaca yang basah" }, position: "50% 50%", requirement: "Night exterior of Rumah Kaca with guests and warm interior light visible through glass." },
    couplePortrait: { src: "/assets/invitation/cinematic/couple-veil-1920.webp", sources: cinematicImage("couple-veil"), alt: { en: "A couple sharing a quiet moment beneath a veil in golden light", id: "Sepasang kekasih berbagi momen sunyi di balik kerudung dalam cahaya keemasan" }, position: "50% 42%", requirement: "Intimate portrait of Amara and Daniel in warm natural light, not a formal aisle portrait." },
    coupleDetail: { src: "/assets/invitation/cinematic/letter-1920.webp", sources: cinematicImage("letter"), alt: { en: "A handwritten letter beside a single candle", id: "Surat tulisan tangan di samping sebatang lilin" }, position: "50% 48%", requirement: "A real handwritten note, vow draft, or meaningful shared object photographed by candlelight." },
  } satisfies Record<string, InvitationMedia>,
  events: [
    { id: "ceremony", name: { en: "The ceremony", id: "Pemberkatan" }, time: { en: "Four in the afternoon", id: "Pukul empat sore" }, venue: "Chapel of Saint Anne", address: { en: "Jalan Cendana 24, Menteng, Jakarta", id: "Jalan Cendana 24, Menteng, Jakarta" }, note: { en: "Doors open at half past three. The ceremony begins promptly.", id: "Pintu dibuka pukul setengah empat. Pemberkatan dimulai tepat waktu." } },
    { id: "reception", name: { en: "The reception", id: "Resepsi" }, time: { en: "Six in the evening until late", id: "Pukul enam malam hingga larut" }, venue: "Rumah Kaca", address: { en: "Jalan Kemang Raya 8, Jakarta", id: "Jalan Kemang Raya 8, Jakarta" }, note: { en: "Dinner, speeches and dancing in the garden.", id: "Makan malam, sambutan, dan tarian di taman." } },
  ] satisfies InvitationEvent[],
  schedule: [
    { time: "15.30", what: { en: "Guests arrive", id: "Tamu tiba" }, context: { en: "The chapel doors open", id: "Pintu kapel dibuka" }, motif: "arrival" },
    { time: "16.00", what: { en: "Ceremony", id: "Pemberkatan" }, context: { en: "We gather at Saint Anne", id: "Berkumpul di Saint Anne" }, motif: "chapel" },
    { time: "17.00", what: { en: "Photographs in the courtyard", id: "Sesi foto di halaman" }, context: { en: "A pause in the afternoon light", id: "Sejenak dalam cahaya sore" }, motif: "courtyard" },
    { time: "18.00", what: { en: "Reception opens", id: "Resepsi dibuka" }, context: { en: "The garden begins to glow", id: "Taman mulai bercahaya" }, motif: "glasshouse" },
    { time: "19.00", what: { en: "Dinner served", id: "Makan malam disajikan" }, context: { en: "At the long tables", id: "Di meja panjang" }, motif: "dinner" },
    { time: "20.30", what: { en: "Speeches", id: "Sambutan" }, context: { en: "A few words, raised glasses", id: "Beberapa kata, gelas terangkat" }, motif: "toast" },
    { time: "21.00", what: { en: "First dance", id: "Tarian pertama" }, context: { en: "Then everyone joins", id: "Lalu semua bergabung" }, motif: "dance" },
    { time: "23.30", what: { en: "Last call", id: "Panggilan terakhir" }, context: { en: "One last song", id: "Satu lagu terakhir" }, motif: "moon" },
  ] satisfies ScheduleEntry[],
  story: {
    label: { en: "Before this day", id: "Sebelum hari ini" },
    demo: true,
    note: {
      en: "The three memories below are fictional demonstration copy, kept here so they can be replaced together with the couple's own words.",
      id: "Tiga kenangan di bawah adalah naskah demonstrasi fiktif, disimpan di sini agar mudah diganti dengan kisah pasangan.",
    },
    moments: [
      {
        year: "2021",
        title: { en: "The first table", id: "Meja pertama" },
        copy: {
          en: "At a friend's long Sunday lunch, a conversation about old houses quietly outlasted dessert.",
          id: "Di meja makan siang seorang teman, percakapan tentang rumah-rumah tua berlanjut diam-diam setelah hidangan penutup.",
        },
        media: "couplePortrait",
      },
      {
        year: "2023",
        title: { en: "A life in small rituals", id: "Hidup dalam ritual kecil" },
        copy: {
          en: "Saturday mornings became coffee, the market, and the walk home with more flowers than either had planned.",
          id: "Sabtu pagi menjadi kopi, pasar, dan perjalanan pulang dengan bunga lebih banyak dari yang direncanakan.",
        },
        media: "coupleDetail",
      },
      {
        year: "2025",
        title: { en: "After the rain", id: "Setelah hujan" },
        copy: {
          en: "Daniel asked in a quiet courtyard after rain. Amara answered before he had finished the question.",
          id: "Daniel bertanya di halaman yang sunyi setelah hujan. Amara menjawab sebelum pertanyaannya selesai.",
        },
        media: "couplePortrait",
      },
    ],
  },
  rsvp: {
    title: { en: "Will you join us?", id: "Maukah Anda hadir?" },
    deadline: { en: "Kindly reply by 1 October 2026", id: "Mohon jawab sebelum 1 Oktober 2026" },
    accepting: { en: "Joyfully accepts", id: "Dengan gembira hadir" },
    declining: { en: "Regretfully declines", id: "Dengan menyesal tidak hadir" },
  },
  attire: { title: { en: "What should I wear?", id: "Apa yang sebaiknya saya kenakan?" }, body: { en: "Garden formal. The reception is on grass, so flat shoes are wise.", id: "Formal taman. Resepsi digelar di rumput, jadi sepatu datar lebih bijak." }, palette: ["#283731", "#596255", "#8b7a63", "#c8bda9", "#efe7d8"] },
  gifts: { title: { en: "What about gifts?", id: "Bagaimana dengan hadiah?" }, body: { en: "Your presence is the gift. For those who insist, a note at the reception will explain.", id: "Kehadiran Anda adalah hadiahnya. Bagi yang tetap ingin memberi, keterangan tersedia di resepsi." } },
  questions: [
    { q: { en: "May I bring a guest?", id: "Bolehkah saya mengajak tamu?" }, a: { en: "Your invitation names everyone we have room for. If it says your name alone, we hope you will forgive us.", id: "Undangan Anda mencantumkan semua yang dapat kami tampung. Jika hanya nama Anda, mohon dimaklumi." } },
    { q: { en: "Are children welcome?", id: "Apakah anak-anak boleh hadir?" }, a: { en: "Children are welcome at the ceremony. The reception is for adults.", id: "Anak-anak dipersilakan hadir pada pemberkatan. Resepsi khusus dewasa." } },
    { q: { en: "Where should I park?", id: "Di mana saya parkir?" }, a: { en: "Valet is available at both venues. The chapel courtyard fills early.", id: "Valet tersedia di kedua tempat. Halaman kapel cepat penuh." } },
    { q: { en: "When should I arrive?", id: "Kapan saya harus tiba?" }, a: { en: "The chapel doors open at half past three. The ceremony begins promptly at four.", id: "Pintu kapel dibuka pukul setengah empat. Pemberkatan dimulai tepat pukul empat." } },
    { q: { en: "When should I reply?", id: "Kapan saya harus menjawab?" }, a: { en: "By the first of October, so the kitchen can count.", id: "Paling lambat 1 Oktober, agar dapur dapat menghitung." } },
  ] satisfies Question[],
  closing: { en: "We would rather have you there than anything you could bring.", id: "Kehadiran Anda lebih berarti daripada apa pun yang Anda bawa." },
} as const;

export function calendarFile(language: Language): string {
  const start = new Date(invitation.date);
  const end = new Date(start.getTime() + 7 * 60 * 60 * 1000);
  const stamp = (value: Date) => `${value.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Amara and Daniel//Wedding//EN", "BEGIN:VEVENT", `UID:${start.getTime()}@amara-and-daniel`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`, `SUMMARY:${invitation.couple.one.name} & ${invitation.couple.two.name}`, `LOCATION:${invitation.events[0].venue}`, `DESCRIPTION:${invitation.dateLabel[language]}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
}
