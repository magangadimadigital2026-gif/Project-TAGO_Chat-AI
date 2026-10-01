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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { API_URL } from "../constants/api";

export default function LoginScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // =====================================================
  // RESPONSIVE
  // =====================================================

  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 1000;
  const isDesktop = width >= 1000;

  // =====================================================
  // UKURAN HEADER
  // =====================================================

  const headerHeight = isMobile
    ? 380
    : isTablet
      ? 450
      : Math.min(Math.max(width * 0.30, 400), 540);

  // =====================================================
  // UKURAN CARD LOGIN
  // =====================================================

  const cardWidth = isMobile
    ? width - 44
    : isTablet
      ? Math.min(width - 80, 700)
      : Math.min(width - 160, 850);

  // =====================================================
  // STATE LOGIN
  // =====================================================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // =====================================================
  // HANDLE LOGIN
  // =====================================================

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(
        "Peringatan",
        "Email dan password wajib diisi."
      );
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

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
        Alert.alert(
          "Login Gagal",
          "Token tidak ditemukan."
        );
        return;
      }

      // Simpan token
      await AsyncStorage.setItem("token", token);

      // Simpan nama user
      if (name) {
        await AsyncStorage.setItem("userName", name);
      }

      console.log("Token berhasil disimpan");

      // Pindah ke halaman Home
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
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          {
            minHeight: height,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <View
          style={[
            styles.header,
            {
              height: headerHeight,
            },
          ]}
        >

          {/* ================================================= */}
          {/* LOGO TAGO */}
          {/* ================================================= */}

          <View
            style={[
              styles.logoSection,
              {
                left: isMobile
                  ? 24
                  : isTablet
                    ? 45
                    : 55,

                top:
                  insets.top +
                  (isMobile ? 5 : 10),
              },
            ]}
          >
            <Image
              source={require("../../assets/images/logo_tago.jpg")}
              style={[
                styles.logo,
                {
                  width: isMobile
                    ? 72
                    : isTablet
                      ? 90
                      : 105,

                  height: isMobile
                    ? 72
                    : isTablet
                      ? 90
                      : 105,
                },
              ]}
              resizeMode="contain"
            />

            <Text
              style={[
                styles.tagoText,
                {
                  fontSize: isMobile
                    ? 23
                    : isTablet
                      ? 27
                      : 30,
                },
              ]}
            >
              TAGO
            </Text>
          </View>


          {/* ================================================= */}
          {/* GAMBAR ORANG */}
          {/* ================================================= */}

          <Image
            source={require("../../assets/images/orang.png")}
            style={[
              styles.personImage,
              {
                width: isMobile
                  ? width * 0.44
                  : isTablet
                    ? width * 0.37
                    : width * 0.32,

                height: isMobile
                  ? headerHeight * 0.55
                  : isTablet
                    ? headerHeight * 0.62
                    : headerHeight * 0.70,

                right: isMobile
                  ? -8
                  : isTablet
                    ? 20
                    : 50,

                bottom: isMobile
                  ? 5
                  : 8,
              },
            ]}
            resizeMode="contain"
          />


          {/* ================================================= */}
          {/* HIASAN PUTIH */}
          {/* ================================================= */}
{/*
          <View
            style={[
              styles.decorationOne,
              {
                right: isMobile
                  ? 18
                  : isTablet
                    ? 25
                    : 55,

                top: isMobile
                  ? insets.top + 115
                  : isTablet
                    ? 125
                    : 100,
              },
            ]}
          />

 
          <View
            style={[
              styles.decorationTwo,
              {
                right: isMobile
                  ? 50
                  : isTablet
                    ? 50
                    : 80,

                top: isMobile
                  ? insets.top + 140
                  : isTablet
                    ? 155
                    : 125,
              },
            ]}
          />
*/}

          {/* ================================================= */}
          {/* TEKS HEADER */}
          {/* ================================================= */}

          <View
            style={[
              styles.headerText,
              {
                left: isMobile
                  ? 24
                  : isTablet
                    ? 45
                    : 55,

                bottom: isMobile
                  ? 30
                  : isTablet
                    ? 45
                    : 55,

                width: isMobile
                  ? width * 0.67
                  : isTablet
                    ? width * 0.55
                    : width * 0.45,
              },
            ]}
          >

            <Text
              style={[
                styles.welcomeTitle,
                {
                  fontSize: isMobile
                    ? 30
                    : isTablet
                      ? 40
                      : 48,
                },
              ]}
            >
              Selamat Datang!
            </Text>

            <Text
              style={[
                styles.welcomeSubtitle,
                {
                  fontSize: isMobile
                    ? 16
                    : isTablet
                      ? 19
                      : 21,

                  lineHeight: isMobile
                    ? 22
                    : isTablet
                      ? 27
                      : 29,
                },
              ]}
            >
              Login dan temukan rekomendasi
            </Text>

            <Text
              style={[
                styles.welcomeSubtitle,
                {
                  fontSize: isMobile
                    ? 16
                    : isTablet
                      ? 19
                      : 21,

                  lineHeight: isMobile
                    ? 22
                    : isTablet
                      ? 27
                      : 29,
                },
              ]}
            >
              makananmu
            </Text>

          </View>
        </View>


        {/* ================================================= */}
        {/* LOGIN CARD */}
        {/* ================================================= */}

        <View
          style={[
            styles.loginCard,
            {
              width: cardWidth,

              marginTop: isMobile
                ? 14
                : isTablet
                  ? 20
                  : 28,

              paddingHorizontal: isMobile
                ? 24
                : isTablet
                  ? 35
                  : 45,

              paddingVertical: isMobile
                ? 25
                : isTablet
                  ? 32
                  : 40,
            },
          ]}
        >

          {/* TITLE */}

          <Text
            style={[
              styles.loginTitle,
              {
                fontSize: isMobile
                  ? 35
                  : isTablet
                    ? 40
                    : 44,
              },
            ]}
          >
            Login
          </Text>

          <Text
            style={[
              styles.loginSubtitle,
              {
                fontSize: isMobile
                  ? 16
                  : isTablet
                    ? 18
                    : 19,
              },
            ]}
          >
            Masuk untuk melanjutkan ke Food AI
          </Text>


          {/* ================================================= */}
          {/* EMAIL */}
          {/* ================================================= */}

          <Text
            style={[
              styles.label,
              {
                fontSize: isMobile
                  ? 18
                  : isTablet
                    ? 19
                    : 20,
              },
            ]}
          >
            Email
          </Text>

          <View
            style={[
              styles.inputContainer,
              {
                height: isMobile
                  ? 58
                  : isTablet
                    ? 62
                    : 64,
              },
            ]}
          >

            <Ionicons
              name="mail-outline"
              size={isMobile ? 23 : 25}
              color="#4D6FB7"
            />

            <TextInput
              style={[
                styles.input,
                {
                  fontSize: isMobile
                    ? 16
                    : 17,
                },
              ]}
              placeholder="Masukkan email"
              placeholderTextColor="#5875B5"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

          </View>


          {/* ================================================= */}
          {/* PASSWORD */}
          {/* ================================================= */}

          <Text
            style={[
              styles.label,
              {
                fontSize: isMobile
                  ? 18
                  : isTablet
                    ? 19
                    : 20,
              },
            ]}
          >
            Password
          </Text>

          <View
            style={[
              styles.inputContainer,
              {
                height: isMobile
                  ? 56
                  : isTablet
                    ? 60
                    : 62,
              },
            ]}
          >

            <Ionicons
              name="lock-closed-outline"
              size={isMobile ? 24 : 26}
              color="#4D6FB7"
            />

            <TextInput
              style={[
                styles.input,
                {
                  fontSize: isMobile
                    ? 16
                    : 17,
                },
              ]}
              placeholder="Masukkan password"
              placeholderTextColor="#5875B5"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />

            <Pressable
              onPress={() =>
                setShowPassword(!showPassword)
              }
            >
              <Ionicons
                name={
                  showPassword
                    ? "eye-outline"
                    : "eye-off-outline"
                }
                size={isMobile ? 24 : 26}
                color="#4D6FB7"
              />
            </Pressable>

          </View>


          {/* ================================================= */}
          {/* BUTTON LOGIN */}
          {/* ================================================= */}

          <Pressable
            style={({ pressed }) => [
              styles.button,
              {
                height: isMobile ? 56 : isTablet ? 62 : 64,
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
            onPress={handleLogin}
          >
            <Text
              style={[
                styles.buttonText,
                {
                  fontSize: isMobile
                    ? 18
                    : isTablet
                      ? 19
                      : 20,
                },
              ]}
            >
              Login
            </Text>
          </Pressable>


          {/* ================================================= */}
          {/* REGISTER */}
          {/* ================================================= */}

          <View
            style={[
              styles.registerContainer,
              {
                marginTop: isMobile
                  ? 22
                  : 25,
              },
            ]}
          >

            <Text
              style={[
                styles.registerText,
                {
                  fontSize: isMobile
                    ? 16
                    : 17,
                },
              ]}
            >
              Belum punya akun?
            </Text>

            <Pressable
              onPress={() =>
                router.push("/register")
              }
            >
              <Text
                style={[
                  styles.registerLink,
                  {
                    fontSize: isMobile
                      ? 16
                      : 17,
                  },
                ]}
              >
                Daftar
              </Text>
            </Pressable>

          </View>

        </View>


        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <Text
          style={[
            styles.footer,
            {
              fontSize: isMobile
                ? 14
                : 15,
            },
          ]}
        >
          Powered by TAGO
        </Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}


// =========================================================
// STYLE
// =========================================================

const styles = StyleSheet.create({

  // =======================================================
  // CONTAINER
  // =======================================================

  container: {
    flex: 1,
    backgroundColor: "#EAF4FF",
  },

  scrollContainer: {
    alignItems: "center",
    paddingBottom: 30,
  },


  // =======================================================
  // HEADER
  // =======================================================

  header: {
    width: "100%",

    backgroundColor: "#0647D8",

    position: "relative",

    overflow: "hidden",

    borderBottomLeftRadius: 55,
    borderBottomRightRadius: 55,
  },


  // =======================================================
  // LOGO TAGO
  // =======================================================

  logoSection: {
    position: "absolute",

    alignItems: "flex-start",

    zIndex: 10,
  },

  logo: {
    width: 76,
    height: 76,
  },

  tagoText: {
    color: "#FFFFFF",

    fontWeight: "800",

    marginTop: 2,

    includeFontPadding: false,
  },


  // =======================================================
  // GAMBAR ORANG
  // =======================================================

  personImage: {
    position: "absolute",

    zIndex: 2,
  },


  // =======================================================
  // HIASAN
  // =======================================================

  decorationOne: {
    position: "absolute",

    width: 8,
    height: 30,

    backgroundColor: "#FFFFFF",

    borderRadius: 10,

    transform: [
      {
        rotate: "30deg",
      },
    ],

    zIndex: 4,
  },

  decorationTwo: {
    position: "absolute",

    width: 7,
    height: 23,

    backgroundColor: "#FFFFFF",

    borderRadius: 10,

    transform: [
      {
        rotate: "55deg",
      },
    ],

    zIndex: 4,
  },


  // =======================================================
  // HEADER TEXT
  // =======================================================

  headerText: {
    position: "absolute",

    zIndex: 5,
  },

  welcomeTitle: {
    color: "#FFFFFF",

    fontWeight: "800",

    marginBottom: 8,

    includeFontPadding: false,
  },

  welcomeSubtitle: {
    color: "#FFFFFF",

    fontWeight: "500",

    includeFontPadding: false,
  },


  // =======================================================
  // LOGIN CARD
  // =======================================================

  loginCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    shadowColor: "#0647D8",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 6,
  },


  // =======================================================
  // LOGIN TITLE
  // =======================================================

  loginTitle: {
    color: "#111827",

    fontWeight: "800",

    marginBottom: 4,
  },

  loginSubtitle: {
    color: "#35588F",
    marginBottom: 26,
  },


  // =======================================================
  // LABEL
  // =======================================================

  label: {
    color: "#101827",
    fontWeight: "700",
    marginBottom: 7,
  },


  // =======================================================
  // INPUT
  // =======================================================

  inputContainer: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#8AB9FF",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 18,
    backgroundColor: "#FBFDFF",
  },

  input: {
    flex: 1,
    color: "#111827",
    marginLeft: 11,
  },


  // =======================================================
  // LOGIN BUTTON
  // =======================================================

  button: {
    width: "100%",
    backgroundColor: "#0647D8",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },


  // =======================================================
  // REGISTER
  // =======================================================

  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  registerText: {
    color: "#35588F",
  },

  registerLink: {
    color: "#0647D8",
    fontWeight: "800",
    marginLeft: 7,
  },


  // =======================================================
  // FOOTER
  // =======================================================

  footer: {
    color: "#5273A7",
    marginTop: 18,
    textAlign: "center",
    marginBottom: 5,
  },
});
