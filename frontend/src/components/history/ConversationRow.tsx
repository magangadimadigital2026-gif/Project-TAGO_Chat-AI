import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/palette";
import type { ConversationItem } from "../../services/chat";
import { timeLabel } from "../../utils/date";

type Props = {
  item: ConversationItem;
  onOpen: () => void;
  onDelete: () => void;
};

export function ConversationRow({ item, onOpen, onDelete }: Props) {
  return (
    <View style={styles.row}>
      <Pressable
        style={styles.conversation}
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`Buka percakapan ${item.title}`}
      >
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.sub} numberOfLines={1}>{item.lastMessage}</Text>
      </Pressable>

      <Text style={styles.time}>{timeLabel(item.updatedAt)}</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Hapus percakapan ${item.title}`}
        hitSlop={10}
        onPress={onDelete}
        style={styles.delete}
      >
        <Ionicons name="trash-outline" size={20} color={colors.muted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  conversation: { flex: 1 },
  title: { fontSize: 15, fontWeight: "700", color: colors.ink },
  sub: { fontSize: 13, color: colors.muted, marginTop: 3 },
  time: { fontSize: 12, color: colors.muted },
  delete: { padding: 4, alignItems: "center", justifyContent: "center" },
});
