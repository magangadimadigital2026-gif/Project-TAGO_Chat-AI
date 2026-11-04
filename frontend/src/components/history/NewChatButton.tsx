import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../constants/palette";

export function NewChatButton({ onPress }: { onPress: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <Pressable
      style={[styles.fab, { bottom: Math.max(insets.bottom, 12) + 16 }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Buat chat baru"
    >
      <Ionicons name="add" size={22} color="#fff" />
      <Text style={styles.text}>Chat Baru</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    height: 52,
    paddingHorizontal: 22,
    borderRadius: 26,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    elevation: 6,
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  text: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
