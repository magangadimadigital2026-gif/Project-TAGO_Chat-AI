import { Ionicons } from "@expo/vector-icons";
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
  useWindowDimensions,
  View,
} from "react-native";
import { API_URL } from "../constants/api";

export default function LoginScreen() {
  const { width } = useWindowDimensions();

  const isSmallScreen = width < 380;
  const isDesktop = width > 700;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Peringatan", "Email dan password wajib diisi.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const result = await response.json();

      console.log("Data login:", result);

      if (!response.ok || !result.token) {
        Alert.alert(
          "Login Gagal",
          result.message || "Email atau password salah."
        );
        return;
      }

      const token = result.token;
      const name = result.user?.name;

      if (!token) {
        Alert.alert("Login Gagal", "Token tidak ditemukan.");
        return;
      }

      await AsyncStorage.setItem("token", token);

      if (name) {
        await AsyncStorage.setItem("userName", name);
      }

      console.log("Token tersimpan:", token);

      router.replace("/home");
    } catch (error) {
      console.error("Error login:", error);

      Alert.alert(
        "Koneksi Gagal",
        "Tidak dapat terhubung ke server."
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View
          style={[
            styles.cover,
            isSmallScreen && styles.coverSmall,
            isDesktop && styles.coverDesktop,
          ]}
        >
          {/* LOGO TAGO */}
          <Image
            source={require("../../assets/images/logo-tago.webp")}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* BURGER */}
          <View
            style={[
              styles.foodFrame,
              isSmallScreen && styles.foodFrameSmall,
              isDesktop && styles.foodFrameDesktop,
            ]}
          >
            <Image
              source={require("../../assets/images/burger.jpg")}
              style={styles.foodImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* FORM */}
        <View
          style={[
            styles.formContainer,
            isDesktop && styles.formContainerDesktop,
          ]}
        >
          <Text style={styles.title}>Selamat Datang!</Text>

          <Text style={styles.subtitle}>
            Silakan login untuk melanjutkan
          </Text>

          {/* EMAIL */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={21}
              color="#6B7280"
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* PASSWORD */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={21}
              color="#6B7280"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />

            <Pressable
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={
                  showPassword
                    ? "eye-outline"
                    : "eye-off-outline"
                }
                size={21}
                color="#6B7280"
              />
            </Pressable>
          </View>

          {/* LOGIN BUTTON */}
          <Pressable
            style={styles.button}
            onPress={handleLogin}
          >
            <Text style={styles.buttonText}>Login</Text>
          </Pressable>

          {/* REGISTER */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              Belum punya akun?
            </Text>

            <Pressable
              onPress={() => router.push("/register")}
            >
              <Text style={styles.registerLink}>
                {" "}
                Daftar
              </Text>
            </Pressable>
          </View>
        </View>

        {/* FOOTER */}
        <Text style={styles.footer}>
          Powered by TAGO
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },

  // =========================
  // HEADER
  // =========================

  cover: {
    height: 270,
    backgroundColor: "#023E8A",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },

  coverSmall: {
    height: 240,
  },

  coverDesktop: {
    height: 320,
  },

  logo: {
    width: 85,
    height: 50,
    marginBottom: 20,
  },

  // Lingkaran putih untuk burger
  foodFrame: {
    position: "absolute",
    width: 145,
    height: 145,
    borderRadius: 73,
    right: 18,
    bottom: 28,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  foodFrameSmall: {
    width: 120,
    height: 120,
    borderRadius: 60,
    right: 12,
    bottom: 25,
  },

  foodFrameDesktop: {
    width: 165,
    height: 165,
    borderRadius: 83,
    right: 25,
    bottom: 30,
  },

  foodImage: {
    width: "86%",
    height: "86%",
    borderRadius: 100,
  },

  // =========================
  // FORM
  // =========================

  formContainer: {
    paddingHorizontal: 28,
    paddingTop: 35,
  },

  formContainerDesktop: {
    width: 500,
    alignSelf: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#023E8A",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 28,
  },

  // =========================
  // INPUT
  // =========================

  inputContainer: {
    height: 52,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    marginLeft: 10,
  },

  // =========================
  // BUTTON
  // =========================

  button: {
    height: 52,
    backgroundColor: "#023E8A",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  // =========================
  // REGISTER
  // =========================

  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 22,
  },

  registerText: {
    color: "#6B7280",
    fontSize: 14,
  },

  registerLink: {
    color: "#023E8A",
    fontSize: 14,
    fontWeight: "700",
  },

  // =========================
  // FOOTER
  // =========================

  footer: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 35,
  },
});
