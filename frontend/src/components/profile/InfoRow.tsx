import { StyleSheet, Text, View } from "react-native";

export function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.box}>
      <View style={styles.icon}>
        <Text>{icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: "100%",
    minHeight: 70,
    backgroundColor: "#F7F9FC",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 12,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E7F0FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  content: { flex: 1 },
  label: { fontSize: 12, color: "#6B7280", marginBottom: 3 },
  value: { fontSize: 15, fontWeight: "600", color: "#111827" },
});
