"use client";

import { useState } from "react";
import ChatHeader from "./ChatHeader";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";
import QuickSuggestions from "./QuickSuggestions";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatUI() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSend(customMessage?: string) {
    const text = (customMessage ?? message).trim();

    if (!text || loading) return;

    setLoading(true);

    const newMessages: Message[] = [
      ...messages,
      {
        role: "user",
        content: text,
      },
    ];

    setMessages(newMessages);
    setMessage("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Terjadi kesalahan.");
      }

      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);

      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "Maaf, aku sedang mengalami kendala. Coba lagi sebentar ya. 😊",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-2xl items-center justify-center">
        <div className="flex h-[720px] w-full flex-col overflow-hidden rounded-[28px] border border-orange-100 bg-white shadow-xl shadow-orange-100/60">
          <ChatHeader />

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-100 text-5xl shadow-sm">
                  🍜
                </div>

                <h2 className="text-2xl font-bold text-orange-950">Hai! 👋</h2>

                <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                  Bingung mau makan apa hari ini? Ceritakan ke aku, nanti kita
                  cari makanan yang cocok buat kamu. 😋
                </p>

                <div className="mt-6 w-full max-w-md">
                  <QuickSuggestions
                    onSelect={(text) => handleSend(text)}
                    disabled={loading}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <ChatBubble
                    key={index}
                    role={msg.role}
                    content={msg.content}
                  />
                ))}

                {loading && (
                  <div className="flex items-end gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100">
                      ✨
                    </div>

                    <div className="rounded-2xl rounded-bl-md bg-orange-50 px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-orange-300" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-orange-400 [animation-delay:150ms]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-orange-500 [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}

                {!loading && (
                  <QuickSuggestions
                    onSelect={(text) => handleSend(text)}
                    disabled={loading}
                  />
                )}
              </div>
            )}
          </div>

          <ChatInput
            value={message}
            loading={loading}
            onChange={setMessage}
            onSend={() => handleSend()}
          />
        </div>
      </div>
    </main>
  );
}
