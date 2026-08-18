import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useLanguage } from "../context/LanguageContext";
import { invitation, calendarFile, type InvitationMedia, type ScheduleMotif } from "../data/invitation";
import { CinematicLight } from "../features/invitation/CinematicLight";
import { resolveAppUrl } from "../lib/basePath";
import { motionIsReduced } from "../lib/preferences";
import styles from "./InvitationPage.module.css";

type Reply = { name: string; attending: "yes" | "no" | ""; guests: string; dietary: string; note: string };
const EMPTY_REPLY: Reply = { name: "", attending: "", guests: "1", dietary: "", note: "" };

function Photograph({ media, className = "", eager = false }: { media: InvitationMedia; className?: string; eager?: boolean }) {
  const { language } = useLanguage();
  const avif = media.sources.map((item) => `${resolveAppUrl(item.avif)} ${item.width}w`).join(", ");
  const webp = media.sources.map((item) => `${resolveAppUrl(item.webp)} ${item.width}w`).join(", ");
  return (
    <figure className={`${styles.photograph} ${className}`}>
      <picture>
        <source type="image/avif" srcSet={avif} />
        <source type="image/webp" srcSet={webp} />
        <img src={resolveAppUrl(media.src)} alt={media.alt[language]} loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"} decoding="async" style={{ objectPosition: media.position }} />
      </picture>
    </figure>
  );
}

function Monogram({ className = "" }: { className?: string }) {
  return (
    <svg className={`${styles.monogram} ${className}`} viewBox="0 0 92 62" aria-label="Amara and Daniel monogram">
      <path d="M10 52 31 9l20 43M19 35h25" />
      <path d="M42 9v43M43 10h12c17 0 27 8 27 21S72 52 55 52H43" />
      <path className={styles.monogramThread} d="M35 7c9 15 11 31 2 48" />
    </svg>
  );
}

function Kicker({ number, children }: { number: string; children: ReactNode }) {
  return <p className={styles.kicker}><span>{number}</span>{children}</p>;
}

function Entrance({ onEnter }: { onEnter: () => void }) {
  const { language } = useLanguage();
  const [leaving, setLeaving] = useState(false);
  const open = () => {
    setLeaving(true);
    window.setTimeout(onEnter, motionIsReduced() ? 40 : 1050);
  };
  return (
    <div className={styles.entrance} data-leaving={leaving} role="dialog" aria-modal="true" aria-labelledby="entrance-title">
      <Photograph media={invitation.media.veil} className={styles.entranceImage} eager />
      <div className={styles.entranceVellum} aria-hidden="true" />
      <div className={styles.entranceContent}>
        <Monogram className={styles.entranceMark} />
        <div>
          <p>{language === "en" ? "The wedding of" : "Pernikahan"}</p>
          <h2 id="entrance-title">Amara <i>&amp;</i> Daniel</h2>
          <time dateTime="2026-11-14">14 · 11 · 2026</time>
        </div>
        <button type="button" onClick={open}><span>{language === "en" ? "Enter the invitation" : "Masuk ke undangan"}</span><i aria-hidden="true">↓</i></button>
      </div>
    </div>
  );
}

function InvitationNavigation({ active }: { active: number }) {
  const { language, setLanguage } = useLanguage();
  const links = [["story", language === "en" ? "Story" : "Kisah"], ["day", language === "en" ? "Day" : "Hari"], ["details", language === "en" ? "Details" : "Detail"], ["rsvp", "RSVP"]] as const;
  return (
    <>
      <nav className={styles.navigation} aria-label={language === "en" ? "Invitation navigation" : "Navigasi undangan"}>
        <a href={resolveAppUrl("/invitation#touch")} className={styles.navigationMark} aria-label="Amara and Daniel, beginning"><Monogram /></a>
        <div className={styles.navigationLinks}>{links.map(([id, label]) => <a href={resolveAppUrl(`/invitation#${id}`)} key={id}>{label}</a>)}</div>
        <button type="button" onClick={() => setLanguage(language === "en" ? "id" : "en")} aria-label={language === "en" ? "Switch to Indonesian" : "Ganti ke bahasa Inggris"}>{language === "en" ? "ID" : "EN"}</button>
      </nav>
      <div className={styles.progress} aria-hidden="true"><i style={{ transform: `scaleY(${(active + 1) / invitation.chapters.length})` }} /><b>{String(active + 1).padStart(2, "0")}</b><em>{invitation.chapters[active]?.label[language]}</em></div>
    </>
  );
}

