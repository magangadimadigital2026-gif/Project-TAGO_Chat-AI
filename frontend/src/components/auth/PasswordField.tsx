import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

type Props = Omit<TextInputProps, "secureTextEntry"> & { label: string; compact?: boolean };

// Input password + tombol mata (state tampil/sembunyi ada di dalam komponen)
export function PasswordField({ label, compact, style, ...input }: Props) {
  const [show, setShow] = useState(false);

  return (
    <>
      <Text style={[styles.label, compact && styles.labelCompact]}>{label}</Text>
      <View style={[styles.wrap, compact && styles.wrapCompact]}>
        <TextInput
          placeholderTextColor="#999999"
          autoCapitalize="none"
          style={[styles.input, compact && styles.inputCompact, style]}
          secureTextEntry={!show}
          {...input}
        />
        <Pressable
          style={styles.eye}
          onPress={() => setShow((v) => !v)}
          accessibilityLabel={show ? "Sembunyikan password" : "Tampilkan password"}
        >
          <Ionicons name={show ? "eye-off-outline" : "eye-outline"} size={22} color="#777777" />
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: "600", color: "#333333", marginBottom: 8 },
  labelCompact: { marginBottom: 7 },
  wrap: { position: "relative", marginBottom: 18 },
  wrapCompact: { marginBottom: 14 },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingRight: 48,
    fontSize: 15,
    color: "#222222",
  },
  inputCompact: { height: 48 },
  eye: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 48,
    alignItems: "center",
    justifyContent: "center",
  },
});
