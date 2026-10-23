
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";

// Data rekomendasi makanan
export type Rec = {
  name: string;
  reason: string;
  imageUrl?: string;
};

// Data balasan AI
export type ChatReply = {
  conversationId: string;
  reply: string;
  recommendations?: Rec[];
  suggestions?: string[];
};

// Data yang ditampilkan di daftar riwayat
export type ConversationItem = {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: string;
};

// Data pesan dalam satu percakapan
export type StoredMessage = {
  id: string;
  role: "user" | "ai";
  text: string;
  recommendations?: Rec[];
};

// Mengirim request ke backend
async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = await AsyncStorage.getItem("token");

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok || json.success === false) {
    throw new Error(json.message || "Terjadi kesalahan.");
  }

  return (json.data ?? json) as T;
}

// Mengirim pesan dan menerima balasan AI
export const sendMessage = async (
  message: string,
  conversationId?: string,
): Promise<ChatReply> => {
  const body: {
    message: string;
    conversationId?: number;
  } = { message };

  // Jika ada ID, lanjutkan percakapan tersebut
  if (conversationId) {
    body.conversationId = Number(conversationId);
  }

  const result = await request<{
    conversationId: number;
    userMessage: string;
    aiReply: string;
  }>("/api/chat", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return {
    conversationId: String(result.conversationId),
    reply: result.aiReply,
  };
};

// Bentuk data percakapan dari backend
type ConversationRow = {
  id: number;
  title: string;
  createdAt: string;
  updatedAt?: string;
};

// Mengambil daftar percakapan
export const listConversations =
  async (): Promise<ConversationItem[]> => {
    const rows = await request<ConversationRow[]>("/api/chat");
    console.log("JUMLAH PERCAKAPAN:", rows.length);
    console.log("DATA PERCAKAPAN:", rows);

    return rows
      .map((item) => ({
        id: String(item.id),
        title: item.title,
        lastMessage: item.title,
        updatedAt: item.updatedAt ?? item.createdAt,
      }))
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() -
          new Date(a.updatedAt).getTime(),
      )
      .slice(0, 10);
  };

// Mengambil detail satu percakapan
export const getConversation = async (id: string) => {
  const conversation = await request<{
    id: number;
    title: string;
    messages: {
      id: number;
      role: string;
      content: string;
      createdAt: string;
    }[];
  }>(`/api/chat/${id}`);

  return {
    id: String(conversation.id),
    messages: conversation.messages.map(
      (message): StoredMessage => ({
        id: String(message.id),
        role: message.role === "assistant" ? "ai" : "user",
        text: message.content,
      }),
    ),
  };
};

// Backend saat ini belum menyediakan endpoint hapus percakapan.
// Fungsi ini belum bisa menghapus data dari database.
export const deleteConversation = async (
  _id: string,
): Promise<null> => {
  throw new Error("Fitur hapus riwayat belum tersedia di backend.");
};
