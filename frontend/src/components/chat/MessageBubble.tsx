import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/palette";
import type { Msg } from "../../types/chat";
import { RecommendationCard } from "./RecommendationCard";

export function MessageBubble({ msg, onRetry }: { msg: Msg; onRetry: () => void }) {
  const mine = msg.role === "user";
  return (
    <View style={{ alignItems: mine ? "flex-end" : "flex-start", marginBottom: 14 }}>
      <View style={[styles.bubble, mine ? styles.mine : styles.ai]}>
        <Text style={[styles.text, mine && { color: colors.onPrimary }]}>{msg.text}</Text>
        {!mine && msg.recs?.map((r) => <RecommendationCard key={r.name} rec={r} />)}
      </View>

      {msg.failed && (
        <Pressable onPress={onRetry} style={styles.failed}>
          <Ionicons name="alert-circle" size={14} color={colors.danger} />
          <Text style={styles.failedText}>Gagal terkirim. Ketuk untuk coba lagi.</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: "85%", paddingVertical: 12, paddingHorizontal: 16, gap: 10 },
  mine: { backgroundColor: colors.primary, borderRadius: 24, borderBottomRightRadius: 6 },
  ai: {
    backgroundColor: colors.card,
    borderRadius: 24,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: { fontSize: 15, lineHeight: 22, color: colors.ink },
  failed: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  failedText: { fontSize: 12, color: colors.danger },
});
