import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/palette";

// "Belum punya akun? Daftar" / "Sudah punya akun? Login"
export function AuthSwitchLink({
  text,
  linkText,
  onPress,
  compact,
}: {
  text: string;
  linkText: string;
  onPress: () => void;
  compact?: boolean;
}) {
  return (
    <View style={[styles.row, compact && styles.rowCompact]}>
      <Text style={styles.text}>{text} </Text>
      <Pressable onPress={onPress}>
        <Text style={styles.link}>{linkText}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "center", marginTop: 22 },
  rowCompact: { marginTop: 20 },
  text: { fontSize: 14, color: "#777777" },
  link: { fontSize: 14, color: colors.primary, fontWeight: "bold" },
});
