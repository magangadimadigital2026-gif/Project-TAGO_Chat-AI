import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/palette";

const EXAMPLES = [
  "Makanan pedas tapi hemat",
  "Sarapan sehat yang cepat",
  "Mie kuah untuk malam hujan",
];

export function EmptyState({ name, onPick }: { name: string; onPick: (t: string) => void }) {
  return (
    <View style={styles.empty}>
      <Image
        source={require("../../../assets/images/goai.png")}
        style={styles.logo}
      />
      <Text style={styles.title}>Hai, {name}!</Text>
      <Text style={styles.sub}>Mau makan apa hari ini?</Text>

      <View style={styles.list}>
        {EXAMPLES.map((t) => (
          <Pressable key={t} style={styles.example} onPress={() => onPick(t)}>
            <Text style={styles.exampleText}>{t}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 24 },
  logo: { width: 96, height: 96, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "700", color: colors.ink },
  sub: { fontSize: 15, color: colors.muted, marginTop: 4 },
  list: { alignSelf: "stretch", gap: 10, marginTop: 16 },
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
  exampleText: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.ink },
});
