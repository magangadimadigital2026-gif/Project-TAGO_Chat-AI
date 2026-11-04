import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/palette";
import type { Rec } from "../../services/chat";

export function RecommendationCard({ rec }: { rec: Rec }) {
  return (
    <View style={styles.rec}>
      <View style={styles.thumb}>
        {rec.imageUrl ? (
          <Image source={{ uri: rec.imageUrl }} style={styles.img} />
        ) : (
          <Ionicons name="restaurant-outline" size={24} color={colors.primary} />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{rec.name}</Text>
        <Text style={styles.reason}>{rec.reason}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rec: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.soft,
    borderRadius: 12,
    padding: 10,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  img: { width: 52, height: 52 },
  name: { fontSize: 14, fontWeight: "700", color: colors.ink },
  reason: { fontSize: 13, color: colors.muted, marginTop: 2 },
});
