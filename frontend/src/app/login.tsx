import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import { API_URL } from "@/constants/api";

export default function LoginScreen() {
  const { width } = useWindowDimensions();

  const isSmallScreen = width < 400;
  const isDesktop = width >= 768;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert("Email Kosong", "Silakan masukkan email.");
      return;
    }

    if (!password) {
      Alert.alert("Password Kosong", "Silakan masukkan password.");
      return;
    }

    try {
      setIsLoading(true);

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

      console.log("Data login:", result);

      if (!response.ok || !result.success) {
        Alert.alert(
          "Login Gagal",
          result.message || "Email atau password salah.",
        );
        return;
      }

      const token = result.data?.token;
      const name = result.data?.user?.name;

      if (!token) {
        Alert.alert("Login Gagal", "Token login tidak ditemukan.");
        return;
      }

      // Simpan token login
      await AsyncStorage.setItem("token", token);

      // Simpan nama user
      if (name) {
        await AsyncStorage.setItem("userName", name);
      }

      console.log("Token tersimpan");
      console.log("Nama user tersimpan:", name);

      router.replace("/home");
    } catch (error) {
      console.log("Error login:", error);

      Alert.alert("Login Gagal", "Tidak dapat terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop && styles.desktopContent,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* COVER */}

        <View
          style={[
            styles.cover,
            isSmallScreen && styles.coverSmall,
            isDesktop && styles.coverDesktop,
          ]}
        >
          <View style={styles.brandCircle}>
            <Ionicons name="restaurant" size={28} color="#023E8A" />
          </View>

          <Text style={styles.brand}>TAGO</Text>

          <Text style={styles.coverTitle}>Selamat Datang!</Text>

          <Text style={styles.coverSubtitle}>
            Login dan temukan rekomendasi makananmu
          </Text>

          <Image
            source={require("../../assets/images/burger.jpg")}
            style={styles.foodImage}
            resizeMode="cover"
          />
        </View>

        {/* LOGIN CARD */}

        <View
          style={[
            styles.card,
            isSmallScreen && styles.cardSmall,
            isDesktop && styles.cardDesktop,
          ]}
        >
          <Text style={styles.title}>Login</Text>

          <Text style={styles.description}>
            Masuk untuk melanjutkan ke Food AI
          </Text>

          {/* EMAIL */}

          <Text style={styles.label}>Email</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#777777" />

            <TextInput
              style={styles.input}
              placeholder="Masukkan email"
              placeholderTextColor="#999999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* PASSWORD */}

          <Text style={styles.label}>Password</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#777777" />

            <TextInput
              style={styles.input}
              placeholder="Masukkan password"
              placeholderTextColor="#999999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* LOGIN BUTTON */}

          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? "Memproses..." : "Login"}
            </Text>
          </Pressable>

          {/* REGISTER */}

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Belum punya akun?</Text>

            <Pressable onPress={() => router.push("/register")}>
              <Text style={styles.registerLink}>Daftar</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.footer}>Powered by TAGO</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E3E9F1",
  },

  scrollContent: {
    paddingBottom: 30,
  },

  desktopContent: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },

  /* COVER */

  cover: {
    height: 345,
    backgroundColor: "#023E8A",
    paddingTop: 55,
    paddingHorizontal: 25,
    position: "relative",
    overflow: "hidden",
  },

  coverSmall: {
    height: 320,
  },

  coverDesktop: {
    height: 370,
  },

  brandCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  brand: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 20,
  },

  coverTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 7,
  },

  coverSubtitle: {
    color: "#DCE8F4",
    fontSize: 14,
    maxWidth: 230,
    lineHeight: 20,
  },

  foodImage: {
    position: "absolute",
    width: 145,
    height: 145,
    borderRadius: 73,
    right: 18,
    bottom: 28,
    borderWidth: 6,
    borderColor: "#FFFFFF",
  },

  /* CARD */

  card: {
    width: "91%",
    maxWidth: 440,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginTop: -42,
  },

  cardSmall: {
    width: "92%",
    padding: 21,
    borderRadius: 21,
  },

  cardDesktop: {
    maxWidth: 470,
    marginTop: -48,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },

  description: {
    fontSize: 14,
    color: "#777777",
    marginBottom: 25,
  },

  /* INPUT */

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 8,
  },

  inputContainer: {
    height: 52,
    borderWidth: 1,
    borderColor: "#D7DCE2",
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 18,
    backgroundColor: "#FAFAFA",
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#222222",
  },

  /* BUTTON */

  loginButton: {
    height: 52,
    backgroundColor: "#023E8A",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  buttonPressed: {
    opacity: 0.75,
  },

  /* REGISTER */

  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    gap: 5,
  },

  registerText: {
    fontSize: 13,
    color: "#777777",
  },

  registerLink: {
    fontSize: 13,
    color: "#023E8A",
    fontWeight: "800",
  },

  /* FOOTER */

  footer: {
    textAlign: "center",
    color: "#888888",
    fontSize: 12,
    marginTop: 22,
  },
});
