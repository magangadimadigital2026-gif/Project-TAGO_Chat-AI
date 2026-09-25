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

import { API_URL } from "@/constants/api";

export default function RegisterScreen() {
  const { width } = useWindowDimensions();

  const isSmallScreen = width < 400;
  const isDesktop = width >= 768;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  // ==================================
  // REGISTER
  // ==================================

  const handleRegister = async () => {
    if (name.trim() === "") {
      Alert.alert("Perhatian", "Nama wajib diisi");
      return;
    }

    if (email.trim() === "") {
      Alert.alert("Perhatian", "Email wajib diisi");
      return;
    }

    if (password.trim() === "") {
      Alert.alert("Perhatian", "Password wajib diisi");
      return;
    }

    if (konfirmasiPassword.trim() === "") {
      Alert.alert("Perhatian", "Konfirmasi password wajib diisi");
      return;
    }

    if (password !== konfirmasiPassword) {
      Alert.alert("Perhatian", "Konfirmasi password tidak sama");
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
        Alert.alert("Registrasi Gagal", result.message || "Registrasi gagal.");
      }
    } catch (error) {
      console.log("Error register:", error);

      Alert.alert("Tidak dapat terhubung", "Tidak dapat terhubung ke server.");
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
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* ==================================
            COVER / HEADER
        ================================== */}

        <View
          style={[
            styles.cover,
            isSmallScreen && styles.coverSmall,
            isDesktop && styles.coverDesktop,
          ]}
        >
          {/* Dekorasi */}
          <View style={styles.coverCircleOne} />
          <View style={styles.coverCircleTwo} />

          {/* ==================================
              LOGO
          ================================== */}

          <View style={styles.brand}>
            <View
              style={[
                styles.logoCircle,
                isSmallScreen && styles.logoCircleSmall,
              ]}
            >
              <Ionicons name="restaurant-outline" size={32} color="#023E8A" />
            </View>

            <View>
              <Text
                style={[styles.logoText, isSmallScreen && styles.logoTextSmall]}
              >
                Food
              </Text>

              <Text style={styles.logoSubtitle}>Food recommendation</Text>
            </View>
          </View>

          {/* ==================================
              COVER TEXT
          ================================== */}

          <View style={styles.coverTextContainer}>
            <Text
              style={[
                styles.coverTitle,
                isSmallScreen && styles.coverTitleSmall,
                isDesktop && styles.coverTitleDesktop,
              ]}
            >
              Yuk buat akunmu!
            </Text>

            <Text
              style={[
                styles.coverTitle,
                isSmallScreen && styles.coverTitleSmall,
                isDesktop && styles.coverTitleDesktop,
              ]}
            >
              dan temukan makanan favoritmu
            </Text>
          </View>

          <Text
            style={[
              styles.coverDescription,
              isDesktop && styles.coverDescriptionDesktop,
            ]}
          >
            Daftar sekarang dan dapatkan
            {"\n"}
            rekomendasi makanan yang sesuai.
          </Text>

          {/* ==================================
              GAMBAR MAKANAN
          ================================== */}

          <View
            style={[
              styles.foodImageWrapper,
              isSmallScreen && styles.foodImageWrapperSmall,
              isDesktop && styles.foodImageWrapperDesktop,
            ]}
          >
            <Image
              source={require("../../assets/images/food.jpg")}
              style={styles.foodImage}
              resizeMode="cover"
            />
          </View>

          {/* Dekorasi garis */}
          <View style={styles.decorLineOne} />
          <View style={styles.decorLineTwo} />
        </View>

        {/* ==================================
            REGISTER CARD
        ================================== */}

        <View
          style={[
            styles.card,
            isSmallScreen && styles.cardSmall,
            isDesktop && styles.cardDesktop,
          ]}
        >
          <Text style={styles.title}>Buat Akun</Text>

          <Text style={styles.subtitle}>
            Daftar untuk mulai menggunakan
            {"\n"}
            Food dan mendapatkan rekomendasi.
          </Text>

          {/* ==================================
              NAMA
          ================================== */}

          <Text style={styles.label}>Nama</Text>

          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Ionicons name="person-outline" size={20} color="#023E8A" />
            </View>

            <TextInput
              style={styles.textInput}
              placeholder="Masukkan nama"
              placeholderTextColor="#8998AA"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* ==================================
              EMAIL
          ================================== */}

          <Text style={styles.label}>Email</Text>

          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Ionicons name="mail-outline" size={20} color="#023E8A" />
            </View>

            <TextInput
              style={styles.textInput}
              placeholder="Masukkan email"
              placeholderTextColor="#8998AA"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* ==================================
              PASSWORD
          ================================== */}

          <Text style={styles.label}>Password</Text>

          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Ionicons name="lock-closed-outline" size={20} color="#023E8A" />
            </View>

            <TextInput
              style={styles.textInput}
              placeholder="Masukkan password"
              placeholderTextColor="#8998AA"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* ==================================
              KONFIRMASI PASSWORD
          ================================== */}

          <Text style={styles.label}>Konfirmasi Password</Text>

          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="#023E8A"
              />
            </View>

            <TextInput
              style={styles.textInput}
              placeholder="Ulangi password"
              placeholderTextColor="#8998AA"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              value={konfirmasiPassword}
              onChangeText={setKonfirmasiPassword}
            />
          </View>

          {/* ==================================
              REGISTER BUTTON
          ================================== */}

          <Pressable
            style={[
              styles.registerMainButton,
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.registerMainText}>
              {isLoading ? "Mendaftarkan..." : "Daftar"}
            </Text>

            {!isLoading && (
              <Ionicons name="arrow-forward" size={21} color="#FFFFFF" />
            )}
          </Pressable>

          {/* ==================================
              DIVIDER
          ================================== */}

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />

            <Text style={styles.dividerText}>sudah punya akun?</Text>

            <View style={styles.divider} />
          </View>

          {/* ==================================
              LOGIN
          ================================== */}

          <Pressable
            style={styles.loginButton}
            onPress={() => router.replace("/login")}
          >
            <Ionicons name="log-in-outline" size={20} color="#023E8A" />

            <Text style={styles.loginText}>Login</Text>
          </Pressable>
        </View>

        {/* ==================================
            FOOTER
        ================================== */}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by</Text>

          <Text style={styles.tagoText}>TAGO</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  /* ==================================
     CONTAINER
  ================================== */

  container: {
    flex: 1,
    backgroundColor: "#E3E9F1",
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: 25,
  },

  /* ==================================
     COVER
  ================================== */

  cover: {
    width: "100%",
    height: 365,

    backgroundColor: "#023E8A",

    paddingHorizontal: 25,
    paddingTop: 35,

    overflow: "hidden",

    borderBottomLeftRadius: 45,
    borderBottomRightRadius: 45,
  },

  coverSmall: {
    height: 340,

    paddingHorizontal: 19,
    paddingTop: 28,
  },

  coverDesktop: {
    height: 390,

    paddingHorizontal: 40,
    paddingTop: 45,
  },

  /* ==================================
     LOGO
  ================================== */

  brand: {
    flexDirection: "row",
    alignItems: "center",

    zIndex: 5,
  },

  logoCircle: {
    width: 58,
    height: 58,

    borderRadius: 29,

    backgroundColor: "#FFFFFF",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 11,
  },

  logoCircleSmall: {
    width: 50,
    height: 50,

    borderRadius: 25,
  },

  logoText: {
    fontSize: 31,

    fontWeight: "800",

    color: "#FFFFFF",
  },

  logoTextSmall: {
    fontSize: 27,
  },

  logoSubtitle: {
    fontSize: 11,

    color: "#DCEBFA",

    marginTop: 1,
  },

  /* ==================================
     COVER TEXT
  ================================== */

  coverTextContainer: {
    marginTop: 28,

    zIndex: 5,
  },

  coverTitle: {
    fontSize: 24,

    fontWeight: "800",

    color: "#FFFFFF",

    lineHeight: 31,
  },

  coverTitleSmall: {
    fontSize: 20,

    lineHeight: 26,
  },

  coverTitleDesktop: {
    fontSize: 30,

    lineHeight: 38,
  },

  coverDescription: {
    fontSize: 13,

    lineHeight: 19,

    color: "#DCEBFA",

    marginTop: 8,

    zIndex: 5,
  },

  coverDescriptionDesktop: {
    fontSize: 14,

    lineHeight: 21,
  },

  /* ==================================
     FOOD IMAGE
  ================================== */

  foodImageWrapper: {
    position: "absolute",

    width: 155,
    height: 155,

    borderRadius: 78,

    right: -12,
    top: 28,

    borderWidth: 6,

    borderColor: "#FFFFFF",

    overflow: "hidden",

    zIndex: 4,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.18,

    shadowRadius: 10,

    elevation: 7,
  },

  foodImageWrapperSmall: {
    width: 125,
    height: 125,

    borderRadius: 63,

    right: -10,
    top: 25,

    borderWidth: 5,
  },

  foodImageWrapperDesktop: {
    width: 180,
    height: 180,

    borderRadius: 90,

    right: 30,
    top: 35,
  },

  foodImage: {
    width: "100%",
    height: "100%",
  },

  /* ==================================
     DECORATION
  ================================== */

  coverCircleOne: {
    position: "absolute",

    width: 190,
    height: 190,

    borderRadius: 95,

    backgroundColor: "#BDD8E9",

    right: -90,
    bottom: -75,

    opacity: 0.35,
  },

  coverCircleTwo: {
    position: "absolute",

    width: 150,
    height: 150,

    borderRadius: 75,

    backgroundColor: "#FFFFFF",

    left: -95,
    bottom: -85,

    opacity: 0.1,
  },

  decorLineOne: {
    position: "absolute",

    width: 55,
    height: 5,

    borderRadius: 3,

    backgroundColor: "#BDD8E9",

    right: 135,
    top: 130,

    transform: [
      {
        rotate: "-25deg",
      },
    ],
  },

  decorLineTwo: {
    position: "absolute",

    width: 35,
    height: 5,

    borderRadius: 3,

    backgroundColor: "#FFFFFF",

    right: 120,
    top: 145,

    opacity: 0.8,

    transform: [
      {
        rotate: "-25deg",
      },
    ],
  },

  /* ==================================
     CARD
  ================================== */

  card: {
    width: "91%",

    maxWidth: 440,

    backgroundColor: "#FFFFFF",

    borderRadius: 24,

    paddingHorizontal: 23,
    paddingVertical: 26,

    marginTop: -42,

    zIndex: 10,

    shadowColor: "#023E8A",

    shadowOffset: {
      width: 0,
      height: 7,
    },

    shadowOpacity: 0.15,

    shadowRadius: 18,

    elevation: 8,
  },

  cardSmall: {
    width: "92%",

    paddingHorizontal: 18,
    paddingVertical: 22,

    marginTop: -35,

    borderRadius: 20,
  },

  cardDesktop: {
    width: "90%",

    maxWidth: 470,

    paddingHorizontal: 38,
    paddingVertical: 34,

    marginTop: -48,

    borderRadius: 25,
  },

  /* ==================================
     TITLE
  ================================== */

  title: {
    fontSize: 25,

    fontWeight: "800",

    color: "#023E8A",

    textAlign: "center",
  },

  subtitle: {
    fontSize: 13,

    lineHeight: 19,

    color: "#71849B",

    textAlign: "center",

    marginTop: 7,
    marginBottom: 23,
  },

  /* ==================================
     INPUT
  ================================== */

  label: {
    fontSize: 14,

    fontWeight: "700",

    color: "#26384F",

    marginBottom: 7,
  },

  inputContainer: {
    height: 50,

    flexDirection: "row",

    alignItems: "center",

    borderWidth: 1.3,

    borderColor: "#D1DEEF",

    borderRadius: 12,

    backgroundColor: "#FAFCFF",

    marginBottom: 14,
  },

  inputIcon: {
    width: 43,
    height: 43,

    borderRadius: 10,

    backgroundColor: "#E3EDF9",

    justifyContent: "center",
    alignItems: "center",

    marginLeft: 3,
  },

  textInput: {
    flex: 1,

    height: "100%",

    fontSize: 15,

    color: "#26384F",

    paddingHorizontal: 12,
  },

  /* ==================================
     REGISTER BUTTON
  ================================== */

  registerMainButton: {
    height: 52,

    borderRadius: 26,

    backgroundColor: "#023E8A",

    flexDirection: "row",

    justifyContent: "center",
    alignItems: "center",

    gap: 9,

    marginTop: 4,
  },

  buttonDisabled: {
    opacity: 0.55,
  },

  registerMainText: {
    color: "#FFFFFF",

    fontSize: 16,

    fontWeight: "800",
  },

  /* ==================================
     DIVIDER
  ================================== */

  dividerContainer: {
    flexDirection: "row",

    alignItems: "center",

    marginVertical: 19,
  },

  divider: {
    flex: 1,

    height: 1,

    backgroundColor: "#D8E1EC",
  },

  dividerText: {
    color: "#8293A8",

    fontSize: 12,

    marginHorizontal: 10,
  },

  /* ==================================
     LOGIN BUTTON
  ================================== */

  loginButton: {
    height: 48,

    borderWidth: 1.3,

    borderColor: "#AFC5DE",

    borderRadius: 12,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: 7,

    backgroundColor: "#FFFFFF",
  },

  loginText: {
    color: "#023E8A",

    fontSize: 15,

    fontWeight: "800",
  },

  /* ==================================
     FOOTER
  ================================== */

  footer: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    marginTop: 17,

    gap: 5,
  },

  footerText: {
    color: "#71849B",

    fontSize: 12,
  },

  tagoText: {
    color: "#023E8A",

    fontSize: 13,

    fontWeight: "800",
  },
});
