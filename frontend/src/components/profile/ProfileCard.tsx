import { StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "../ui";
import { InfoRow } from "./InfoRow";

type Props = { name: string; email: string; onBack: () => void };

export function ProfileCard({ name, email, onBack }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>👤</Text>
      </View>

      <Text style={styles.title}>Profil Saya</Text>
      <Text style={styles.subtitle}>Informasi akun pengguna GOAI</Text>

      <InfoRow icon="👤" label="Nama" value={name || "Nama pengguna"} />
      <InfoRow icon="✉️" label="Email" value={email || "Email pengguna"} />

      <PrimaryButton title="Kembali ke Chat" onPress={onBack} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 550,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#E7F0FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  avatarText: { fontSize: 42 },
  title: { fontSize: 24, fontWeight: "700", color: "#111827", marginBottom: 5 },
  subtitle: { fontSize: 14, color: "#6B7280", textAlign: "center", marginBottom: 25 },
  button: { width: "100%", borderRadius: 14, marginTop: 15 },
});
