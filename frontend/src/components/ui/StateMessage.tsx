import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/palette";

// Tampilan tengah layar: judul + keterangan (+ aksi opsional)
export function StateMessage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>{title}</Text>
      {!!subtitle && <Text style={styles.sub}>{subtitle}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 17, fontWeight: "700", color: colors.ink, textAlign: "center" },
  sub: { fontSize: 14, color: colors.muted, marginTop: 6, textAlign: "center" },
});
