import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../constants/palette";
import type { Rec } from "../../types/chat";
import { groupMenu, rupiah } from "../../utils/format";
import { mapsUrl } from "../../utils/maps";
import { notify } from "../../utils/notify";

// Data yang dibutuhkan untuk menampilkan detail restoran
type Props = { rec: Rec; meta: string; visible: boolean; onClose: () => void };

// Komponen untuk menampilkan detail restoran
export function RestaurantSheet({ rec, meta, visible, onClose }: Props) {
  // * jarak tampilan agar tidak tertutup bagian bawah layar
  const insets = useSafeAreaInsets();
  // Membuka Google Maps dengan nama dan alamat restoran
  const openMaps = () => {
    Linking.openURL(mapsUrl(rec.name, rec.address)).catch(() =>
      notify("Gagal", "Google Maps tidak bisa dibuka.")
    );
  };

  return (
    // Menampilkan detail restoran dalam bentuk lembar dari bawah
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>

        {/* Area gelap di belakang, ketuk untuk menutup detail */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        {/* Kotak detail restoran */}
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) + 4 }]}>

          {/* Garis kecil di bagian atas lembar detail */}
          <View style={styles.handle} />

          <ScrollView showsVerticalScrollIndicator={false}>

            {/* Menampilkan foto dan nama restoran */}
            <View style={styles.head}>
              <View style={styles.thumb}>
                {rec.imageUrl ? (
                  <Image source={{ uri: rec.imageUrl }} style={styles.img} />
                ) : (
                  <Ionicons name="restaurant-outline" size={30} color={colors.primary} />
                )}
              </View>

              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.name}>{rec.name}</Text>

                {/* Menampilkan jarak dan waktu perjalanan */}
                {!!meta && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{meta}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Menampilkan alamat restoran */}
            {!!rec.address && <Text style={styles.address}>{rec.address}</Text>}

            {/* Menampilkan daftar menu berdasarkan kategorinya */}
            {groupMenu(rec.menu ?? []).map((section) => (
              <View key={section.title}>

                {/* Nama kategori menu */}
                <Text style={styles.section}>{section.title}</Text>

                {/* Menampilkan nama dan harga setiap menu */}
                {section.items.map((m, i) => (
                  <View key={`${m.name}-${i}`} style={styles.row}>
                    <Text style={styles.itemName}>{m.name}</Text>
                    {m.price !== undefined && <Text style={styles.price}>{rupiah(m.price)}</Text>}
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>

          {/* Tombol untuk membuka lokasi restoran di Google Maps */}
          <Pressable style={styles.mapBtn} onPress={openMaps} accessibilityRole="button">
            <Ionicons name="map-outline" size={18} color={colors.onPrimary} />
            <Text style={styles.mapText}>Buka di Google Maps</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// desain dan tampilan detail restoran
const styles = StyleSheet.create({

  // latar belakang dan posisi lembar detail
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: colors.overlay },
  // ukuran dan bentuk kotak detail restoran
  sheet: {
    maxHeight: "80%",
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  //  tampilan garis kecil di bagian atas
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 12,
  },
  //  posisi foto dan informasi restoran
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  //  ukuran dan posisi foto restoran
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: colors.soft,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  // ukuran foto restoran
  img: { width: 72, height: 72 },
  // tampilan nama restoran
  name: { fontSize: 17, fontWeight: "700", color: colors.ink },
  // tampilan label jarak dan waktu
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#D6F5E3",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  // tulisan pada label jarak dan waktu
  badgeText: { fontSize: 12, fontWeight: "600", color: "#0B7A3E" },
  // tampilan alamat restoran
  address: { fontSize: 13, lineHeight: 19, color: colors.muted, marginTop: 12 },
  // tampilan judul kategori menu
  section: { fontSize: 13, fontWeight: "700", color: colors.primary, marginTop: 16, marginBottom: 4 },
  // posisi nama dan harga menu
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  // tampilan nama menu
  itemName: { flex: 1, fontSize: 14, color: colors.ink },
  // tampilan harga menu
  price: { fontSize: 14, color: colors.ink },
  // tampilan tombol Google Maps
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
  // tampilan tulisan tombol Google Maps
  mapText: { fontSize: 15, fontWeight: "700", color: colors.onPrimary },
});
