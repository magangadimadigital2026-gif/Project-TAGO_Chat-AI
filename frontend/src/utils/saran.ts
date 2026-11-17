
// Mengatur daftar saran chat berdasarkan jam dan cuaca

// Menentukan jenis waktu
type Jam = "pagi" | "siang" | "sore" | "malam";

// Menentukan data saran chat
type Saran = {
  teks: string;
  // Mengelompokkan jenis saran
  kategori: string;
  // Menentukan waktu munculnya saran
  jam: (Jam | "semua")[];
  // Menentukan saran khusus saat hujan
  hujanSaja?: boolean;
};

// Daftar saran chat yang bisa ditampilkan
export const SARAN: Saran[] = [
  // Saran untuk pagi hari
  { teks: "Sarapan enak yang cepat", kategori: "sarapan", jam: ["pagi"] },
  { teks: "Bubur atau nasi kuning yang paling dekat", kategori: "sarapan", jam: ["pagi"] },
  { teks: "Sarapan sehat yang cepat", kategori: "sehat", jam: ["pagi", "siang"] },
  { teks: "Kopi dan roti buat teman kerja", kategori: "minuman", jam: ["pagi"] },

  // Saran untuk siang hari
  { teks: "Makan siang kenyang di bawah Rp20 ribu", kategori: "hemat", jam: ["siang"] },
  { teks: "Makanan pedas tapi hemat", kategori: "pedas", jam: ["siang", "malam"] },
  { teks: "Menu nasi yang cepat disajikan", kategori: "cepat", jam: ["siang"] },
  { teks: "Es segar buat siang yang panas", kategori: "minuman", jam: ["siang", "sore"] },

  // Saran untuk sore hari
  { teks: "Camilan sore yang gurih", kategori: "camilan", jam: ["sore"] },
  { teks: "Jajanan manis buat teman santai", kategori: "manis", jam: ["sore"] },
  { teks: "Gorengan hangat yang paling dekat", kategori: "camilan", jam: ["sore", "malam"] },
  { teks: "Minuman dingin yang segar", kategori: "minuman", jam: ["sore"] },

  // Saran untuk malam hari
  { teks: "Mie kuah yang hangat", kategori: "berkuah", jam: ["sore", "malam"] },
  { teks: "Soto atau bakso kuah panas", kategori: "berkuah", jam: ["sore", "malam"] },
  { teks: "Makan malam hemat buat anak kos", kategori: "hemat", jam: ["malam"] },
  { teks: "Pedas yang bikin keringetan", kategori: "pedas", jam: ["malam"] },
  { teks: "Nasi goreng yang masih buka", kategori: "berat", jam: ["malam"] },
  { teks: "Sate atau bakso yang masih buka", kategori: "berat", jam: ["malam"] },

  // Saran yang bisa muncul kapan saja
  { teks: "Yang paling dekat dari lokasiku", kategori: "dekat", jam: ["semua"] },
  { teks: "Sate kambing yang paling dekat", kategori: "berat", jam: ["semua"] },
  { teks: "Menu enak di bawah Rp15 ribu", kategori: "hemat", jam: ["semua"] },
  { teks: "Makanan sehat yang tidak bikin bosan", kategori: "sehat", jam: ["semua"] },
  { teks: "Kasih aku ide menu yang belum pernah kucoba", kategori: "kejutan", jam: ["semua"] },
  { teks: "Pilihkan satu menu, aku bingung", kategori: "kejutan", jam: ["semua"] },

  // Saran khusus saat hujan
  { teks: "Mie kuah untuk cuaca hujan begini", kategori: "berkuah", jam: ["semua"], hujanSaja: true },
  { teks: "Yang hangat-hangat buat hujan", kategori: "berkuah", jam: ["semua"], hujanSaja: true },
];

// Daftar sapaan berdasarkan waktu
const SAPAAN: Record<Jam, string[]> = {
  pagi: ["Mau sarapan apa pagi ini?", "Pagi! Perut sudah minta diisi?"],
  siang: ["Mau makan siang apa hari ini?", "Siang begini enaknya makan apa ya?"],
  sore: ["Ada yang mau dicemil sore ini?", "Sore-sore begini lagi pengen apa?"],
  malam: ["Mau makan apa malam ini?", "Malam begini lapar? Mau makan apa?"],
};

// Menentukan fungsi pengacak
type Rng = () => number;

// Menentukan waktu berdasarkan jam sekarang
export function bucketJam(now: Date = new Date()): Jam {
  const h = now.getHours();
  if (h >= 5 && h <= 10) return "pagi";
  if (h >= 11 && h <= 14) return "siang";
  if (h >= 15 && h <= 17) return "sore";
  return "malam";
}

// Mengacak urutan daftar
function acak<T>(arr: T[], rng: Rng): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Mengambil sapaan sesuai waktu
export function ambilSapaan(now: Date = new Date(), rng: Rng = Math.random): string {
  return acak(SAPAAN[bucketJam(now)], rng)[0];
}

// Menentukan pilihan untuk mengambil saran
type Opsi = {
  jumlah?: number;
  hujan?: boolean;
  // Menyimpan saran yang sudah pernah muncul
  terakhir?: string[];
  now?: Date;
  rng?: Rng;
};

// Memilih saran berdasarkan waktu dan cuaca
export function ambilSaran({
  jumlah = 3,
  hujan = false,
  terakhir = [],
  now = new Date(),
  rng = Math.random,
}: Opsi = {}): string[] {
  // Mengambil waktu sekarang
  const jam = bucketJam(now);

  // Memilih saran yang sesuai dengan waktu
  const cocokJam = (s: Saran) => s.jam.includes(jam) || s.jam.includes("semua");

  // Memisahkan saran berdasarkan kondisi hujan
  const layak = SARAN.filter((s) => hujan || !s.hujanSaja);

  // Menghindari saran yang sudah pernah muncul
  const baru = layak.filter((s) => !terakhir.includes(s.teks));

  // Memilih saran utama berdasarkan waktu dan cuaca
  const utama = hujan ? baru.filter((s) => s.kategori === "berkuah") : baru.filter(cocokJam);

  // Mengatur urutan prioritas saran
  const urutan = [
    ...acak(utama, rng),
    ...acak(baru.filter(cocokJam), rng),
    ...acak(baru, rng),
    ...acak(layak, rng),
  ];

  // Menyiapkan daftar saran yang akan dipilih
  const pilih: Saran[] = [];
  const kategori = new Set<string>();

  // Memilih saran dengan kategori berbeda
  for (const s of urutan) {
    if (pilih.length >= jumlah) break;
    if (!pilih.includes(s) && !kategori.has(s.kategori)) {
      pilih.push(s);
      kategori.add(s.kategori);
    }
  }

  // Menambahkan saran jika jumlahnya belum cukup
  for (const s of urutan) {
    if (pilih.length >= jumlah) break;
    if (!pilih.includes(s)) pilih.push(s);
  }

  // Mengembalikan daftar teks saran
  return pilih.map((s) => s.teks);
}
