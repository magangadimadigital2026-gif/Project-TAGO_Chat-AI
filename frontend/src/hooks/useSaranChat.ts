
// Mengatur saran chat untuk tampilan awal
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { fetchIsRaining } from "../services/weather";
import { ambilSapaan, ambilSaran } from "../utils/saran";

// Menyimpan kunci data saran di penyimpanan
const KUNCI = "goai:saran-terakhir";

// Mengambil saran yang pernah ditampilkan
async function bacaTerakhir(): Promise<string[]> {
  try {
    const data = JSON.parse((await AsyncStorage.getItem(KUNCI)) ?? "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// Menyimpan daftar saran terakhir
async function simpanTerakhir(daftar: string[]) {
  try {
    await AsyncStorage.setItem(KUNCI, JSON.stringify(daftar));
  } catch {
    // Mengabaikan jika data gagal disimpan
  }
}

// Mengatur sapaan dan saran chat
export function useSaranChat() {
  // Mengambil sapaan saat halaman dibuka
  const [sapaan] = useState(() => ambilSapaan());

  // Menyimpan daftar saran chat
  const [saran, setSaran] = useState<string[]>([]);

  // Menjalankan proses saat komponen dibuka
  useEffect(() => {
    let aktif = true;

    (async () => {
      // Mengambil daftar saran sebelumnya
      const terakhir = await bacaTerakhir();
      if (!aktif) return;

      // Menampilkan saran tanpa menunggu data cuaca
      const awal = ambilSaran({ terakhir });
      setSaran(awal);
      simpanTerakhir(awal);

      // Mengecek kondisi hujan
      const hujan = await fetchIsRaining();
      if (!aktif || !hujan) return;

      // Mengganti saran jika sedang hujan
      const saranHujan = ambilSaran({ hujan: true, terakhir: [...terakhir, ...awal] });
      setSaran(saranHujan);
      simpanTerakhir(saranHujan);
    })();

    // Menghentikan proses saat komponen ditutup
    return () => {
      aktif = false;
    };
  }, []);

  // Mengirimkan sapaan dan saran ke komponen
  return { saran, sapaan };
}
