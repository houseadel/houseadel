import { PageIntro } from "../components/layout/PageIntro";
import { useLanguage } from "../context/LanguageContext";
import { Link } from "../lib/router";
import styles from "./ApplicationReceivedPage.module.css";

type ApplicationReceivedPageProps = {
  search?: string;
};

export function ApplicationReceivedPage({ search }: ApplicationReceivedPageProps) {
  const { language } = useLanguage();
  const id = language === "id";
  const parameters = new URLSearchParams(search ?? window.location.search);
  const isConfirmed = parameters.get("confirmed") === "1";

  if (!isConfirmed) {
    return (
      <div className={styles.page}>
        <PageIntro
          eyebrow={id ? "Status pengajuan" : "Application status"}
          title={id ? "Pengiriman belum dikonfirmasi." : "Submission not confirmed."}
          lede={id ? "Membuka alamat ini secara langsung tidak berarti pengajuan telah dikirim atau diterima oleh penyedia pengiriman." : "Opening this address directly does not mean an application was sent or accepted by a submission provider."}
        >
          <div className={styles.actions}>
            <Link className="button-link button-link--garnet" to="/commissions#application">
              {id ? "Kembali ke pengajuan" : "Return to the application"}
            </Link>
            <Link className="text-link" to="/">
              {id ? "Kembali ke beranda" : "Return home"}
            </Link>
          </div>
        </PageIntro>
        <section className={`${styles.note} page-frame`} aria-labelledby="unconfirmed-note">
          <p className="eyebrow">{id ? "Mengapa halaman ini ditampilkan" : "Why you are seeing this"}</p>
          <h2 id="unconfirmed-note">{id ? "Tanda terima hanya ditampilkan setelah respons penyedia yang nyata." : "Receipt is shown only after a real provider response."}</h2>
          <p>
            {id ? "Dalam mode lokal atau mock, pengajuan dapat ditinjau dan divalidasi tanpa dikirim. Antarmuka pengiriman akan menjelaskan keadaan tersebut, bukan mengarahkan ke sini secara menyesatkan." : "In local or mock mode, the application can be reviewed and validated without being delivered. The submit interface will identify that state rather than redirecting here deceptively."}
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageIntro
        eyebrow={id ? "Pengajuan" : "Application"}
        title={id ? "Pengajuan Anda telah diterima." : "Your application has been received."}
        lede={id ? "Kami meninjau setiap proyek secara pribadi. Jika kesempatan dan lingkupnya sesuai untuk House Adel, kami akan menghubungi Anda melalui metode pilihan Anda." : "We review every project personally. If the occasion and scope are suitable for House Adel, we will contact you using your preferred method."}
      >
        <div className={styles.actions}>
          <Link className="button-link" to="/">
            {id ? "Kembali ke House Adel" : "Return to House Adel"}
          </Link>
        </div>
      </PageIntro>
      <section className={`${styles.note} page-frame`} aria-labelledby="next-note">
        <p className="eyebrow">{id ? "Langkah selanjutnya" : "What happens next"}</p>
        <h2 id="next-note">{id ? "Brief akan dibaca secara menyeluruh." : "The brief will be read as a whole."}</h2>
        <p>
          {id ? "Tidak ada tindakan tambahan yang diperlukan di halaman ini. Simpan referensi yang dibuat penyedia dan disertakan bersama pengajuan untuk catatan Anda." : "There is no additional action required on this page. Keep any provider-generated reference included with your submission for your records."}
        </p>
      </section>
    </div>
  );
}
