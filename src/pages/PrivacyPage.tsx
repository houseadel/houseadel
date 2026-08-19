import type { ReactNode } from "react";
import { useLanguage } from "../context/LanguageContext";
import { studioContacts } from "../config/studioContacts";
import { InkText } from "../components/motion/InkText";
import { LegalNav } from "../components/legal/LegalNav";
import { Link } from "../lib/router";
import styles from "./LegalDocument.module.css";

/**
 * What actually happens to an enquiry, written down.
 *
 * The page this replaces was two sentences. They were true, and they were not a
 * privacy policy: they did not say where an enquiry goes, who else handles it on
 * the way, how long it is kept, or how to ask for it back. Someone deciding
 * whether to describe their wedding to a studio they have not met deserves the
 * actual answer.
 *
 * Everything here is checked against the code that runs. The field list is the
 * form's field list; the hidden values are the ones `createCommissionPayload`
 * actually sends. It claims no analytics because there are none, no cookies
 * because none are set, and no sale of anything because nothing is sold.
 *
 * **Where it stops short of naming names.** The enquiry record is described by
 * what it is and what is done with it rather than by which vendor holds it. A
 * reader is owed the substance — that a processor exists, that it acts only on
 * the studio's instructions, that it may not use their enquiry for its own ends
 * — and naming the product adds nothing to that while publishing the shape of
 * the studio's own back office. Anyone who wants the name is invited to ask for
 * it, which is the part that keeps this honest rather than merely quiet.
 *
 * What it deliberately does not do is take permission to publish anyone's
 * project. An enquiry is not a licence. It does not go on to *grant* one
 * either: publicity for actual commissions is clause 12 of the Terms, and a
 * privacy notice that also legislated it would be a second, quieter contract
 * saying something slightly different — which is exactly what this page used to
 * do, promising a written agreement the Terms do not require.
 */

type Section = { id: string; title: string; body: ReactNode };

