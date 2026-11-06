import type { AiResult, ChatMsg } from "../types.js";
import { askGemini } from "./gemini.js";
/** Semua permintaan AI diteruskan ke Gemini. */
export function askAI(messages: ChatMsg[]): Promise<AiResult> {
  return askGemini(messages);
}

export function cleanAIReply(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/```(?:json)?/gi, "")
    .replace(/\*\*(.*?)\*\*/gs, "$1")
    .replace(/__(.*?)__/gs, "$1")
    .replace(/^\s*[*-]\s+/gm, "• ")
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "$1")
    .replace(/`([^`\n]+)`/g, "$1")
    .replace(/^\s*#{1,6}\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Pisahkan JSON {"quick_replies": [...]} di akhir jawaban dari teks jawabannya. */
export function extractQuickReplies(raw: string): {
  answer: string;
  quickReplies: string[];
} {
  let answer = raw;
  let quickReplies: string[] = [];

  const jsonMatch = answer.match(/\{[\s\S]*"quick_replies"[\s\S]*\}\s*$/);

  if (jsonMatch) {
    try {
      const qr = JSON.parse(jsonMatch[0]);

      if (Array.isArray(qr.quick_replies)) {
        quickReplies = qr.quick_replies.map(String);
        answer = answer.slice(0, jsonMatch.index).trim();
      }
    } catch {
      // Biarkan jawaban tetap tersedia jika JSON tidak valid.
    }
  }

  return { answer: cleanAIReply(answer), quickReplies };
}
