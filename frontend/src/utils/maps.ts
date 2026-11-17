// Membuka Google Maps dari nama dan alamat restoran
import { Linking } from "react-native";
import { notify } from "./notify";

// Alamat pencarian Google Maps
export const mapsUrl = (name: string, address?: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    [name, address].filter(Boolean).join(" ")
  )}`;

// Membuka aplikasi Google Maps, tampilkan pesan jika gagal
export function openInMaps(name: string, address?: string) {
  Linking.openURL(mapsUrl(name, address)).catch(() =>
    notify("Gagal", "Google Maps tidak bisa dibuka.")
  );
}