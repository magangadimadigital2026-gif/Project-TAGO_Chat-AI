import { Image, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../constants/palette";
import { IconButton } from "../ui";

type Props = { menuOpen: boolean; onHistory: () => void; onMenu: () => void };

export function ChatHeader({ menuOpen, onHistory, onMenu }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <View style={styles.logoWrap}>
        <Image source={require("../../../assets/images/goai.png")} style={styles.logo} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>GoAI</Text>
        <Text style={styles.subtitle}>Asisten rekomendasi makanan</Text>
      </View>
      <IconButton name="time-outline" label="Riwayat chat" onPress={onHistory} />
      <IconButton name="person-outline" label="Menu akun" active={menuOpen} onPress={onMenu} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: colors.primary,
  },
  logoWrap: { backgroundColor: "#fff", borderRadius: 12, padding: 3 },
  logo: { width: 36, height: 36, borderRadius: 9 },
  title: { color: "#fff", fontSize: 18, fontWeight: "700" },
  subtitle: { color: "rgba(255,255,255,0.85)", fontSize: 12 },
});
