import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/palette";

export function SuggestionChips({
  suggestions,
  onPick,
}: {
  suggestions: string[];
  onPick: (s: string) => void;
}) {
  return (
    <View style={styles.chips}>
      {suggestions.map((s) => (
        <Pressable key={s} style={styles.chip} onPress={() => onPick(s)}>
          <Text style={styles.text}>{s}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  text: { fontSize: 13, fontWeight: "600", color: colors.ink },
});
