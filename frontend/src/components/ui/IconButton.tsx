import Ionicons from "@expo/vector-icons/Ionicons";
import { ComponentProps } from "react";
import { Pressable, StyleSheet } from "react-native";
import { colors } from "../../constants/palette";

type Props = {
  name: ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
  active?: boolean;
};

// Tombol ikon bulat di atas header biru
export function IconButton({ name, label, onPress, active }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.btn, active && styles.btnOn]}
      onPress={onPress}
    >
      <Ionicons name={name} size={22} color={active ? colors.primary : "#fff"} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  btnOn: { backgroundColor: "#fff" },
});
