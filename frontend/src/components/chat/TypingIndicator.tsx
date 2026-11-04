import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/palette";

export function TypingIndicator() {
  return (
    <View style={styles.bubble}>
      <ActivityIndicator size="small" color={colors.primary} />
      <Text style={styles.text}>GoAI sedang mengetik…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: "85%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderRadius: 24,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: { fontSize: 15, lineHeight: 22, color: colors.muted },
});
