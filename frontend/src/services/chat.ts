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
    if (!res.ok)
      throw new Error(json.message || json.error || "Terjadi kesalahan.");
    return (json.data ?? json) as T;
  } finally {
    clearTimeout(timer);
  }
}

export const sendMessage = async (
  message: string,
  conversationId?: string,
): Promise<ChatReply> => {
  const r = await request<{ answer: string; quick_replies?: string[] }>(
    "/api/chat",
    { method: "POST", body: JSON.stringify({ message }) },
  );
  return {
    conversationId: conversationId ?? "default",
    reply: r.answer,
    suggestions: r.quick_replies ?? [],
  };
};

type HistoryRow = {
  id: number | string;
  role: string;
  content: string;
  createdAt: string;
};

const loadHistory = async () =>
  (await request<{ messages: HistoryRow[] }>("/api/chat/history")).messages;

export const listConversations = async (): Promise<ConversationItem[]> => {
  const rows = await loadHistory();
  if (rows.length === 0) return [];
  const first = rows.find((m) => m.role === "user") ?? rows[0];
  const last = rows[rows.length - 1];
  return [
    {
      id: "default",
      title: first.content.slice(0, 40),
      lastMessage: last.content.slice(0, 80),
      updatedAt: last.createdAt,
    },
  ];
};

export const getConversation = async (id: string) => ({
  id,
  messages: (await loadHistory()).map(
    (m): StoredMessage => ({
      id: String(m.id),
      role: m.role === "assistant" ? "ai" : "user",
      text: m.content,
    }),
  ),
});

export const deleteConversation = async (_id: string): Promise<null> => null;
