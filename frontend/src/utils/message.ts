// Mengambil kalimat pembuka saja, sebelum daftar bernomor (1. 2. 3.)
// Dipakai supaya restoran hanya tampil di kartu, tidak diulang di teks
export function introOnly(text: string): string {
  const match = text.match(/^\s*\*{0,2}1[.)]\s/m);
  if (!match || match.index === undefined) return text;
  return text.slice(0, match.index).trim();
}
