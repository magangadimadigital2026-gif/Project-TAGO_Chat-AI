import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, TextInput, View } from "react-native";
import { colors } from "../../constants/palette";

export function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.search}>
      <Ionicons name="search" size={20} color={colors.muted} />
      <TextInput
        style={styles.input}
        placeholder="Cari percakapan"
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.soft,
    marginHorizontal: 20,
    marginTop: 20,
    paddingHorizontal: 16,
  },
  input: { flex: 1, fontSize: 14, color: colors.ink },
});
