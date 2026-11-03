import { ReactNode } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
  compact?: boolean; // spasi lebih rapat (dipakai halaman Register)
};

// Kerangka halaman Login & Register: logo, judul, isi, footer TAGO
export function AuthLayout({ title, subtitle, children, compact }: Props) {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.content, compact && styles.contentCompact]}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require("../../../assets/images/goai.png")}
          style={[styles.logo, compact && styles.logoCompact]}
          resizeMode="contain"
        />

        <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
        <Text style={[styles.subtitle, compact && styles.subtitleCompact]}>{subtitle}</Text>

        {children}

        <View style={[styles.footer, compact && styles.footerCompact]}>
          <Text style={styles.by}>by</Text>
          <Image
            source={require("../../../assets/images/logo_tago.jpg")}
            style={styles.tago}
            resizeMode="contain"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 28, paddingVertical: 32 },
  contentCompact: { paddingVertical: 24 },
  logo: { width: 110, height: 110, alignSelf: "center", marginBottom: 28 },
  logoCompact: { marginBottom: 24 },
  title: { fontSize: 26, fontWeight: "bold", color: "#202020", marginBottom: 8 },
  titleCompact: { fontSize: 25 },
  subtitle: { fontSize: 14, color: "#777777", lineHeight: 21, marginBottom: 28 },
  subtitleCompact: { marginBottom: 22 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 42 },
  footerCompact: { marginTop: 28 },
  by: { fontSize: 13, color: "#777777", marginRight: 8 },
  tago: { width: 36, height: 36, borderRadius: 8 },
});
