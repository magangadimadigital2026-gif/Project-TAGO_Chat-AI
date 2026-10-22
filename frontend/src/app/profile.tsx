import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function ProfileScreen() {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const name = await AsyncStorage.getItem("userName");
      const email = await AsyncStorage.getItem("userEmail");

      if (name) {
        setUserName(name);
      }

      if (email) {
        setUserEmail(email);
      }

    } catch (error) {
      console.log("Gagal mengambil data profil:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/chat");
            }
          }}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Profil</Text>

        <View style={styles.headerSpace} />
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileIcon}>
          <Text style={styles.profileIconText}>👤</Text>
        </View>

        <Text style={styles.profileTitle}>Profil Saya</Text>

        <Text style={styles.profileSubtitle}>
          Informasi akun pengguna GOAI
        </Text>

        {/* Nama */}
        <View style={styles.infoBox}>
          <View style={styles.infoIcon}>
            <Text>👤</Text>
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.label}>Nama</Text>
            <Text style={styles.value}>
              {userName || "Nama pengguna"}
            </Text>
          </View>
        </View>

        {/* Email */}
        <View style={styles.infoBox}>
          <View style={styles.infoIcon}>
            <Text>✉️</Text>
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>
              {userEmail || "Email pengguna"}
            </Text>
          </View>
        </View>

        {/* Back Button */}
        <Pressable
          style={({ pressed }) => [
            styles.chatButton,
            pressed && styles.chatButtonPressed,
          ]}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/chat");
            }
          }}
        >
          <Text style={styles.chatButtonText}>
            Kembali ke Chat
          </Text>
        </Pressable>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>Powered by TAGO</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F8FC",
    paddingHorizontal: 20,
    paddingTop: 25,
  },

  header: {
    width: "100%",
    maxWidth: 1100,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },

  backText: {
    fontSize: 32,
    color: "#0029FF",
    lineHeight: 35,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },

  headerSpace: {
    width: 42,
  },

  profileCard: {
    width: "100%",
    maxWidth: 550,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 30,
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },

  profileIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#E7F0FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  profileIconText: {
    fontSize: 42,
  },

  profileTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 5,
  },

  profileSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 25,
  },

  infoBox: {
    width: "100%",
    minHeight: 70,
    backgroundColor: "#F7F9FC",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 12,
  },

  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E7F0FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  label: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 3,
  },

  value: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },

  chatButton: {
    width: "100%",
    height: 50,
    borderRadius: 14,
    backgroundColor: "#0029FF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },

  chatButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  chatButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  footer: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 25,
    marginBottom: 15,
  },
});