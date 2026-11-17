import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/palette";
import type { Rec } from "../../types/chat";
import { menuSummary } from "../../utils/format";
import { openInMaps } from "../../utils/maps";
import { RestaurantSheet } from "./RestaurantSheet";

// Menampilkan data restoran berdasarkan rekomendasi
export function RecommendationCard({ rec, index }: { rec: Rec; index: number }) {
  // Mengatur tampilan detail menu
  const [menuOpen, setMenuOpen] = useState(false);

  // Menyimpan status foto jika gagal dimuat
  const [imgFailed, setImgFailed] = useState(false);

  // Mengambil informasi jarak dan waktu
  const meta = [
    rec.distanceKm !== undefined ? `${rec.distanceKm} km` : null,
    rec.etaMinutes !== undefined ? `${rec.etaMinutes} menit` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <View style={[styles.item, index > 0 && styles.divider]}>
      <View style={styles.top}>
        {/* Menampilkan foto atau ikon restoran */}
        <View style={[styles.thumb, !!rec.imageUrl && styles.thumbPhoto]}>
          {rec.imageUrl ? (
            <Ionicons name="image-outline" size={28} color="#5B4E43" />
          ) : (
            <Ionicons name="restaurant-outline" size={32} color={colors.primary} />
          )}
          {!!rec.imageUrl && !imgFailed && (
            <Image
              source={{ uri: rec.imageUrl }}
              style={StyleSheet.absoluteFill}
              onError={() => setImgFailed(true)}
            />
          )}
        </View>

        {/* Menampilkan informasi restoran */}
        <View style={styles.info}>
          <Text style={styles.name}>{index + 1}. {rec.name}</Text>

          {/* Menampilkan jarak dan waktu */}
          {!!meta && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{meta}</Text>
            </View>
          )}

          {/* Menampilkan daftar menu */}
          {!!rec.menu?.length && (
            <Text style={styles.sub} numberOfLines={2}>{menuSummary(rec.menu)}</Text>
          )}

          {/* Menampilkan alamat restoran */}
          {!!rec.address && (
            <Text style={styles.sub} numberOfLines={1}>{rec.address}</Text>
          )}
        </View>
      </View>

      {/* Tombol untuk membuka rute dan menu */}
      <View style={styles.actions}>
        {/* Membuka rute restoran di Google Maps */}
        <Pressable
          style={[styles.btn, styles.btnPrimary]}
          onPress={() => openInMaps(rec.name, rec.address)}
          accessibilityRole="button"
          accessibilityLabel={`Buka rute ${rec.name}`}
        >
          <Ionicons name="navigate-outline" size={16} color={colors.onPrimary} />
          <Text style={styles.btnPrimaryText}>Rute</Text>
        </Pressable>

        {/* Membuka detail menu restoran */}
        <Pressable
          style={[styles.btn, styles.btnOutline]}
          onPress={() => setMenuOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={`Lihat menu ${rec.name}`}
        >
          <Text style={styles.btnOutlineText}>Lihat menu</Text>
        </Pressable>
      </View>

      {/* Menampilkan detail menu restoran */}
      <RestaurantSheet rec={rec} meta={meta} visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </View>
  );
}

// Mengatur tampilan kartu restoran
const styles = StyleSheet.create({
  item: { paddingVertical: 10 },

  // Mengatur garis pemisah kartu
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },

  // Mengatur posisi foto dan informasi
  top: { flexDirection: "row", gap: 12 },

  // Mengatur ukuran dan tampilan foto
  thumb: {
    width: 96,
    height: 120,
    borderRadius: 14,
    backgroundColor: colors.soft,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  // Mengatur warna latar foto
  thumbPhoto: { backgroundColor: "#CDBFB0" },

  // Mengatur posisi informasi restoran
  info: { flex: 1, gap: 4 },

  // Mengatur tampilan nama restoran
  name: { fontSize: 16, fontWeight: "700", color: colors.ink },

  // Mengatur tampilan label jarak dan waktu
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#D6F5E3",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },

  // Mengatur teks jarak dan waktu
  badgeText: { fontSize: 12, fontWeight: "600", color: "#0B7A3E" },

  // Mengatur tampilan teks tambahan
  sub: { fontSize: 13, lineHeight: 18, color: colors.muted },

  // Mengatur posisi tombol
  actions: { flexDirection: "row", gap: 10, marginTop: 10 },

  // Mengatur tampilan tombol
  btn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  // Mengatur warna tombol (rute)
  btnPrimary: { backgroundColor: colors.primary },

  // Mengatur teks tombol (rute)
  btnPrimaryText: { fontSize: 14, fontWeight: "700", color: colors.onPrimary },

  // Mengatur tampilan tombol (lihat menu)
  btnOutline: { borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.card },

  // Mengatur teks tombol (lihat menu)
  btnOutlineText: { fontSize: 14, fontWeight: "700", color: colors.primary },
});
