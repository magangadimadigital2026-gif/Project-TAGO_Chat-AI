import { StyleSheet, Text, TextInput, TextInputProps } from "react-native";
import { colors } from "../../constants/palette";

export type FieldProps = TextInputProps & { label: string; compact?: boolean };

export function FormField({ label, compact, style, ...input }: FieldProps) {
  return (
    <>
      <Text style={[styles.label, compact && styles.labelCompact]}>{label}</Text>
      <TextInput
        placeholderTextColor="#999999"
        style={[styles.input, compact && styles.inputCompact, style]}
        {...input}
      />
    </>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: "600", color: "#333333", marginBottom: 8 },
  labelCompact: { marginBottom: 7 },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#222222",
    marginBottom: 18,
  },
  inputCompact: { height: 48, marginBottom: 14 },
});