function useCountdown() {
  const target = useMemo(() => new Date(invitation.date).getTime(), []);
  const calculate = () => {
    const remaining = Math.max(0, target - Date.now());
    return { days: Math.floor(remaining / 86_400_000), hours: Math.floor((remaining / 3_600_000) % 24), minutes: Math.floor((remaining / 60_000) % 60), seconds: Math.floor((remaining / 1_000) % 60) };
  };
  const [value, setValue] = useState(calculate);
  useEffect(() => {
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, target - Date.now());
      setValue({ days: Math.floor(remaining / 86_400_000), hours: Math.floor((remaining / 3_600_000) % 24), minutes: Math.floor((remaining / 60_000) % 60), seconds: Math.floor((remaining / 1_000) % 60) });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [target]);
  return value;
}

function CountdownValue({ value, label }: { value: number; label: string }) {
  const formatted = String(value).padStart(2, "0");
  const numberRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (motionIsReduced()) return;
    numberRef.current?.animate(
      [
        { opacity: 0.1, filter: "blur(7px)", transform: "translateY(92%) rotateX(-62deg)" },
        { opacity: 1, filter: "blur(0)", transform: "translateY(0) rotateX(0)" },
      ],
      { duration: 620, easing: "cubic-bezier(.16,.78,.2,1)", fill: "both" },
    );
  }, [formatted]);
  return (
    <span className={styles.countdownUnit}>
      <span className={styles.numberWindow} aria-live={label.includes("second") || label === "detik" ? "off" : "polite"}>
        <b ref={numberRef}>{formatted}</b>
      </span>
      <small>{label}</small>
    </span>
  );
}

function useInvitationMotion(rootRef: React.RefObject<HTMLDivElement | null>, setActive: (value: number) => void) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (motionIsReduced()) {
      const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.chapter ?? 0)); }), { rootMargin: "-35% 0px -55%" });
      root.querySelectorAll("[data-chapter]").forEach((node) => observer.observe(node));
      return () => observer.disconnect();
    }
    let disposed = false;
    let context: { revert: () => void } | undefined;
    void import("../lib/motion").then(({ gsap, ScrollTrigger }) => {
      if (disposed) return;
      context = gsap.context(() => {
        root.querySelectorAll<HTMLElement>("[data-chapter]").forEach((section) => {
          const index = Number(section.dataset.chapter ?? 0);
          ScrollTrigger.create({ trigger: section, start: "top 53%", end: "bottom 53%", onEnter: () => setActive(index), onEnterBack: () => setActive(index) });
        });

        gsap.timeline({ scrollTrigger: { trigger: `.${styles.opening}`, start: "top top", end: "bottom bottom", scrub: 0.18 } })
          .to(`.${styles.touchWords}`, { clipPath: "inset(0 0 100% 0)", yPercent: -18, ease: "power2.in" }, 0.08)
          .fromTo(`.${styles.chapelScene}`, { clipPath: "inset(100% 0 0 0)", autoAlpha: 0 }, { clipPath: "inset(0% 0 0 0)", autoAlpha: 1, ease: "power2.inOut" }, 0.28)
          .fromTo(`.${styles.chapelWords}`, { clipPath: "inset(0 100% 0 0)", xPercent: -4 }, { clipPath: "inset(0 0% 0 0)", xPercent: 0, ease: "power3.out" }, 0.56)
          .fromTo(`.${styles.receptionWords}`, { autoAlpha: 0, yPercent: 10 }, { autoAlpha: 1, yPercent: 0, ease: "power2.out" }, 0.76);

        gsap.fromTo(`.${styles.storyPortrait}`, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0)", ease: "power3.inOut", scrollTrigger: { trigger: `.${styles.storyPortrait}`, start: "top 88%", end: "top 38%", scrub: 0.25 } });
        root.querySelectorAll<HTMLElement>(`.${styles.storyMoment}`).forEach((item) => {
          gsap.fromTo(item, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0)", ease: "power3.out", scrollTrigger: { trigger: item, start: "top 78%", end: "top 50%", scrub: 0.2 } });
        });

        gsap.fromTo(`.${styles.ribbonPath}`, { strokeDasharray: 2400, strokeDashoffset: 2400 }, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: `.${styles.schedule}`, start: "top 72%", end: "bottom 82%", scrub: true } });
        root.querySelectorAll<HTMLElement>(`.${styles.scheduleMoment}`).forEach((item) => {
          gsap.fromTo(item.querySelectorAll("path,circle,ellipse"), { strokeDasharray: 500, strokeDashoffset: 500 }, { strokeDashoffset: 0, duration: 1, ease: "power2.out", scrollTrigger: { trigger: item, start: "top 72%", toggleActions: "play none none reverse" } });
        });
        gsap.fromTo(`.${styles.closingWords}`, { clipPath: "inset(48% 0 48% 0)" }, { clipPath: "inset(0)", ease: "power3.inOut", scrollTrigger: { trigger: `.${styles.closing}`, start: "top 72%", end: "top 22%", scrub: 0.25 } });
        ScrollTrigger.refresh();
      }, root);
    });
    return () => { disposed = true; context?.revert(); };
  }, [rootRef, setActive]);
}

