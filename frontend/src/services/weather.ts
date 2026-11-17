// Mengambil informasi cuaca dari backend

import { API_URL } from "../constants/api";
import { DEFAULT_LOCATION } from "../constants/location";
import { isRainy } from "../utils/weather";
import { getToken } from "./session";

// Mengecek apakah cuaca sedang hujan
export async function fetchIsRaining(): Promise<boolean> {
  // Mengatur batas waktu pengambilan data
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);

  try {
    // Mengambil token pengguna
    const token = await getToken();

    // Mengambil koordinat lokasi
    const { lat, lon } = DEFAULT_LOCATION;

    // Mengirim permintaan data cuaca ke backend
    const response = await fetch(`${API_URL}/api/weather?lat=${lat}&lon=${lon}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: controller.signal,
    });

    // Menghentikan proses jika permintaan gagal
    if (!response.ok) return false;

    // Mengambil data cuaca dari respons backend
    const json = await response.json();

    // Mengecek apakah kondisi cuaca sedang hujan
    return isRainy(json?.weather ?? json?.data?.weather);
  } catch {
    // Mengembalikan false jika terjadi kesalahan
    return false;
  } finally {
    // Menghentikan batas waktu
    clearTimeout(timer);
  }
}
