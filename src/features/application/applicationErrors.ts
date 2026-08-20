const ERROR_TRANSLATIONS_ID: Record<string, string> = {
  "Tell us your name.": "Ceritakan nama Anda.",
  "Choose how we should contact you.": "Pilih cara kami menghubungi Anda.",
  "Choose a valid country code.": "Pilih kode negara yang valid.",
  "Enter your WhatsApp number.": "Masukkan nomor WhatsApp Anda.",
  "Enter a valid phone number for the selected country.": "Masukkan nomor telepon yang valid untuk negara yang dipilih.",
  "Enter your Instagram username.": "Masukkan nama pengguna Instagram Anda.",
  "Enter an Instagram username or profile link.": "Masukkan nama pengguna atau tautan profil Instagram.",
  "Enter your email address.": "Masukkan alamat email Anda.",
  "Enter a valid email address.": "Masukkan alamat email yang valid.",
  "Tell us a little about what you are planning.": "Ceritakan sedikit tentang rencana Anda.",
  "Tell us what the site needs to do.": "Ceritakan apa yang perlu dilakukan situs ini.",
  "Give us one thing to begin with.": "Berikan satu hal sebagai titik awal.",
  "Enter a valid date.": "Masukkan tanggal yang valid.",
  "Use complete links beginning with http:// or https://.": "Gunakan tautan lengkap yang diawali http:// atau https://.",
  "Please shorten this answer.": "Mohon persingkat jawaban ini.",
};

export function translateApplicationError(message: string, language: "en" | "id") {
  if (language === "en") return message;
  return ERROR_TRANSLATIONS_ID[message] ?? message;
}
