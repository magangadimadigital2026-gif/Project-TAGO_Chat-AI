
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/palette";
import type { Rec } from "../../types/chat";

// Fungsi untuk menampilkan teks dengan tanda titik di depannya
function Bullet({ text, lines }: { text: string; lines?: number }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.dot}>•</Text>
      <Text style={styles.bulletText} numberOfLines={lines}>
        {text}
      </Text>
    </View>
  );
}

// Komponen untuk menampilkan informasi rekomendasi restoran
// rec berisi data restoran, sedangkan index berisi nomor urut restoran
export function RecommendationCard({
  rec,
  index,
}: {
  rec: Rec;
  index: number;
}) {
  // Mengambil jarak dan waktu perjalanan jika datanya tersedia
  const meta = [
    rec.distanceKm !== undefined ? `${rec.distanceKm} km` : null,
    rec.etaMinutes !== undefined ? `${rec.etaMinutes} menit` : null,
  ]
    // Menghapus data yang kosong
    .filter(Boolean)
    // Menggabungkan jarak dan waktu menjadi satu teks
    .join(" · ");

  // Menentukan apakah alasan rekomendasi perlu ditampilkan
  // Alasan disembunyikan jika kosong, mengulang alamat, atau berisi informasi menu
  const showReason =
    !!rec.reason &&
    !(rec.address && rec.reason.includes(rec.address)) &&
    !rec.reason.includes("Menu:");

  return (
    // Menampilkan satu kartu restoran
    // Jika bukan restoran pertama, tambahkan garis pemisah
    <View style={[styles.item, index > 0 && styles.divider]}>

      {/* Menampilkan foto restoran atau ikon jika foto tidak tersedia */}
      <View style={styles.thumb}>
        {rec.imageUrl ? (
          <Image source={{ uri: rec.imageUrl }} style={styles.img} />
        ) : (
          <Ionicons
            name="restaurant-outline"
            size={32}
            color={colors.primary}
          />
        )}
      </View>

      {/* Bagian untuk menampilkan informasi restoran */}
      <View style={styles.info}>

        {/* Menampilkan nomor urut dan nama restoran */}
        <Text style={styles.name}>
          {index + 1}. {rec.name}
        </Text>

        {/* Menampilkan jarak dan waktu jika tersedia */}
        {!!meta && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{meta}</Text>
          </View>
        )}

        {/* Menampilkan maksimal 3 menu restoran */}
        {!!rec.menu?.length && (
          <Bullet
            text={`Menu: ${rec.menu.slice(0, 3).join(", ")}`}
            lines={2}
          />
        )}

        {/* Menampilkan alasan rekomendasi jika memenuhi kondisi */}
        {showReason && <Bullet text={rec.reason} />}

        {/* Menampilkan alamat restoran jika tersedia */}
        {!!rec.address && (
          <Bullet text={`Lokasi: ${rec.address}`} lines={2} />
        )}
      </View>
    </View>
  );
}

// Mengatur tampilan setiap bagian komponen
const styles = StyleSheet.create({

  // Mengatur susunan kartu ke samping dan jarak antarbagian
  item: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 10,
  },

  // Memberikan garis pemisah untuk restoran berikutnya
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },

  // Mengatur ukuran dan bentuk tempat foto restoran
  thumb: {
    width: 88,
    height: 88,
    borderRadius: 14,
    backgroundColor: colors.soft,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  // Mengatur ukuran foto agar sesuai dengan tempatnya
  img: {
    width: 88,
    height: 88,
  },

  // Mengatur bagian informasi agar mengisi ruang yang tersedia
  info: {
    flex: 1,
    gap: 4,
  },

  // Mengatur tampilan nama restoran
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },

  // Mengatur bentuk dan warna label jarak dan waktu
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#D6F5E3",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },

  // Mengatur tulisan di dalam label
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0B7A3E",
  },

  // Mengatur susunan tanda titik dan teks
  bulletRow: {
    flexDirection: "row",
    gap: 6,
  },

  // Mengatur tampilan tanda titik
  dot: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.ink,
  },

  // Mengatur tampilan teks informasi restoran
  bulletText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colors.ink,
  },
});
