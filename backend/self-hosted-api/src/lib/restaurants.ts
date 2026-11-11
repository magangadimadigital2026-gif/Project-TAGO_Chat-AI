import {
  restaurants,
  type MenuItem,
  type Restaurant,
} from "../data/restaurants.js";

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
const BEST_COUNT = 10; // tempat yang paling cocok dengan pesan
const RANDOM_COUNT = 12; // tambahan acak dari yang cocok, supaya variatif
const MIN_CANDIDATES = 12; // kalau yang cocok sedikit, tambah dari yang terdekat

const rupiah = (value: number) => `Rp${value.toLocaleString("id-ID")}`;
const angka = (value: number) => String(value).replace(".", ",");

// Kata yang diabaikan saat mencari tempat yang cocok.
const STOPWORDS = new Set([
  "yang",
  "dong",
  "mau",
  "makan",
  "makanan",
  "apa",
  "untuk",
  "dan",
  "di",
  "ada",
  "nya",
  "aku",
  "saya",
  "lagi",
  "enak",
  "cari",
  "carikan",
  "tolong",
  "minta",
  "rekomendasi",
  "dekat",
  "sini",
  "malam",
  "siang",
  "pagi",
  "sore",
  "hari",
  "ini",
  "itu",
  "nih",
  "ya",
  "yg",
  "dengan",
  "atau",
  "bisa",
  "buat",
  "dari",
  "ke",
  "tempat",
  "resto",
  "restoran",
  "warung",
  "mana",
  "yuk",
  "deh",
]);

// Kata kunci yang artinya dekat dengan jenis makanan tertentu.
const SYNONYMS: Record<string, string[]> = {
  kuah: ["soto", "rawon", "bakso", "rebus", "kuah", "lodeh", "sup", "ramen"],
  hujan: ["soto", "rawon", "bakso", "wedang", "rebus", "kopi", "jahe", "ramen"],
  dingin: [
    "soto",
    "rawon",
    "bakso",
    "wedang",
    "rebus",
    "kopi",
    "jahe",
    "ramen",
  ],
  hangat: ["soto", "rawon", "wedang", "rebus", "jahe", "teh hangat"],
  pedas: ["geprek", "pedas", "penyet", "balado", "sambal"],
  segar: ["es ", "jus", "dawet", "degan", "kelapa"],
  haus: ["es ", "jus", "dawet", "degan", "kelapa", "teh"],
  manis: ["es ", "martabak", "cenil", "klepon", "gethuk", "donat"],
  ngopi: ["kopi", "cethe", "warkop"],
  kopi: ["kopi", "cethe", "warkop"],
  jajan: [
    "cenil",
    "gethuk",
    "klepon",
    "lupis",
    "tiwul",
    "gorengan",
    "martabak",
  ],
  ringan: [
    "gorengan",
    "roti",
    "pisang",
    "cenil",
    "gethuk",
    "klepon",
    "angkringan",
  ],
  murah: ["angkringan", "pecel", "nasi kucing", "gorengan"],
  jepang: ["ramen", "katsu", "gyoza", "takoyaki"],
  barat: ["pizza", "steak", "burger", "spaghetti"],
  ayam: ["ayam", "geprek", "penyet", "lodho", "sate"],
  ikan: ["ikan", "wader", "lele", "nila", "gurame"],
  seafood: ["ikan", "udang", "cumi", "wader", "lele", "gurame"],
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Pilih sekitar 20 tempat yang paling cocok dengan pesan, bukan semua 150.
// Prompt jadi jauh lebih pendek (AI lebih cepat) dan pilihannya tetap bervariasi.
export function selectRestaurants(query: string): Restaurant[] {
  const tokens = [...new Set(tokenize(query))];

  const scored = restaurants.map((r) => {
    const haystack =
      `${r.nama} ${r.menu.map((m) => m.nama).join(" ")}`.toLowerCase();
    let score = 0;
    // Tiap kata dari pesan dinilai satu kali: cocok langsung = 2, cocok lewat sinonim = 1.
    for (const token of tokens) {
      if (haystack.includes(token)) score += 2;
      else if (
        (SYNONYMS[token] ?? []).some((extra) => haystack.includes(extra))
      )
        score += 1;
    }
    return { r, score };
  });

  const byDistance = (a: Restaurant, b: Restaurant) => a.jarakKm - b.jarakKm;
  const matched = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || byDistance(a.r, b.r))
    .map((s) => s.r);

  // Yang paling cocok dulu (utamakan yang terdekat), lalu tambahan acak dari sisanya.
  const picked: Restaurant[] = [
    ...matched.slice(0, BEST_COUNT),
    ...shuffle(matched.slice(BEST_COUNT)).slice(0, RANDOM_COUNT),
  ];

  if (picked.length < MIN_CANDIDATES) {
    for (const r of [...restaurants].sort(byDistance)) {
      if (picked.length >= MIN_CANDIDATES) break;
      if (!picked.includes(r)) picked.push(r);
    }
  }

  return picked.sort(byDistance);
}

