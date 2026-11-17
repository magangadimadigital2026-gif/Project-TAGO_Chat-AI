import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../constants/palette";
import type { Rec } from "../../types/chat";
import { groupMenu, rupiah } from "../../utils/format";
import { openInMaps } from "../../utils/maps";

// Menentukan data yang digunakan
type Props = { rec: Rec; meta: string; visible: boolean; onClose: () => void };

export function RestaurantSheet({ rec, meta, visible, onClose }: Props) {
  // Mengatur jarak tampilan dari bawah layar
  const insets = useSafeAreaInsets();

  return (
    // Mengatur tampilan modal
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Menutup detail saat area luar ditekan */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) + 4 }]}>
          {/* Garis kecil di bagian atas */}
          <View style={styles.handle} />

          {/* Membuat halaman detail bisa digulir */}
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.head}>
              {/* Menampilkan foto atau ikon restoran */}
              <View style={styles.thumb}>
                {rec.imageUrl ? (
                  <Image source={{ uri: rec.imageUrl }} style={styles.img} />
                ) : (
                  <Ionicons name="restaurant-outline" size={30} color={colors.primary} />
                )}
              </View>

              {/* Menampilkan nama dan informasi restoran */}
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.name}>{rec.name}</Text>
                {!!meta && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{meta}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Menampilkan alamat restoran */}
            {!!rec.address && <Text style={styles.address}>{rec.address}</Text>}

            {/* Menampilkan daftar menu dan harga */}
            {groupMenu(rec.menu ?? []).map((section) => (
              <View key={section.title}>
                <Text style={styles.section}>{section.title}</Text>
                {section.items.map((m, i) => (
                  <View key={`${m.name}-${i}`} style={styles.row}>
                    <Text style={styles.itemName}>{m.name}</Text>
                    {m.price !== undefined && <Text style={styles.price}>{rupiah(m.price)}</Text>}
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>

          {/* Membuka lokasi restoran di Google Maps */}
          <Pressable style={styles.mapBtn} onPress={() => openInMaps(rec.name, rec.address)} accessibilityRole="button">
            <Ionicons name="map-outline" size={18} color={colors.onPrimary} />
            <Text style={styles.mapText}>Buka di Google Maps</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// Mengatur tampilan detail restoran
const styles = StyleSheet.create({
  // Mengatur latar belakang modal
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: colors.overlay },

  // Mengatur ukuran dan posisi lembar detail
  sheet: {
    maxHeight: "80%",
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 10,
  },

  // Mengatur garis kecil di bagian atas
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 12,
  },

  // Mengatur posisi foto dan informasi restoran
  head: { flexDirection: "row", alignItems: "center", gap: 12 },

  // Mengatur ukuran foto restoran
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: colors.soft,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  // Mengatur ukuran gambar
  img: { width: 72, height: 72 },

  // Mengatur tampilan nama restoran
  name: { fontSize: 17, fontWeight: "700", color: colors.ink },

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

  // Mengatur tampilan alamat restoran
  address: { fontSize: 13, lineHeight: 19, color: colors.muted, marginTop: 12 },

  // Mengatur tampilan judul kategori menu
  section: { fontSize: 13, fontWeight: "700", color: colors.primary, marginTop: 16, marginBottom: 4 },

  // Mengatur posisi nama menu dan harga
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },

  // Mengatur tampilan nama menu
  itemName: { flex: 1, fontSize: 14, color: colors.ink },

  // Mengatur tampilan harga menu
  price: { fontSize: 14, color: colors.ink },

  // Mengatur tampilan tombol Google Maps
  mapBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.primary,
    marginTop: 14,
  },

  // Mengatur teks tombol Google Maps
  mapText: { fontSize: 15, fontWeight: "700", color: colors.onPrimary },
});
