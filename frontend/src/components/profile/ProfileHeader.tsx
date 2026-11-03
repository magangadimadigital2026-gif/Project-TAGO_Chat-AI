import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/palette";

export function ProfileHeader({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable style={styles.back} onPress={onBack}>
        <Text style={styles.backText}>‹</Text>
      </Pressable>
      <Text style={styles.title}>Profil</Text>
      <View style={styles.space} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: "100%",
    maxWidth: 1100,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  back: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  backText: { fontSize: 32, color: colors.primary, lineHeight: 35 },
  title: { fontSize: 22, fontWeight: "700", color: "#111827" },
  space: { width: 42 },
});
