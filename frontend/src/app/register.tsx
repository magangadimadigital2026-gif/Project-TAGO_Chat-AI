import { Ionicons } from "@expo/vector-icons";
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

export default function RegisterScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // ==================================
  // RESPONSIVE
  // ==================================

  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 1000;
  const isDesktop = width >= 1000;

  const headerHeight = isMobile
    ? 380
    : isTablet
      ? 450
      : Math.min(Math.max(width * 0.30, 400), 540);

  const cardWidth = isMobile
    ? width - 44
    : isTablet
      ? Math.min(width - 80, 700)
      : Math.min(width - 160, 850);

  // ==================================
  // STATE
  // ==================================

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showKonfirmasiPassword, setShowKonfirmasiPassword] =
    useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // ==================================
  // REGISTER
  // ==================================

  const handleRegister = async () => {
    if (name.trim() === "") {
      Alert.alert("Perhatian", "Nama wajib diisi.");
      return;
    }

    if (email.trim() === "") {
      Alert.alert("Perhatian", "Email wajib diisi.");
      return;
    }

    if (password.trim() === "") {
      Alert.alert("Perhatian", "Password wajib diisi.");
      return;
    }

    if (konfirmasiPassword.trim() === "") {
      Alert.alert("Perhatian", "Konfirmasi password wajib diisi.");
      return;
    }

    if (password !== konfirmasiPassword) {
      Alert.alert("Perhatian", "Konfirmasi password tidak sama.");
      return;
    }

    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
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

      const result = await response.json();

      console.log("Hasil register:", result);

      if (response.ok && result.token) {
        Alert.alert(
          "Registrasi Berhasil",
          result.message || "Akun berhasil dibuat.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/login"),
            },
          ],
        );
      } else {
        Alert.alert(
          "Registrasi Gagal",
          result.message || "Registrasi gagal.",
        );
      }
    } catch (error) {
      console.log("Error register:", error);

      Alert.alert(
        "Tidak dapat terhubung",
        "Tidak dapat terhubung ke server.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ==================================
  // TAMPILAN
  // ==================================

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { minHeight: height },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ==================================
            HEADER
        ================================== */}

        <View
          style={[
            styles.header,
            {
              height: headerHeight,
            },
          ]}
        >
          {/* ==================================
              LOGO TAGO
          ================================== */}

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
              source={require("../../assets/images/logo-tago.webp")}
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

          {/* ==================================
              GAMBAR ORANG
          ================================== */}

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

                bottom: isMobile ? 5 : 8,
              },
            ]}
            resizeMode="contain"
          />

          {/* ==================================
              HEADER TEXT
          ================================== */}

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
              Yuk Buat Akun!
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
              Daftar dan temukan rekomendasi
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

        {/* ==================================
            REGISTER CARD
        ================================== */}

        <View
          style={[
            styles.registerCard,
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
          {/* ==================================
              TITLE
          ================================== */}

          <Text
            style={[
              styles.registerTitle,
              {
                fontSize: isMobile
                  ? 35
                  : isTablet
                    ? 40
                    : 44,
              },
            ]}
          >
            Buat Akun
          </Text>

          <Text
            style={[
              styles.registerSubtitle,
              {
                fontSize: isMobile
                  ? 16
                  : isTablet
                    ? 18
                    : 19,
              },
            ]}
          >
            Daftar untuk mulai menggunakan Food AI
          </Text>

          {/* ==================================
              NAMA
          ================================== */}

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
            Nama
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
              name="person-outline"
              size={isMobile ? 23 : 25}
              color="#4D6FB7"
            />

            <TextInput
              style={[
                styles.input,
                {
                  fontSize: isMobile ? 16 : 17,
                },
              ]}
              placeholder="Masukkan nama"
              placeholderTextColor="#5875B5"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          {/* ==================================
              EMAIL
          ================================== */}

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
                  fontSize: isMobile ? 16 : 17,
                },
              ]}
              placeholder="Masukkan email"
              placeholderTextColor="#5875B5"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* ==================================
              PASSWORD
          ================================== */}

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
                  ? 58
                  : isTablet
                    ? 62
                    : 64,
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
                  fontSize: isMobile ? 16 : 17,
                },
              ]}
              placeholder="Masukkan password"
              placeholderTextColor="#5875B5"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
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

          {/* ==================================
              KONFIRMASI PASSWORD
          ================================== */}

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
            Konfirmasi Password
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
              name="shield-checkmark-outline"
              size={isMobile ? 24 : 26}
              color="#4D6FB7"
            />

            <TextInput
              style={[
                styles.input,
                {
                  fontSize: isMobile ? 16 : 17,
                },
              ]}
              placeholder="Ulangi password"
              placeholderTextColor="#5875B5"
              value={konfirmasiPassword}
              onChangeText={setKonfirmasiPassword}
              secureTextEntry={!showKonfirmasiPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Pressable
              onPress={() =>
                setShowKonfirmasiPassword(
                  !showKonfirmasiPassword,
                )
              }
            >
              <Ionicons
                name={
                  showKonfirmasiPassword
                    ? "eye-outline"
                    : "eye-off-outline"
                }
                size={isMobile ? 24 : 26}
                color="#4D6FB7"
              />
            </Pressable>
          </View>

          {/* ==================================
              BUTTON DAFTAR
          ================================== */}

          <Pressable
            style={({ pressed }) => [
                styles.button,
                {
                  height: isMobile ? 56 : isTablet ? 62 : 64,
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleRegister}
              disabled={isLoading}  
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
              {isLoading
                ? "Mendaftarkan..."
                : "Daftar"}
            </Text>
          </Pressable>

          {/* ==================================
              LOGIN
          ================================== */}

          <View
            style={[
              styles.loginContainer,
              {
                marginTop: isMobile ? 22 : 25,
              },
            ]}
          >
            <Text
              style={[
                styles.loginText,
                {
                  fontSize: isMobile ? 16 : 17,
                },
              ]}
            >
              Sudah punya akun?
            </Text>

            <Pressable
              onPress={() => router.replace("/login")}
            >
              <Text
                style={[
                  styles.loginLink,
                  {
                    fontSize: isMobile ? 16 : 17,
                  },
                ]}
              >
                Login
              </Text>
            </Pressable>
          </View>
        </View>

        {/* ==================================
            FOOTER
        ================================== */}

        <Text
          style={[
            styles.footer,
            {
              fontSize: isMobile ? 14 : 15,
            },
          ]}
        >
          Powered by TAGO
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ==================================
// STYLE
// ==================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAF4FF",
  },

  scrollContainer: {
    alignItems: "center",
    paddingBottom: 30,
  },

  // ==================================
  // HEADER
  // ==================================

  header: {
    width: "100%",
    backgroundColor: "#0647D8",
    position: "relative",
    overflow: "hidden",
    borderBottomLeftRadius: 55,
    borderBottomRightRadius: 55,
  },

  // ==================================
  // LOGO
  // ==================================

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

  // ==================================
  // GAMBAR ORANG
  // ==================================

  personImage: {
    position: "absolute",
    zIndex: 2,
  },

  // ==================================
  // HEADER TEXT
  // ==================================

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

  // ==================================
  // REGISTER CARD
  // ==================================

  registerCard: {
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

  // ==================================
  // TITLE
  // ==================================

  registerTitle: {
    color: "#111827",
    fontWeight: "800",
    marginBottom: 4,
  },

  registerSubtitle: {
    color: "#35588F",
    marginBottom: 22,
  },

  // ==================================
  // LABEL
  // ==================================

  label: {
    color: "#101827",
    fontWeight: "700",
    marginBottom: 7,
  },

  // ==================================
  // INPUT
  // ==================================

  inputContainer: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#8AB9FF",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 14,
    backgroundColor: "#FBFDFF",
  },

  input: {
    flex: 1,
    color: "#111827",
    marginLeft: 11,
  },

  // ==================================
  // BUTTON
  // ==================================

  button: {
    width: "100%",

    backgroundColor: "#0647D8",

    borderRadius: 15,

    justifyContent: "center",
    alignItems: "center",

    marginTop: 2,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  // ==================================
  // LOGIN
  // ==================================

  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  loginText: {
    color: "#35588F",
  },

  loginLink: {
    color: "#0647D8",
    fontWeight: "800",
    marginLeft: 7,
  },

  // ==================================
  // FOOTER
  // ==================================

  footer: {
    color: "#5273A7",
    marginTop: 18,
    textAlign: "center",
    marginBottom: 5,
  },
});