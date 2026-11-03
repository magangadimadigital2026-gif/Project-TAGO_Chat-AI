import { useEffect, useState } from "react";
import { getConversation, sendMessage } from "../services/chat";
import type { Msg } from "../types/chat";
import { notify } from "../utils/notify";

// Semua logika layar chat: memuat riwayat, kirim pesan, retry, saran cepat.
// `id`    -> buka percakapan lama
// `fresh` -> berubah setiap kali "Chat Baru" ditekan (memaksa reset)
export function useChat(id?: string, fresh?: string) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [convId, setConvId] = useState<string | undefined>(id);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    setConvId(id);
    setMessages([]);
    setSuggestions([]);
    if (!id) return;

    setLoading(true);
    getConversation(id)
      .then((c) =>
        setMessages(
          c.messages.map((m) => ({
            id: m.id,
            role: m.role,
            text: m.text,
            recs: m.recommendations,
          }))
        )
      )
      .catch((e) => notify("Gagal memuat", e.message))
      .finally(() => setLoading(false));
  }, [id, fresh]);

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || sending) return;

    const userMsg: Msg = { id: `u${Date.now()}`, role: "user", text };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setSuggestions([]);
    setSending(true);

    try {
      const r = await sendMessage(text, convId);
      setConvId(r.conversationId);
      setMessages((p) => [
        ...p,
        { id: `a${Date.now()}`, role: "ai", text: r.reply, recs: r.recommendations },
      ]);
      setSuggestions(r.suggestions ?? []);
    } catch {
      setMessages((p) => p.map((m) => (m.id === userMsg.id ? { ...m, failed: true } : m)));
    } finally {
      setSending(false);
    }
  };

  const retry = (m: Msg) => {
    setMessages((p) => p.filter((x) => x.id !== m.id));
    send(m.text);
  };

  return { messages, input, setInput, sending, loading, suggestions, send, retry };
}
