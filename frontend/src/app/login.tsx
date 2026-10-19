import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";

export default function Login() {
  const router = useRouter();

  // Menyimpan data input
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Fungsi untuk login
  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Peringatan", "Email dan password harus diisi.");
      return;
    }

    try {
      setLoading(true);

      // Mengirim email dan password ke Backend
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const result = await response.json();

      // Memeriksa hasil login
      if (!response.ok) {
        Alert.alert(
          "Login Gagal",
          result.message || "Email atau password salah."
        );
        return;
      }

      // Mengambil token dan data pengguna
      const token = result.data?.token;
      const user = result.data?.user;

      if (!token) {
        Alert.alert("Login Gagal", "Token tidak ditemukan dari server.");
        return;
      }

      // Menyimpan data login
      await AsyncStorage.setItem("token", token);

      if (user?.name) {
        await AsyncStorage.setItem("userName", user.name);
      }

      if (user?.email) {
        await AsyncStorage.setItem("userEmail", user.email);
      }

      // Berpindah ke halaman chat
      router.replace("/chat");
    } catch {
      Alert.alert(
        "Gagal",
        "Tidak dapat terhubung ke server. Periksa koneksi Backend."
      );
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
        {/* Logo GOAI */}
        <Image
          source={require("../../assets/images/goai.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Selamat Datang</Text>
        <Text style={styles.subtitle}>
          Masuk untuk mendapatkan rekomendasi makanan.
        </Text>

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
        <TextInput
          style={styles.input}
          placeholder="Masukkan password"
          placeholderTextColor="#999999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Tombol login */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        {/* Link ke halaman Register */}
        <View style={styles.registerRow}>
          <Text style={styles.normalText}>Belum punya akun? </Text>
          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text style={styles.link}>Daftar</Text>
          </TouchableOpacity>
        </View>

        {/* Logo TAGO di bagian bawah */}
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
    paddingVertical: 32,
  },
  logo: {
    width: 110,
    height: 110,
    alignSelf: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#202020",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#777777",
    lineHeight: 21,
    marginBottom: 28,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#222222",
    marginBottom: 18,
  },
  button: {
    height: 50,
    backgroundColor: "#2439C6",
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
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 22,
  },
  normalText: {
    fontSize: 14,
    color: "#777777",
  },
  link: {
    fontSize: 14,
    color: "#2439C6",
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 42,
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
