import { restaurants, type MenuItem } from "../data/restaurants.js";

export type Recommendation = {
  id: number;
  name: string;
  reason: string;
  imageUrl: string | null;
  alamat: string;
  jarakKm: number;
  estimasiMenit: number;
  menu: MenuItem[];
};

const MAX_RECOMMENDATIONS = 3;

const rupiah = (value: number) => `Rp${value.toLocaleString("id-ID")}`;
const angka = (value: number) => String(value).replace(".", ",");

// Daftar restoran + aturan main yang disisipkan ke system prompt Gemini.
export function buildRestaurantContext(): string {
  const list = restaurants
    .map(
      (r) =>
        `${r.id}. ${r.nama} (${angka(r.jarakKm)} km, sekitar ${r.estimasiMenit} menit) - menu: ${r.menu
          .map((m) => `${m.nama} ${rupiah(m.harga)}`)
          .join(", ")}`,
    )
    .join("\n");

  return [
    "Daftar restoran terdekat dari posisi pengguna. Jarak dan estimasi waktu sudah dihitung, jadi JANGAN meminta lokasi pengguna dan JANGAN menyarankan aplikasi pesan antar:",
    list,
    "Aturan rekomendasi: rekomendasikan HANYA restoran dari daftar di atas, maksimal 3 per jawaban. Jangan mengarang restoran, menu, harga, atau jarak. Saat merekomendasikan, sebut nama restoran, jarak, estimasi menit, dan menu yang cocok dengan permintaan pengguna. Jika tidak ada yang cocok, katakan terus terang.",
    "Tepat sebelum baris JSON quick_replies, tambahkan satu baris terpisah berformat REKOMENDASI: [id1, id2] berisi nomor restoran yang kamu rekomendasikan di jawaban ini. Jika belum merekomendasikan apa pun (misalnya masih bertanya balik), tulis REKOMENDASI: []. Baris ini hanya berisi angka id dari daftar.",
  ].join("\n");
}

// Ambil baris "REKOMENDASI: [..]" dari balasan AI, lalu buang barisnya dari teks.
export function extractRecommendations(text: string): {
  text: string;
  ids: number[];
} {
  const found: number[] = [];
  const marker = /^[ \t]*REKOMENDASI[ \t]*:[ \t]*\[([^\]\n]*)\][ \t]*$/gim;

  const cleaned = text
    .replace(marker, (_match, inner: string) => {
      for (const part of inner.split(",")) {
        const id = Number(part.trim());
        if (Number.isInteger(id)) found.push(id);
      }
      return "";
    })
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const known = new Set(restaurants.map((r) => r.id));
  const ids = [...new Set(found)]
    .filter((id) => known.has(id))
    .slice(0, MAX_RECOMMENDATIONS);

  return { text: cleaned, ids };
}

// Detail dibaca dari data, bukan dari AI, supaya nama, jarak, dan harga tidak bisa dikarang.
export function toRecommendations(ids: number[]): Recommendation[] {
  const result: Recommendation[] = [];

  for (const id of ids) {
    const r = restaurants.find((item) => item.id === id);
    if (!r) continue;

    const menuSingkat = r.menu
      .slice(0, 3)
      .map((m) => m.nama)
      .join(", ");

    result.push({
      id: r.id,
      name: r.nama,
      reason: `${angka(r.jarakKm)} km, sekitar ${r.estimasiMenit} menit. Menu: ${menuSingkat}`,
      imageUrl: null,
      alamat: r.alamat,
      jarakKm: r.jarakKm,
      estimasiMenit: r.estimasiMenit,
      menu: r.menu,
    });
  }

  return result;
}
