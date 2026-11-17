// Menampilkan tampilan saat chat masih kosong
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/palette";
import { useSaranChat } from "../../hooks/useSaranChat";

// Menampilkan sapaan dan saran chat untuk pengguna
export function EmptyState({ name, onPick }: { name: string; onPick: (t: string) => void }) {
  // Mengambil sapaan dan saran berdasarkan waktu dan cuaca
  const { saran, sapaan } = useSaranChat();

  return (
    // Mengatur tampilan saat belum ada pesan
    <View style={styles.empty}>
      <Image
        source={require("../../../assets/images/goai.png")}
        style={styles.logo}
      />

      {/* Menampilkan nama pengguna */}
      <Text style={styles.title}>Hai, {name}!</Text>

      {/* Menampilkan sapaan sesuai waktu dan cuaca */}
      <Text style={styles.sub}>{sapaan}</Text>

      {/* Menampilkan daftar saran pertanyaan */}
      <View style={styles.list}>
        {saran.map((t) => (
          // Mengirim saran saat dipilih pengguna
          <Pressable key={t} style={styles.example} onPress={() => onPick(t)}>
            <Text style={styles.exampleText}>{t}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// Mengatur tampilan halaman chat kosong
const styles = StyleSheet.create({
  // Mengatur posisi seluruh tampilan
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 24 },

  // Mengatur ukuran logo GOAI
  logo: { width: 96, height: 96, marginBottom: 12 },

  // Mengatur tampilan nama pengguna
  title: { fontSize: 24, fontWeight: "700", color: colors.ink },

  // Mengatur tampilan sapaan
  sub: { fontSize: 15, color: colors.muted, marginTop: 4 },

  // Mengatur posisi daftar saran
  list: { alignSelf: "stretch", gap: 10, marginTop: 16 },

  // Mengatur tampilan tombol saran
  example: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },

  // Mengatur tampilan teks saran
  exampleText: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.ink },
});
