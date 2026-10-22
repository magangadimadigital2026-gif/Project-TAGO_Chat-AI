import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { API_URL } from "../constants/api";
import { notify } from "../utils/notify";

export default function Register() {
  const router = useRouter();

  // Menyimpan data input
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Fungsi daftar akun
  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      notify("Peringatan", "Semua kolom harus diisi.");
      return;
    }

    if (password !== confirmPassword) {
      notify("Peringatan", "Konfirmasi password tidak sama.");
      return;
    }

    if (name.trim().length < 2) {
      notify("Peringatan", "Nama minimal 2 karakter.");
      return;
    }

    if (!/^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(email.trim())) {
      notify("Peringatan", "Format email tidak valid, contoh: nama@gmail.com.");
      return;
    }

    if (password.length < 8) {
      notify("Peringatan", "Password minimal 8 karakter.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: password,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        notify("Pendaftaran Gagal", result.error || result.message || "Silakan coba lagi.");
        return;
      }

      notify("Berhasil", "Akun berhasil dibuat. Silakan login.", () =>
        router.replace("/login")
      );
    } catch {
      notify("Gagal", "Tidak dapat terhubung ke server Backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo GOAI di bagian atas */}
        <Image
          source={require("../../assets/images/goai.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Buat Akun Baru</Text>
        <Text style={styles.subtitle}>
          Daftar untuk menikmati rekomendasi makanan.
        </Text>

        {/* Input nama */}
        <Text style={styles.label}>Nama Lengkap</Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan nama lengkap"
          placeholderTextColor="#999999"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        {/* Input email */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan email"
          placeholderTextColor="#999999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Input password */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordWrap}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Masukkan password"
            placeholderTextColor="#999999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword((v) => !v)}
            accessibilityLabel={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#777777"
            />
          </TouchableOpacity>
        </View>

        {/* Konfirmasi password */}
        <Text style={styles.label}>Konfirmasi Password</Text>
        <View style={styles.passwordWrap}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Ulangi password"
            placeholderTextColor="#999999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirm}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowConfirm((v) => !v)}
            accessibilityLabel={showConfirm ? "Sembunyikan password" : "Tampilkan password"}
          >
            <Ionicons
              name={showConfirm ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#777777"
            />
          </TouchableOpacity>
        </View>

        {/* Tombol daftar */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Daftar</Text>
          )}
        </TouchableOpacity>

        {/* Link ke Login */}
        <View style={styles.loginRow}>
          <Text style={styles.normalText}>Sudah punya akun? </Text>
          <TouchableOpacity onPress={() => router.replace("/login")}>
            <Text style={styles.link}>Login</Text>
          </TouchableOpacity>
        </View>

        {/* Logo TAGO paling bawah */}
        <View style={styles.footer}>
          <Text style={styles.byText}>by</Text>
          <Image
            source={require("../../assets/images/logo_tago.jpg")}
            style={styles.tagoLogo}
            resizeMode="contain"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 24,
  },
  logo: {
    width: 110,
    height: 110,
    alignSelf: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#202020",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#777777",
    lineHeight: 21,
    marginBottom: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 7,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#222222",
    marginBottom: 14,
  },
  passwordWrap: {
    position: "relative",
    marginBottom: 14,
  },
  passwordInput: {
    marginBottom: 0,
    paddingRight: 48,
  },
  eyeButton: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    height: 50,
    backgroundColor: "#0029FF",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  normalText: {
    fontSize: 14,
    color: "#777777",
  },
  link: {
    fontSize: 14,
    color: "#0029FF",
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
  },
  byText: {
    fontSize: 13,
    color: "#777777",
    marginRight: 8,
  },
  tagoLogo: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
});