function Opening() {
  const { language } = useLanguage();
  const ceremony = invitation.events[0];
  const reception = invitation.events[1];
  const map = (address: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  return (
    <section className={styles.opening} id="touch" data-chapter="0" aria-labelledby="touch-title">
      <div className={styles.openingSticky}>
        <CinematicLight className={styles.lightCanvas} scene="opening" />
        <div className={styles.touchWords}>
          <p>{language === "en" ? "The wedding of" : "Pernikahan"}</p>
          <h1 id="touch-title" data-route-heading><span>Amara</span><i>&amp;</i><span>Daniel</span></h1>
          <div><time dateTime="2026-11-14">14 November 2026</time><p>{invitation.invitationLine[language]}</p></div>
        </div>
        <div id="place" data-chapter="1" className={styles.placeAnchor} />
        <div className={styles.chapelScene}>
          <Photograph media={invitation.media.chapel} className={styles.chapelPhoto} />
          <div className={styles.chapelShade} aria-hidden="true" />
          <div className={styles.chapelWords}>
            <Kicker number="02">{ceremony.name[language]}</Kicker>
            <h2>{ceremony.venue}</h2>
            <p>{ceremony.time[language]}<br />{ceremony.address[language]}</p>
            <p className={styles.quiet}>{ceremony.note[language]}</p>
            <a href={map(ceremony.address.en)} target="_blank" rel="noreferrer">{language === "en" ? "Open map" : "Buka peta"} ↗</a>
          </div>
          <div className={styles.receptionWords}>
            <Kicker number="02 / II">{reception.name[language]}</Kicker>
            <h3>{reception.venue}</h3>
            <p>{reception.time[language]}<br />{reception.address[language]}</p>
            <a href={map(reception.address.en)} target="_blank" rel="noreferrer">{language === "en" ? "Open map" : "Buka peta"} ↗</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Anticipation() {
  const { language } = useLanguage();
  const countdown = useCountdown();
  const values = [[countdown.days, language === "en" ? "days" : "hari"], [countdown.hours, language === "en" ? "hours" : "jam"], [countdown.minutes, language === "en" ? "minutes" : "menit"], [countdown.seconds, language === "en" ? "seconds" : "detik"]] as const;
  return (
    <section className={styles.anticipation} id="anticipation" data-chapter="2" aria-labelledby="anticipation-title">
      <CinematicLight className={styles.lightCanvas} scene="countdown" />
      <div className={styles.dateLockup}><span>14</span><h2 id="anticipation-title">November</h2><span>2026</span></div>
      <div className={styles.countdown}><p>{language === "en" ? "Until we gather" : "Sampai kita berkumpul"}</p><div>{values.map(([value, label]) => <CountdownValue key={label} value={value} label={label} />)}</div></div>
    </section>
  );
}

function Story() {
  const { language } = useLanguage();
  return (
    <section className={styles.story} id="story" data-chapter="3" aria-labelledby="story-title">
      <header className={styles.storyHeading}><Kicker number="04">{invitation.story.label[language]}</Kicker><h2 id="story-title">{language === "en" ? <>Three moments.<br /><i>One direction.</i></> : <>Tiga momen.<br /><i>Satu arah.</i></>}</h2></header>
      <Photograph media={invitation.media.couplePortrait} className={styles.storyPortrait} />
      <blockquote className={styles.storyWhisper}>{language === "en" ? "Not a chronology. Just the moments that kept returning." : "Bukan kronologi. Hanya momen-momen yang terus kembali."}</blockquote>
      <div className={styles.storyMoments}>{invitation.story.moments.map((moment, index) => <article className={styles.storyMoment} key={moment.year}><span className={styles.storyYear}>{moment.year}</span><span className={styles.storyIndex}>0{index + 1}</span><div><h3>{moment.title[language]}</h3><p>{moment.copy[language]}</p></div></article>)}</div>
    </section>
  );
}

function ScheduleDrawing({ motif }: { motif: ScheduleMotif }) {
  const common = { fill: "none", vectorEffect: "non-scaling-stroke" as const };
  const drawings: Record<ScheduleMotif, ReactNode> = {
    arrival: <><path {...common} d="M22 91V28h76v63M34 91V42h52v49M50 91V58h20v33" /><path {...common} d="M16 91h88" /></>,
    chapel: <><path {...common} d="M17 91h86M28 91V47l32-27 32 27v44M48 91V62h24v29" /><path {...common} d="M60 20V8m-7 7h14" /></>,
    courtyard: <><path {...common} d="M20 88c10-25 21-40 40-58 18 17 30 33 40 58M35 88c7-17 14-28 25-38 11 10 19 22 25 38" /><circle {...common} cx="60" cy="41" r="6" /></>,
    glasshouse: <><path {...common} d="M15 91h90M24 91V47l36-28 36 28v44M60 20v71M24 47h72" /><path {...common} d="M42 91V63h36v28" /></>,
    dinner: <><ellipse {...common} cx="60" cy="65" rx="34" ry="22" /><ellipse {...common} cx="60" cy="65" rx="20" ry="12" /><path {...common} d="M19 32v55m8-55v55M93 32v55" /></>,
    toast: <><path {...common} d="M34 20h24l-3 29c-1 9-5 13-9 14v25m-12 0h24M62 20h24l-3 29c-1 9-5 13-9 14v25m-12 0h24" /></>,
    dance: <><path {...common} d="M21 80c14-6 20-18 31-43 6-15 19-17 24-5 5 11-3 22-16 19-19-4-30 12-21 27 8 14 31 13 54-2" /></>,
    moon: <><path {...common} d="M74 18c-25 8-31 39-12 55 12 10 29 7 39-3-5 17-21 29-40 26-24-4-40-27-34-50 5-18 25-31 47-28Z" /></>,
  };
  return <svg viewBox="0 0 120 110" aria-hidden="true">{drawings[motif]}</svg>;
}

function Schedule() {
  const { language } = useLanguage();
  return (
    <section className={styles.schedule} id="day" data-chapter="4" aria-labelledby="day-title">
      <header><Kicker number="05">{language === "en" ? "The celebration" : "Perayaan"}</Kicker><h2 id="day-title">{language === "en" ? <>The day,<br /><i>in order</i></> : <>Hari itu,<br /><i>berurutan</i></>}</h2></header>
      <svg className={styles.ribbon} viewBox="0 0 160 1600" preserveAspectRatio="none" aria-hidden="true"><defs><filter id="ribbon-glow"><feGaussianBlur stdDeviation="5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs><path className={styles.ribbonPath} filter="url(#ribbon-glow)" d="M82 0C36 128 128 226 76 348S34 560 86 680s39 213-8 332-40 210 7 318 19 189-3 270" /></svg>
      <ol className={styles.scheduleList}>{invitation.schedule.map((item, index) => <li className={styles.scheduleMoment} key={item.time}><div><ScheduleDrawing motif={item.motif} /></div><span>{String(index + 1).padStart(2, "0")}</span><time>{item.time}</time><h3>{item.what[language]}</h3><p>{item.context[language]}</p></li>)}</ol>
    </section>
  );
}

function Details() {
  const { language } = useLanguage();
  const [open, setOpen] = useState(0);
  const all = [{ q: invitation.attire.title, a: invitation.attire.body }, { q: invitation.gifts.title, a: invitation.gifts.body }, ...invitation.questions];
  const calendar = `data:text/calendar;charset=utf-8,${encodeURIComponent(calendarFile(language))}`;
  return (
    <section className={styles.details} id="details" data-chapter="5" aria-labelledby="details-title">
      <Photograph media={invitation.media.coupleDetail} className={styles.detailsPhoto} />
      <div className={styles.detailsShade} aria-hidden="true" />
      <div className={styles.detailsIntro}><Kicker number="06">{language === "en" ? "Before you come" : "Sebelum datang"}</Kicker><h2 id="details-title">{language === "en" ? <>Everything you<br /><i>might need</i> to know.</> : <>Semua yang<br /><i>perlu diketahui.</i></>}</h2><a href={calendar} download="amara-daniel.ics">{language === "en" ? "Save the date" : "Simpan tanggal"} ↓</a></div>
      <div className={styles.detailsSheet}>
        <div className={styles.palette} role="img" aria-label={language === "en" ? "Suggested attire palette" : "Palet busana yang disarankan"}>{invitation.attire.palette.map((color) => <i key={color} style={{ backgroundColor: color }} />)}</div>
        <div className={styles.accordion}>{all.map((question, index) => <article key={question.q.en}><h3><button type="button" onClick={() => setOpen(open === index ? -1 : index)} aria-expanded={open === index} aria-controls={`detail-answer-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><strong>{question.q[language]}</strong><i aria-hidden="true">{open === index ? "−" : "+"}</i></button></h3><div className={styles.answer} data-open={open === index} id={`detail-answer-${index}`}><div><p>{question.a[language]}</p></div></div></article>)}</div>
      </div>
    </section>
  );
}

function GuidedRsvp() {
  const { language } = useLanguage();
  const [reply, setReply] = useState(EMPTY_REPLY);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const change = <K extends keyof Reply>(key: K, value: Reply[K]) => setReply((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (step === 0 && !reply.name.trim()) return setError(language === "en" ? "Please enter your name." : "Masukkan nama Anda.");
    if (step === 1 && !reply.attending) return setError(language === "en" ? "Please choose a reply." : "Pilih jawaban Anda.");
    setError("");
    if (step < 3) setStep((current) => current + 1); else setComplete(true);
  };
  return (
    <section className={styles.rsvp} id="rsvp" data-chapter="6" aria-labelledby="rsvp-title">
      <div className={styles.rsvpHeading}><Kicker number="07">{language === "en" ? "Your reply" : "Jawaban Anda"}</Kicker><h2 id="rsvp-title">{language === "en" ? <>Will you<br /><i>join us?</i></> : <>Maukah Anda<br /><i>hadir?</i></>}</h2><p>{invitation.rsvp.deadline[language]}</p></div>
      <div className={styles.replyPaper} data-complete={complete}>
        {complete ? <div className={styles.complete} role="status"><Monogram /><span>{language === "en" ? "Thank you." : "Terima kasih."}</span><p>{reply.attending === "yes" ? (language === "en" ? "We look forward to celebrating with you." : "Kami menantikan perayaan bersama Anda.") : (language === "en" ? "You will be missed." : "Kami akan merindukan Anda.")}</p><small>{language === "en" ? "This preview stores no personal data." : "Pratinjau ini tidak menyimpan data pribadi."}</small></div> : <form onSubmit={submit} noValidate><p className={styles.formProgress}>{String(step + 1).padStart(2, "0")} / 04</p><fieldset key={step}>
          {step === 0 && <label className={styles.field}><span>{language === "en" ? "Your name" : "Nama Anda"}</span><input value={reply.name} onChange={(event) => change("name", event.target.value)} autoComplete="name" /></label>}
          {step === 1 && <div className={styles.choices}><label data-selected={reply.attending === "yes"}><input type="radio" name="attending" checked={reply.attending === "yes"} onChange={() => change("attending", "yes")} /><span>{invitation.rsvp.accepting[language]}</span></label><label data-selected={reply.attending === "no"}><input type="radio" name="attending" checked={reply.attending === "no"} onChange={() => change("attending", "no")} /><span>{invitation.rsvp.declining[language]}</span></label></div>}
          {step === 2 && reply.attending === "yes" && <div className={styles.fieldPair}><label className={styles.field}><span>{language === "en" ? "Number attending" : "Jumlah hadir"}</span><select value={reply.guests} onChange={(event) => change("guests", event.target.value)}><option value="1">1</option><option value="2">2</option></select></label><label className={styles.field}><span>{language === "en" ? "Dietary needs" : "Kebutuhan makanan"}</span><input value={reply.dietary} onChange={(event) => change("dietary", event.target.value)} /></label></div>}
          {step === 2 && reply.attending === "no" && <label className={styles.field}><span>{language === "en" ? "A note for Amara & Daniel" : "Pesan untuk Amara & Daniel"}</span><textarea value={reply.note} onChange={(event) => change("note", event.target.value)} /></label>}
          {step === 3 && reply.attending === "yes" && <label className={styles.field}><span>{language === "en" ? "A note for Amara & Daniel" : "Pesan untuk Amara & Daniel"}</span><textarea value={reply.note} onChange={(event) => change("note", event.target.value)} /></label>}
          {step === 3 && reply.attending === "no" && <div className={styles.replySummary}><span>{reply.name}</span><p>{invitation.rsvp.declining[language]}</p>{reply.note && <blockquote>“{reply.note}”</blockquote>}</div>}
        </fieldset><p className={styles.formError} role="alert">{error}</p><div className={styles.formActions}>{step > 0 ? <button type="button" onClick={() => { setError(""); setStep((current) => current - 1); }}>{language === "en" ? "Back" : "Kembali"}</button> : <span />}<button type="submit">{step === 3 ? (language === "en" ? "Send our reply" : "Kirim jawaban") : (language === "en" ? "Continue" : "Lanjut")} <span>→</span></button></div></form>}
      </div>
    </section>
  );
}

function Closing() {
  const { language } = useLanguage();
  return (
    <footer className={styles.closing} id="closing" data-chapter="7">
      <CinematicLight className={styles.closingLight} tone="ember" scene="closing" />
      <div className={styles.closingWords}><Monogram /><p>14 · 11 · 2026</p><h2>Amara <i>&amp;</i> Daniel</h2><blockquote>{invitation.closing[language]}</blockquote><div><a href={resolveAppUrl("/invitation#touch")}>{language === "en" ? "Back to the beginning" : "Kembali ke awal"} ↑</a><a href={resolveAppUrl("/")}>{language === "en" ? "House Adel home" : "Beranda House Adel"} ↗</a></div></div>
    </footer>
  );
}

export function InvitationPage() {
  const [entered, setEntered] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  useInvitationMotion(rootRef, setActive);
  return (
    <div className={styles.page} ref={rootRef}>
      {!entered && <Entrance onEnter={() => setEntered(true)} />}
      <a className={styles.skip} href={resolveAppUrl("/invitation#story")}>Skip invitation opening</a>
      <InvitationNavigation active={active} />
      <main><Opening /><Anticipation /><Story /><Schedule /><Details /><GuidedRsvp /></main>
      <Closing />
    </div>
  );
}
