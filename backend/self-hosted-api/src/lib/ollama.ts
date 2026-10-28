import type { AiResult, ChatMsg } from "../types.js";

const ollamaUrl = (process.env.OLLAMA_URL ?? "http://ollama:11434").replace(
  /\/$/,
  "",
);
const ollamaModel = process.env.OLLAMA_MODEL ?? "qwen3:4b";

export async function askOllama(messages: ChatMsg[]): Promise<AiResult> {
  try {
    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: ollamaModel,
        messages,
        stream: false,
        options: { temperature: 0.4 },
      }),
    });

    if (!response.ok) {
      return { ok: false, detail: await response.text() };
    }

    const payload = (await response.json()) as {
      message?: { content?: string };
    };

    return {
      ok: true,
      text: payload.message?.content?.trim() ?? "",
      model: ollamaModel,
    };
  } catch (error) {
    return {
      ok: false,
      detail: error instanceof Error ? error.message : "Ollama request failed",
    };
  }
}
