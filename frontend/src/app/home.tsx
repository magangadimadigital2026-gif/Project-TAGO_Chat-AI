import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

export default function HomeScreen() {
  const { width } = useWindowDimensions();

  const isSmallScreen = width < 400;
  const isDesktop = width >= 768;

  const [userName, setUserName] = useState("User");

  // Mengambil nama user dari akun yang sedang login
  useEffect(() => {
    const getUserName = async () => {
      try {
        const name = await AsyncStorage.getItem("userName");

        if (name) {
          setUserName(name);
        }
      } catch (error) {
        console.log("Error mengambil nama user:", error);
      }
    };

    getUserName();
  }, []);

  // Fungsi logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("userName");

      console.log("Logout berhasil");

      router.replace("/login");
    } catch (error) {
      console.log("Error logout:", error);

      Alert.alert("Logout Gagal", "Terjadi kesalahan saat logout.");
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        isDesktop && styles.desktopContent,
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>TAGO</Text>
          <Text style={styles.logoSubtitle}>Food Recommendation</Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons name="restaurant-outline" size={21} color="#023E8A" />
        </View>
      </View>

      {/* GREETING */}

      <View style={styles.greeting}>
        <Text
          style={[
            styles.greetingTitle,
            isSmallScreen && styles.greetingTitleSmall,
          ]}
        >
          Hai, {userName} 👋
        </Text>

        <Text
          style={[
            styles.greetingSubtitle,
            isSmallScreen && styles.greetingSubtitleSmall,
          ]}
        >
          Mau makan apa hari ini?
        </Text>
      </View>

      {/* AI CARD */}

      <View style={[styles.mainCard, isSmallScreen && styles.mainCardSmall]}>
        <Image
          source={require("../../assets/images/burger.jpg")}
          style={[styles.foodImage, isSmallScreen && styles.foodImageSmall]}
          resizeMode="cover"
        />

        <View style={styles.mainContent}>
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles-outline" size={15} color="#023E8A" />

            <Text style={styles.aiBadgeText}>FOOD AI</Text>
          </View>

          <Text
            style={[styles.mainTitle, isSmallScreen && styles.mainTitleSmall]}
          >
            Bingung mau makan apa?
          </Text>

          <Text style={styles.mainDescription}>
            Ceritakan keinginanmu, dan biarkan Food AI membantu menemukan
            rekomendasi makanan yang cocok untukmu.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.chatButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.push("/chat")}
          >
            <Text style={styles.chatButtonText}>Mulai Chat</Text>

            <View style={styles.chatButtonIcon}>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </View>
          </Pressable>
        </View>
      </View>

      {/* MENU */}

      <View style={styles.sectionHeader}>
        <Text style={styles.menuTitle}>Aktivitas</Text>
      </View>

      {/* HISTORY */}

      <Pressable
        style={({ pressed }) => [
          styles.menuButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={() => router.push("/history")}
      >
        <View style={styles.menuIcon}>
          <Ionicons name="time-outline" size={23} color="#023E8A" />
        </View>

        <View style={styles.menuText}>
          <Text style={styles.menuButtonTitle}>Riwayat Chat</Text>

          <Text style={styles.menuButtonDescription}>
            Lihat percakapan sebelumnya
          </Text>
        </View>

        <View style={styles.arrowIcon}>
          <Ionicons name="chevron-forward" size={19} color="#023E8A" />
        </View>
      </Pressable>

      {/* LOGOUT */}

      <Pressable
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color="#D62828" />

        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>

      {/* FOOTER */}

      <View style={styles.footerContainer}>
        <View style={styles.footerLine} />

        <Text style={styles.footer}>Powered by TAGO</Text>

        <View style={styles.footerLine} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E3E9F1",
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 35,
  },

  desktopContent: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },

  /* HEADER */

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },

  logo: {
    fontSize: 25,
    fontWeight: "900",
    color: "#023E8A",
    letterSpacing: 1.2,
  },

  logoSubtitle: {
    fontSize: 10,
    color: "#7B8794",
    marginTop: 2,
    letterSpacing: 0.4,
  },

  headerIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  /* GREETING */

  greeting: {
    marginBottom: 22,
  },

  greetingTitle: {
    fontSize: 29,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 5,
  },

  greetingTitleSmall: {
    fontSize: 25,
  },

  greetingSubtitle: {
    fontSize: 16,
    color: "#687583",
  },

  greetingSubtitleSmall: {
    fontSize: 15,
  },

  /* MAIN CARD */

  mainCard: {
    backgroundColor: "#023E8A",
    borderRadius: 26,
    overflow: "hidden",
    marginBottom: 28,
  },

  mainCardSmall: {
    borderRadius: 22,
  },

  foodImage: {
    width: "100%",
    height: 210,
  },

  foodImageSmall: {
    height: 180,
  },

  mainContent: {
    padding: 21,
  },

  aiBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCE8F4",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 12,
    gap: 5,
  },

  aiBadgeText: {
    color: "#023E8A",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  mainTitle: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "800",
    marginBottom: 9,
  },

  mainTitleSmall: {
    fontSize: 20,
  },

  mainDescription: {
    color: "#DCE8F4",
    fontSize: 13.5,
    lineHeight: 20,
    marginBottom: 19,
  },

  /* CHAT BUTTON */

  chatButton: {
    height: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingLeft: 18,
    paddingRight: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  chatButtonText: {
    color: "#023E8A",
    fontSize: 15,
    fontWeight: "800",
  },

  chatButtonIcon: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: "#023E8A",
    alignItems: "center",
    justifyContent: "center",
  },

  /* SECTION */

  sectionHeader: {
    marginBottom: 12,
  },

  menuTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#222222",
  },

  /* HISTORY */

  menuButton: {
    minHeight: 72,
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  menuIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: "#E3E9F1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  menuText: {
    flex: 1,
  },

  menuButtonTitle: {
    color: "#1F2937",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 3,
  },

  menuButtonDescription: {
    color: "#8A939D",
    fontSize: 12,
  },

  arrowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F0F4F8",
    alignItems: "center",
    justifyContent: "center",
  },

  /* LOGOUT */

  logoutButton: {
    height: 49,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 3,
  },

  logoutText: {
    color: "#D62828",
    fontSize: 14,
    fontWeight: "700",
  },

  /* FOOTER */

  footerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 25,
    gap: 10,
  },

  footerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#CCD4DC",
  },

  footer: {
    color: "#89939D",
    fontSize: 10,
  },

  /* PRESS */

  buttonPressed: {
    opacity: 0.72,
  },
});