export function PrivacyPage() {
  const { language } = useLanguage();
  const isEnglish = language === "en";
  const email = (
    <a href={studioContacts.email.href}>{studioContacts.email.value}</a>
  );

  const sections: Section[] = isEnglish
    ? [
        {
          id: "what",
          title: "What we collect",
          body: (
            <>
              <p>
                Only what you type into the enquiry form, and a few technical values the form
                sends with it so that we can tell one submission from another.
              </p>
              <p>What you write:</p>
              <ul>
                <li>Your name.</li>
                <li>
                  One contact detail you choose: a WhatsApp number, an Instagram handle, or an
                  email address.
                </li>
                <li>What you are planning, and the date if you know it.</li>
                <li>What the website should help people do.</li>
                <li>Something that belongs to the project, and anything else you add.</li>
                <li>Any reference links you share.</li>
              </ul>
              <p>What the form adds:</p>
              <ul>
                <li>A reference number for the enquiry, so it can be found and answered.</li>
                <li>
                  The time you opened the form and the time you sent it. These are compared only
                  to filter out automated submissions.
                </li>
                <li>
                  The version of the site the enquiry came from, which tells us how it was
                  formatted.
                </li>
              </ul>
              <p>
                There is one hidden field on the form that should always be empty. It is a spam
                trap. If it is filled in, the submission is refused.
              </p>
              <p className={styles.term}>
                We do not ask for and do not want guest lists, identification documents, payment
                details or private event information at this stage. Please do not send them.
              </p>
            </>
          ),
        },
        {
          id: "why",
          title: "Why we collect it",
          body: (
            <>
              <p>
                To read your enquiry, understand the project, work out whether House Adel is right
                for it, and reply to you using the contact detail you gave.
              </p>
              <p>
                Where an enquiry becomes a commission, the same information also becomes part of
                the ordinary business record for that project. The timing values and the spam trap
                described above are used for one thing only: keeping the form from being abused.
              </p>
              <p>
                We do not use any of it to build an advertising profile of you, and sending the
                form does not sign you up to anything. You will not be marketed to because you
                made an enquiry.
              </p>
            </>
          ),
        },
        {
          id: "where",
          title: "Where it goes",
          body: (
            <>
              <p>
                Submitting the form sends your enquiry to a private record kept by House Adel,
                where it is held so that it can be read and answered.
              </p>
              <p>
                Google services are used as third-party infrastructure to receive and hold that
                record on House Adel's behalf. Cloudflare and Brevo handle limited information
                where it is needed to run this website and the studio's email — delivering a
                message you send to our address, for instance.
              </p>
              <p>
                Each of them acts on House Adel's instructions as a service provider. None of them
                is permitted to use your enquiry for its own purposes.
              </p>
              <p>
                Nothing is stored in your browser as part of sending an enquiry, and nothing about
                your enquiry is stored on this website.
              </p>
            </>
          ),
        },
        {
          id: "sharing",
          title: "Who else sees it",
          body: (
            <p>
              House Adel, and the providers described above, acting on our instructions. We do not
              sell personal information, we do not share it with advertisers, and we do not pass it
              to anyone else unless we are legally required to.
            </p>
          ),
        },
        {
          id: "keeping",
          title: "How long we keep it",
          body: (
            <>
              <p>
                An enquiry that does not become a project is removed once there is no longer a
                reasonable need to keep it, unless there is a legitimate legal, security or
                record-keeping reason to hold it for longer.
              </p>
              <p>
                An enquiry that does become a project stops being only an enquiry. It becomes part
                of the business record for that commission, and those records are kept for as long
                as contractual, accounting, tax and project-history purposes require.
              </p>
              <p>
                You can ask us to remove an enquiry sooner, and we will, subject to those same
                obligations. What we will not claim is that deletion is instantaneous everywhere:
                routine backups held by the providers above age out on their own schedule rather
                than on request.
              </p>
              <p>
                Reference numbers of recent submissions are held separately for a short period so
                that a resent enquiry is not recorded twice. They contain nothing you wrote.
              </p>
            </>
          ),
        },
        {
          id: "rights",
          title: "Asking for your information",
          body: (
            <>
              <p>
                Write to {email} and we will act on it. You can ask us to send you a copy of what
                you submitted, correct something you got wrong, or delete the enquiry entirely.
              </p>
              <p>
                Please include the reference number shown when you submitted, if you still have
                it. It makes finding your enquiry immediate. If you do not have it, the contact
                detail you used is usually enough.
              </p>
            </>
          ),
        },
        {
          id: "cookies",
          title: "Cookies and analytics",
          body: (
            <>
              <p>
                This site sets no cookies and runs no analytics. There is no tracking pixel, no
                advertising tag, and no third-party measurement of any kind. House Adel does not
                operate visitor-behaviour analytics and does not do advertising tracking.
              </p>
              <p>
                That is a statement about what House Adel does, not a claim that the internet is
                unobserved. The companies that host this site and carry its email keep their own
                operational records, as any such provider does. We do not use them to study
                visitors.
              </p>
              <p>
                Your browser does keep three small preferences on this device so the site behaves
                the way you left it: your language choice, whether you asked for the simplified
                graphics mode, and whether the opening has already played this session. They stay
                on your device, they are never sent anywhere, and clearing your browser storage
                removes them.
              </p>
            </>
          ),
        },
        {
          id: "international",
          title: "Where in the world it is handled",
          body: (
            <p>
              House Adel works from Indonesia, and the providers above are global services. Your
              enquiry may therefore be processed or stored on systems in a country other than your
              own. Where that happens it is because it is necessary to receive your enquiry and
              answer it, and the same protections described on this page apply wherever it is held.
            </p>
          ),
        },
        {
          id: "portfolio",
          title: "Showing work",
          body: (
            <>
              <p>
                Submitting an enquiry does not give House Adel permission to publish your name,
                your brand, your photographs, your event or your project. Making contact is not a
                licence to show anything, and nothing here asks you for one.
              </p>
              <p>
                If an enquiry becomes a commission, whether and how the finished work may be shown
                is governed by the{" "}
                <Link to="/terms" data-sonic>
                  Terms
                </Link>{" "}
                and by your project agreement rather than by this policy. Private-event websites
                are not ordinarily linked publicly, private guest and contact information is never
                published for portfolio purposes, and confidentiality can be agreed for a project
                — ask for it and it will be.
              </p>
            </>
          ),
        },
        {
          id: "contact",
          title: "Questions",
          body: <p>Any privacy question can go to {email}.</p>,
        },
      ]
    : [
        {
          id: "what",
          title: "Yang kami kumpulkan",
          body: (
            <>
              <p>
                Hanya yang Anda tulis pada formulir pertanyaan, beserta beberapa nilai teknis yang
                dikirim bersamanya agar kami dapat membedakan satu pengiriman dari yang lain.
              </p>
              <p>Yang Anda tulis:</p>
              <ul>
                <li>Nama Anda.</li>
                <li>
                  Satu kontak yang Anda pilih: nomor WhatsApp, nama pengguna Instagram, atau
                  alamat email.
                </li>
                <li>Apa yang Anda rencanakan, dan tanggalnya jika sudah ada.</li>
                <li>Apa yang seharusnya dibantu oleh situs tersebut.</li>
                <li>Sesuatu yang menjadi bagian dari proyek ini, dan hal lain yang Anda tambahkan.</li>
                <li>Tautan referensi yang Anda bagikan.</li>
              </ul>
              <p>Yang ditambahkan formulir:</p>
              <ul>
                <li>Nomor referensi pertanyaan, agar dapat ditemukan dan dijawab.</li>
                <li>
                  Waktu Anda membuka formulir dan waktu Anda mengirimnya. Keduanya hanya
                  dibandingkan untuk menyaring pengiriman otomatis.
                </li>
                <li>Versi situs tempat pertanyaan dikirim, yang menunjukkan format pengirimannya.</li>
              </ul>
              <p>
                Ada satu bidang tersembunyi pada formulir yang seharusnya selalu kosong. Itu
                perangkap spam. Jika terisi, pengiriman ditolak.
              </p>
              <p className={styles.term}>
                Kami tidak meminta dan tidak menginginkan daftar tamu, dokumen identitas, rincian
                pembayaran, atau informasi acara privat pada tahap ini. Mohon jangan mengirimkannya.
              </p>
            </>
          ),
        },
        {
          id: "why",
          title: "Mengapa kami mengumpulkannya",
          body: (
            <>
              <p>
                Untuk membaca pertanyaan Anda, memahami proyeknya, menimbang apakah House Adel
                tepat untuknya, dan membalas Anda melalui kontak yang Anda berikan.
              </p>
              <p>
                Jika sebuah pertanyaan berlanjut menjadi komisi, informasi yang sama juga menjadi
                bagian dari catatan bisnis biasa untuk proyek itu. Nilai waktu dan perangkap spam
                yang dijelaskan di atas hanya dipakai untuk satu hal: menjaga formulir dari
                penyalahgunaan.
              </p>
              <p>
                Kami tidak menggunakannya untuk menyusun profil iklan tentang Anda, dan mengirim
                formulir tidak mendaftarkan Anda ke apa pun. Anda tidak akan dikirimi pemasaran
                hanya karena Anda mengirim pertanyaan.
              </p>
            </>
          ),
        },
        {
          id: "where",
          title: "Ke mana perginya",
          body: (
            <>
              <p>
                Saat Anda mengirim formulir, pertanyaan Anda masuk ke catatan privat milik House
                Adel, tempat ia disimpan agar dapat dibaca dan dijawab.
              </p>
              <p>
                Layanan Google digunakan sebagai infrastruktur pihak ketiga untuk menerima dan
                menyimpan catatan itu atas nama House Adel. Cloudflare dan Brevo menangani
                informasi terbatas jika diperlukan untuk menjalankan situs ini dan surel studio —
                misalnya mengantarkan pesan yang Anda kirim ke alamat kami.
              </p>
              <p>
                Masing-masing bertindak berdasarkan instruksi House Adel sebagai penyedia layanan.
                Tidak satu pun diperkenankan menggunakan pertanyaan Anda untuk kepentingannya
                sendiri.
              </p>
              <p>
                Tidak ada yang disimpan di peramban Anda sebagai bagian dari pengiriman, dan tidak
                ada data pertanyaan Anda yang disimpan di situs ini.
              </p>
            </>
          ),
        },
        {
          id: "sharing",
          title: "Siapa lagi yang melihatnya",
          body: (
            <p>
              House Adel, dan para penyedia yang dijelaskan di atas, berdasarkan instruksi kami.
              Kami tidak menjual informasi pribadi, tidak membagikannya kepada pengiklan, dan tidak
              menyerahkannya kepada siapa pun kecuali diwajibkan secara hukum.
            </p>
          ),
        },
        {
          id: "keeping",
          title: "Berapa lama kami menyimpannya",
          body: (
            <>
              <p>
                Pertanyaan yang tidak berlanjut menjadi proyek dihapus begitu tidak ada lagi alasan
                wajar untuk menyimpannya, kecuali ada alasan hukum, keamanan, atau pencatatan yang
                sah untuk menahannya lebih lama.
              </p>
              <p>
                Pertanyaan yang berlanjut menjadi proyek tidak lagi sekadar pertanyaan. Ia menjadi
                bagian dari catatan bisnis untuk komisi itu, dan catatan tersebut disimpan selama
                diperlukan untuk keperluan kontrak, akuntansi, pajak, dan riwayat proyek.
              </p>
              <p>
                Anda dapat meminta kami menghapus sebuah pertanyaan lebih awal, dan kami akan
                melakukannya, dengan tunduk pada kewajiban yang sama. Yang tidak akan kami klaim
                adalah bahwa penghapusan terjadi seketika di mana-mana: cadangan rutin yang
                dipegang penyedia di atas kedaluwarsa menurut jadwalnya sendiri, bukan atas
                permintaan.
              </p>
              <p>
                Nomor referensi pengiriman terbaru disimpan terpisah untuk waktu singkat agar
                pertanyaan yang terkirim ulang tidak tercatat dua kali. Nomor itu tidak memuat apa
                pun yang Anda tulis.
              </p>
            </>
          ),
        },
        {
          id: "rights",
          title: "Meminta informasi Anda",
          body: (
            <>
              <p>
                Kirim surat ke {email} dan kami akan menindaklanjutinya. Anda dapat meminta salinan
                dari apa yang Anda kirim, memperbaiki hal yang keliru, atau menghapus pertanyaan
                itu sepenuhnya.
              </p>
              <p>
                Mohon sertakan nomor referensi yang ditampilkan saat Anda mengirim, jika Anda masih
                menyimpannya. Itu membuat pencarian menjadi seketika. Jika tidak ada, kontak yang
                Anda gunakan biasanya sudah cukup.
              </p>
            </>
          ),
        },
        {
          id: "cookies",
          title: "Kuki dan analitik",
          body: (
            <>
              <p>
                Situs ini tidak menyetel kuki dan tidak menjalankan analitik. Tidak ada piksel
                pelacak, tidak ada tag iklan, dan tidak ada pengukuran pihak ketiga dalam bentuk
                apa pun. House Adel tidak menjalankan analitik perilaku pengunjung dan tidak
                melakukan pelacakan iklan.
              </p>
              <p>
                Itu pernyataan tentang apa yang House Adel lakukan, bukan klaim bahwa internet
                tidak terpantau. Perusahaan yang menghosting situs ini dan membawa surelnya
                menyimpan catatan operasional mereka sendiri, sebagaimana penyedia mana pun. Kami
                tidak menggunakannya untuk mempelajari pengunjung.
              </p>
              <p>
                Peramban Anda memang menyimpan tiga preferensi kecil di perangkat ini agar situs
                tetap seperti yang Anda tinggalkan: pilihan bahasa, apakah Anda meminta mode grafis
                sederhana, dan apakah pembuka sudah berjalan pada sesi ini. Semuanya tetap di
                perangkat Anda, tidak pernah dikirim ke mana pun, dan hilang saat Anda membersihkan
                penyimpanan peramban.
              </p>
            </>
          ),
        },
        {
          id: "international",
          title: "Di mana informasi ini ditangani",
          body: (
            <p>
              House Adel bekerja dari Indonesia, dan penyedia yang disebut di atas adalah layanan
              global. Karena itu pertanyaan Anda dapat diproses atau disimpan pada sistem di negara
              selain negara Anda. Hal itu terjadi karena diperlukan untuk menerima dan menjawab
              pertanyaan Anda, dan perlindungan yang dijelaskan di halaman ini tetap berlaku di
              mana pun informasi itu disimpan.
            </p>
          ),
        },
        {
          id: "portfolio",
          title: "Menampilkan karya",
          body: (
            <>
              <p>
                Mengirim pertanyaan tidak memberi House Adel izin untuk menampilkan nama Anda,
                merek Anda, foto Anda, acara Anda, atau proyek Anda. Menghubungi kami bukan
                pemberian lisensi untuk menampilkan apa pun, dan tidak ada di sini yang memintanya.
              </p>
              <p>
                Jika sebuah pertanyaan berlanjut menjadi komisi, apakah dan bagaimana karya yang
                selesai dapat ditampilkan diatur oleh{" "}
                <Link to="/terms" data-sonic>
                  Ketentuan
                </Link>{" "}
                dan perjanjian proyek Anda, bukan oleh kebijakan ini. Situs acara privat tidak
                ditautkan secara publik dalam keadaan biasa, informasi tamu dan kontak privat tidak
                pernah dipublikasikan untuk keperluan portofolio, dan kerahasiaan dapat disepakati
                untuk sebuah proyek — mintalah, dan itu akan diberikan.
              </p>
            </>
          ),
        },
        {
          id: "contact",
          title: "Pertanyaan",
          body: <p>Pertanyaan tentang privasi dapat dikirim ke {email}.</p>,
        },
      ];

  return (
    <div className={`${styles.page} page-frame`}>
      <InkText as="h1" id="privacy-title" className={styles.heading}>
        {isEnglish ? "What happens to what you send us." : "Apa yang terjadi pada yang Anda kirim."}
      </InkText>
      <p className={styles.updated}>
        {isEnglish ? "Last updated 18 August 2026" : "Terakhir diperbarui 18 Agustus 2026"}
      </p>
      <p className={styles.lede}>
        {isEnglish
          ? "House Adel collects information through one form on this website, the enquiry form, and uses it to read and answer your enquiry."
          : "House Adel mengumpulkan informasi melalui satu formulir di situs ini, formulir pertanyaan, dan menggunakannya untuk membaca dan menjawab pertanyaan Anda."}
      </p>

      <div className={styles.document}>
        <LegalNav
          label={isEnglish ? "Contents" : "Daftar isi"}
          items={sections.map(({ id, title }) => ({ id, title }))}
          anchorPrefix="privacy"
          sibling={{
            to: "/terms",
            label: isEnglish ? "Terms" : "Ketentuan",
            description: isEnglish
              ? "What a commission commits us both to: scope, fees, revisions, ownership and cancellation."
              : "Apa yang mengikat kami dan Anda dalam sebuah komisi: lingkup, biaya, revisi, kepemilikan, dan pembatalan.",
          }}
        />
        <div className={styles.sections}>
          {sections.map((section) => (
            <section key={section.id} className={styles.section} aria-labelledby={`privacy-${section.id}`}>
              <h2 id={`privacy-${section.id}`}>{section.title}</h2>
              <div className={styles.body}>{section.body}</div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
