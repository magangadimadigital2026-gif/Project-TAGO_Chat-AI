import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";

// ASUMSI: sesuaikan path & bentuk respons dengan backend Hono kamu.
// Semua respons dibungkus { message?, data }, sama seperti login.

export type Rec = { name: string; reason: string; imageUrl?: string };

export type ChatReply = {
  conversationId: string;
  reply: string;
  recommendations?: Rec[];
  suggestions?: string[];
};

export type ConversationItem = {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: string; // ISO date
};

export type StoredMessage = {
  id: string;
  role: "user" | "ai";
  text: string;
  recommendations?: Rec[];
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await AsyncStorage.getItem("token");
  const controller = new AbortController();
  // Model lokal bisa lambat, beri waktu 60 detik.
  const timer = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || "Terjadi kesalahan.");
    return json.data as T;
  } finally {
    clearTimeout(timer);
  }
}

export const sendMessage = (message: string, conversationId?: string) =>
  request<ChatReply>("/api/chat", {
    method: "POST",
    body: JSON.stringify({ message, conversationId }),
  });

export const listConversations = () =>
  request<ConversationItem[]>("/api/conversations");

export const getConversation = (id: string) =>
  request<{ id: string; messages: StoredMessage[] }>(`/api/conversations/${id}`);

export const deleteConversation = (id: string) =>
  request<null>(`/api/conversations/${id}`, { method: "DELETE" });