import { API_URL } from "@/constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type ChatHistory = {
  id: number;
  title: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
};

export default function HistoryScreen() {
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const getHistory = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Sesi berakhir", "Silakan login kembali.");

        router.replace("/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/chat`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      console.log("History Chat:", result);

      if (result.success) {
        setChatHistory(result.data);
      } else {
        Alert.alert("Gagal", result.message || "Gagal mengambil riwayat chat.");
      }
    } catch (error) {
      console.log("Error History:", error);

      Alert.alert("Tidak dapat terhubung", "Server belum dapat diakses.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getHistory();
  }, []);

  const formatDate = (date: string) => {
    const result = new Date(date);

    return result.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace("/home")}>
          <Text style={styles.backButton}>‹</Text>
        </Pressable>

        <Text style={styles.title}>Riwayat Chat</Text>

        <View style={styles.placeholder} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#023E8A" />

          <Text style={styles.loadingText}>Memuat riwayat chat...</Text>
        </View>
      ) : chatHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Belum ada riwayat chat</Text>

          <Text style={styles.emptyText}>
            Mulai percakapan dengan Food AI untuk melihat riwayat di sini.
          </Text>

          <Pressable
            style={styles.startButton}
            onPress={() => router.push("/chat")}
          >
            <Text style={styles.startButtonText}>Mulai Chat</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {chatHistory.map((chat) => (
            <Pressable
              key={chat.id}
              style={styles.chatItem}
              onPress={() =>
                router.push({
                  pathname: "/chat",
                  params: {
                    conversationId: chat.id.toString(),
                  },
                })
              }
            >
              <View style={styles.chatInfo}>
                <Text style={styles.chatTitle}>{chat.title}</Text>

                <Text style={styles.chatDate}>
                  {formatDate(chat.createdAt)}
                </Text>
              </View>

              <Text style={styles.arrow}>›</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  backButton: {
    fontSize: 40,
    color: "#023E8A",
    lineHeight: 40,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#023E8A",
  },

  placeholder: {
    width: 30,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#777",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
  },

  emptyText: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    lineHeight: 21,
    marginTop: 10,
  },

  startButton: {
    backgroundColor: "#023E8A",
    paddingVertical: 13,
    paddingHorizontal: 35,
    borderRadius: 10,
    marginTop: 25,
  },

  startButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },

  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderWidth: 1,
    borderColor: "#E3E9F1",
    borderRadius: 12,
    marginBottom: 12,
  },

  chatInfo: {
    flex: 1,
  },

  chatTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },

  chatDate: {
    fontSize: 13,
    color: "#777",
    marginTop: 5,
  },

  arrow: {
    fontSize: 28,
    color: "#023E8A",
    marginLeft: 10,
  },
});
