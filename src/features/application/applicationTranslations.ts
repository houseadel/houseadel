import type { Language } from "../../context/LanguageContext";

const INDONESIAN_ERRORS: Readonly<Record<string, string>> = {
  "Please shorten this answer.": "Mohon persingkat jawaban ini.",
  "Enter a valid date.": "Masukkan tanggal yang valid.",
  "Enter up to six complete http or https links, one per line.":
    "Masukkan maksimal enam tautan http atau https lengkap, satu per baris.",
  "Enter a complete http or https link.": "Masukkan tautan http atau https yang lengkap.",
  "Choose an approximate guest count.": "Pilih perkiraan jumlah tamu.",
  "Choose the number of events.": "Pilih jumlah acara.",
  "Choose at least one need, or Not sure yet.":
    "Pilih setidaknya satu kebutuhan, atau Belum yakin.",
  "Choose a project path.": "Pilih jalur proyek.",
  "Choose a confidentiality preference.": "Pilih preferensi kerahasiaan.",
  "Enter a valid email address.": "Masukkan alamat email yang valid.",
  "Choose a preferred contact method.": "Pilih metode kontak yang diinginkan.",
  "Consent is required before submission.": "Persetujuan diperlukan sebelum pengiriman.",
  "Unable to submit this application.": "Pengajuan ini tidak dapat dikirim.",
  "Choose Not sure yet on its own, or select the relevant services.":
    "Pilih Belum yakin saja, atau pilih layanan yang relevan.",
  "Add a phone number for the contact method selected.":
    "Tambahkan nomor telepon untuk metode kontak yang dipilih.",
};

export function translateApplicationError(message: string, language: Language) {
  if (language === "en") return message;
  if (INDONESIAN_ERRORS[message]) return INDONESIAN_ERRORS[message];
  if (message.endsWith(" is required.")) return "Bidang ini wajib diisi.";
  if (message.endsWith(" is too long.")) return "Jawaban ini terlalu panjang.";
  return message;
}