// Daftar tempat + aturan main yang disisipkan ke system prompt Gemini.
export function buildRestaurantContext(candidates: Restaurant[]): string {
  const list = candidates
    .map(
      (r) =>
        `${r.id}. ${r.nama} | ${r.alamat} | ${angka(r.jarakKm)} km, sekitar ${r.estimasiMenit} menit | menu: ${r.menu
          .map((m) => `${m.nama} ${rupiah(m.harga)}`)
          .join(", ")}`,
    )
    .join("\n");

  return [
    "Daftar tempat makan di sekitar pengguna. Alamat, jarak, dan estimasi waktu sudah dihitung, jadi JANGAN meminta lokasi pengguna dan JANGAN menyarankan aplikasi pesan antar:",
    list,
    "Aturan rekomendasi: rekomendasikan HANYA tempat dari daftar di atas, maksimal 3 per jawaban. Jangan mengarang tempat, menu, harga, alamat, atau jarak. Untuk setiap tempat, sebut nama, alamat, jarak, estimasi menit, dan satu atau dua menu yang cocok dengan permintaan pengguna beserta harganya. Variasikan pilihan: jangan selalu memilih yang paling dekat jika ada yang lebih cocok dengan permintaan. Jika tidak ada yang cocok, katakan terus terang. Menu dan harga di daftar hanyalah perkiraan, bukan daftar resmi tempat tersebut, jadi saat menyebut harga tulis sekitar atau perkiraan, dan sarankan pengguna mengecek langsung ke tempatnya.",
    "Jawab ringkas: satu kalimat sapaan, lalu daftar rekomendasi dengan masing-masing satu atau dua kalimat. Tanpa pembukaan dan penutup yang panjang.",
    "Tepat sebelum baris JSON quick_replies, tambahkan satu baris terpisah berformat REKOMENDASI: [id1, id2] berisi nomor tempat yang kamu rekomendasikan di jawaban ini. Jika belum merekomendasikan apa pun (misalnya masih bertanya balik), tulis REKOMENDASI: []. Baris ini hanya berisi angka id dari daftar.",
  ].join("\n");
}

// Ambil baris "REKOMENDASI: [..]" dari balasan AI, lalu buang barisnya dari teks.
// allowedIds: hanya id yang memang ada di daftar yang dikirim ke AI yang dipakai.
export function extractRecommendations(
  text: string,
  allowedIds: number[],
): { text: string; ids: number[] } {
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

  const allowed = new Set(allowedIds);
  const ids = [...new Set(found)]
    .filter((id) => allowed.has(id))
    .slice(0, MAX_RECOMMENDATIONS);

  return { text: cleaned, ids };
}

// Detail dibaca dari data, bukan dari AI, supaya nama, alamat, jarak, dan harga tidak bisa dikarang.
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
      reason: `${r.alamat}. ${angka(r.jarakKm)} km, sekitar ${r.estimasiMenit} menit. Menu: ${menuSingkat}`,
      imageUrl: null,
      alamat: r.alamat,
      jarakKm: r.jarakKm,
      estimasiMenit: r.estimasiMenit,
      menu: r.menu,
    });
  }

  return result;
}
