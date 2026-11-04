import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../constants/palette";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  sending: boolean;
};

export function ChatInput({ value, onChange, onSend, sending }: Props) {
  const insets = useSafeAreaInsets();
  const disabled = !value.trim() || sending;

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <TextInput
        style={styles.input}
        placeholder="Tulis pesan…"
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChange}
        multiline
        maxLength={1000}
      />
      <Pressable
        accessibilityLabel="Kirim"
        style={[styles.send, disabled && { opacity: 0.5 }]}
        disabled={disabled}
        onPress={onSend}
      >
        <Ionicons name="send" size={20} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 48,
    borderRadius: 24,
    backgroundColor: colors.soft,
    paddingHorizontal: 18,
    paddingTop: 13,
    paddingBottom: 13,
    fontSize: 15,
    color: colors.ink,
  },
  send: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
