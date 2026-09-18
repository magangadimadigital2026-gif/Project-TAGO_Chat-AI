import { API_URL } from "@/constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type ChatMessage = {
  text: string;
  sender: "user" | "ai";
};

export default function ChatScreen() {
  const { conversationId: paramConversationId } = useLocalSearchParams();

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      text: "Halo! 👋 Mau makan apa hari ini?",
      sender: "ai",
    },
  ]);

  const [conversationId, setConversationId] = useState<number | null>(
    paramConversationId ? Number(paramConversationId) : null,
  );

  const [isLoading, setIsLoading] = useState(false);

  const [isLoadingConversation, setIsLoadingConversation] = useState(false);

  useEffect(() => {
    if (!paramConversationId) {
      return;
    }

    const getConversation = async () => {
      try {
        setIsLoadingConversation(true);

        const token = await AsyncStorage.getItem("token");

        if (!token) {
          Alert.alert("Sesi berakhir", "Silakan login kembali.");

          router.replace("/login");
          return;
        }

        const response = await fetch(
          `${API_URL}/api/chat/${paramConversationId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const result = await response.json();

        console.log("Detail Conversation:", JSON.stringify(result, null, 2));

        if (result.success) {
          setConversationId(result.data.id);

          const conversationMessages = result.data.messages.map(
            (item: { role: "user" | "assistant"; content: string }) => ({
              text: item.content,
              sender: item.role === "user" ? "user" : "ai",
            }),
          );

          setMessages(conversationMessages);
        } else {
          Alert.alert("Gagal", result.message || "Gagal mengambil percakapan.");
        }
      } catch (error) {
        console.log("Error Detail Conversation:", error);

        Alert.alert("Tidak dapat terhubung", "Server belum dapat diakses.");
      } finally {
        setIsLoadingConversation(false);
      }
    };

    getConversation();
  }, [paramConversationId]);

  const handleSend = async () => {
    if (message.trim() === "") {
      return;
    }

    const userMessage = message.trim();

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        text: userMessage,
        sender: "user",
      },
    ]);

    setMessage("");
    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Sesi berakhir", "Silakan login kembali.");

        router.replace("/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage,
          ...(conversationId !== null
            ? {
                conversationId: conversationId,
              }
            : {}),
        }),
      });

      const result = await response.json();

      console.log("Hasil Chat AI:", JSON.stringify(result, null, 2));

      if (result.success) {
        setConversationId(result.data.conversationId);

        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: result.data.aiReply,
            sender: "ai",
          },
        ]);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: result.message || "AI gagal memberikan jawaban.",
            sender: "ai",
          },
        ]);
      }
    } catch (error) {
      console.log("Error Chat AI:", error);

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: "Tidak dapat terhubung ke server.",
          sender: "ai",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([
      {
        text: "Halo! 👋 Mau makan apa hari ini?",
        sender: "ai",
      },
    ]);

    setMessage("");
    setConversationId(null);

    router.replace("/chat");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.replace("/home")}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <Text style={styles.title}>Food AI</Text>

        <Pressable style={styles.newChatButton} onPress={handleNewChat}>
          <Text style={styles.newChatText}>Chat Baru</Text>
        </Pressable>
      </View>

      {isLoadingConversation ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#023E8A" />

          <Text style={styles.loadingText}>Memuat percakapan...</Text>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.chatArea}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.messageBubble,
                  item.sender === "user" ? styles.userBubble : styles.aiBubble,
                ]}
              >
                <Text
                  style={
                    item.sender === "user" ? styles.userText : styles.aiText
                  }
                >
                  {item.text}
                </Text>
              </View>
            ))}

            {isLoading && (
              <View style={[styles.messageBubble, styles.aiBubble]}>
                <Text style={styles.aiText}>AI sedang mengetik...</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputArea}>
            <TextInput
              style={styles.input}
              placeholder="Tulis pesan..."
              placeholderTextColor="#888"
              value={message}
              onChangeText={setMessage}
              multiline
              textAlignVertical="top"
              returnKeyType="default"
            />

            <Pressable
              style={[styles.sendButton, isLoading && styles.buttonDisabled]}
              onPress={handleSend}
              disabled={isLoading}
            >
              <Text style={styles.sendText}>Kirim</Text>
            </Pressable>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingTop: 15,
  },

  header: {
    height: 55,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E3E9F1",
    marginBottom: 10,
  },

  backButton: {
    width: 45,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  backText: {
    fontSize: 40,
    color: "#023E8A",
    lineHeight: 40,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#023E8A",
  },

  newChatButton: {
    paddingVertical: 8,
    paddingHorizontal: 5,
  },

  newChatText: {
    color: "#023E8A",
    fontSize: 14,
    fontWeight: "bold",
  },

  chatArea: {
    flex: 1,
  },

  chatContent: {
    paddingVertical: 15,
    paddingBottom: 10,
  },

  messageBubble: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginBottom: 12,
    maxWidth: "78%",
  },

  aiBubble: {
    backgroundColor: "#E3E9F1",
    alignSelf: "flex-start",
  },

  userBubble: {
    backgroundColor: "#023E8A",
    alignSelf: "flex-end",
  },

  aiText: {
    color: "#222",
    fontSize: 15,
    lineHeight: 21,
  },

  userText: {
    color: "white",
    fontSize: 15,
    lineHeight: 21,
  },

  inputArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingTop: 10,
    paddingBottom: 10,
    gap: 10,
    backgroundColor: "white",
  },

  input: {
    flex: 1,
    minHeight: 45,
    maxHeight: 90,
    borderWidth: 1,
    borderColor: "#D0D5DC",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    backgroundColor: "white",
  },

  sendButton: {
    height: 45,
    backgroundColor: "#023E8A",
    paddingHorizontal: 18,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  sendText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },

  buttonDisabled: {
    opacity: 0.5,
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
});
