import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/palette";
import type { Rec } from "../../types/chat";
import { menuSummary } from "../../utils/format";
import { RestaurantSheet } from "./RestaurantSheet";

// Komponen untuk menampilkan poin informasi
function Bullet({ text, lines }: { text: string; lines?: number }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.dot}>•</Text>
      <Text style={styles.bulletText} numberOfLines={lines}>{text}</Text>
    </View>
  );
}

// rec berisi data restoran, index digunakan untuk nomor urut
export function RecommendationCard({ rec, index }: { rec: Rec; index: number }) {

  // Mengatur status tampilan detail restoran
  const [open, setOpen] = useState(false);

  // Mengambil informasi jarak dan waktu perjalanan
  const meta = [
    rec.distanceKm !== undefined ? `${rec.distanceKm} km` : null,
    rec.etaMinutes !== undefined ? `${rec.etaMinutes} menit` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  // Mengecek apakah alasan rekomendasi perlu ditampilkan
  const showReason =
    !!rec.reason &&
    !(rec.address && rec.reason.includes(rec.address)) &&
    !rec.reason.includes("Menu:");

  return (
    <>
      {/* Kartu restoran yang bisa diketuk untuk melihat detail */}
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`Lihat detail ${rec.name}`}
        style={({ pressed }) => [styles.item, index > 0 && styles.divider, pressed && styles.pressed]}
      >

        {/* Menampilkan foto restoran atau ikon jika foto tidak tersedia */}
        <View style={styles.thumb}>
          {rec.imageUrl ? (
            <Image source={{ uri: rec.imageUrl }} style={styles.img} />
          ) : (
            <Ionicons name="restaurant-outline" size={32} color={colors.primary} />
          )}
        </View>

        <View style={styles.info}>

          {/* Menampilkan nama restoran dan nomor urut */}
          <Text style={styles.name}>{index + 1}. {rec.name}</Text>

          {/* Menampilkan jarak dan waktu perjalanan */}
          {!!meta && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{meta}</Text>
            </View>
          )}

          {/* Menampilkan 3 menu&harga, makanan di dahulukan */}
          {!!rec.menu?.length && (
            <Bullet text={`Menu: ${menuSummary(rec.menu)}`} lines={3} />
          )}

          {/* Menampilkan alasan rekomendasi */}
          {showReason && <Bullet text={rec.reason} />}

          {/* Menampilkan alamat restoran */}
          {!!rec.address && <Bullet text={`Lokasi: ${rec.address}`} lines={3} />}
        </View>

        {/* Tanda kartu bisa diketuk */}
        <Ionicons name="chevron-forward" size={18} color={colors.muted} style={styles.chevron} />
      </Pressable>

      {/* Menampilkan detail restoran saat kartu diketuk */}
      <RestaurantSheet rec={rec} meta={meta} visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

// Mengatur desain dan tampilan kartu rekomendasi
const styles = StyleSheet.create({

  // Mengatur posisi dan jarak isi kartu
  item: { flexDirection: "row", gap: 12, paddingVertical: 10 },
  // Mengatur tampilan kartu saat diketuk
  pressed: { opacity: 0.6 },
  // Garis pemisah antar kartu restoran
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  // Ukuran dan posisi foto 
  thumb: {
    width: 88,
    height: 88,
    borderRadius: 14,
    backgroundColor: colors.soft,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  // Mengatur ukuran foto restoran
  img: { width: 88, height: 88 },
  // Mengatur tata letak informasi restoran
  info: { flex: 1, gap: 4 },
  // Mengatur posisi ikon panah
  chevron: { alignSelf: "center" },
  // Mengatur tampilan nama restoran
  name: { fontSize: 15, fontWeight: "700", color: colors.ink },
  // Mengatur tampilan label jarak dan waktu
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#D6F5E3",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  // Mengatur tulisan pada label jarak dan waktu
  badgeText: { fontSize: 12, fontWeight: "600", color: "#0B7A3E" },
  // Mengatur posisi poin informasi
  bulletRow: { flexDirection: "row", gap: 6 },
  // Mengatur tampilan tanda poin
  dot: { fontSize: 13, lineHeight: 18, color: colors.ink },
  // Mengatur tampilan teks informasi restoran
  bulletText: { flex: 1, fontSize: 13, lineHeight: 18, color: colors.ink },
});
