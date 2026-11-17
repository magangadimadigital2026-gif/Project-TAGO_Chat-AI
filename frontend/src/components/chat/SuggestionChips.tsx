
// Menampilkan pilihan saran balasan cepat
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/palette";

// Menerima daftar saran dan fungsi saat saran dipilih
export function SuggestionChips({
  suggestions,
  onPick,
}: {
  suggestions: string[];
  onPick: (s: string) => void;
}) {
  return (
    // Menampilkan semua pilihan saran
    <View style={styles.chips}>
      {suggestions.map((s) => (
        // Menjalankan fungsi saat saran ditekan
        <Pressable key={s} style={styles.chip} onPress={() => onPick(s)}>
          <Text style={styles.text}>{s}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// Mengatur tampilan saran balasan
const styles = StyleSheet.create({
  // Mengatur posisi dan jarak antar saran
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },

  // Mengatur tampilan tombol saran
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },

  // Mengatur tampilan teks saran
  text: { fontSize: 13, fontWeight: "700", color: colors.primary },
});
