import type { AiResult, ChatMsg } from "../types.js";

const geminiApiKey = process.env.GEMINI_API_KEY ?? "";
const geminiModel = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
const geminiFallbackModel = process.env.GEMINI_FALLBACK_MODEL ?? "";
const geminiThinking = process.env.GEMINI_THINKING_LEVEL ?? "";

async function callGemini(
  model: string,
  body: Record<string, unknown>,
  timeoutMs: number,
): Promise<Response> {
  const started = Date.now();

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiApiKey,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
      },
    );

    console.log(
      `gemini model=${model} status=${res.status} ${Date.now() - started}ms`,
    );

    return res;
  } catch {
    console.log(
      `gemini model=${model} timeout/error ${Date.now() - started}ms`,
    );
    return new Response("Gemini timeout", { status: 504 });
  }
}

export async function askGemini(messages: ChatMsg[]): Promise<AiResult> {
  if (!geminiApiKey) {
    return { ok: false, detail: "GEMINI_API_KEY belum diisi" };
  }

  const system = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");

  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const buildBody = (withThinking: boolean) => ({
    systemInstruction: system ? { parts: [{ text: system }] } : undefined,
    contents,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 2048,
      ...(withThinking && geminiThinking
        ? { thinkingConfig: { thinkingLevel: geminiThinking } }
        : {}),
    },
  });

  const retryable = (status: number) => status === 429 || status >= 500;

  const plan = [
    { model: geminiModel, thinking: true, delay: 0 },
    { model: geminiModel, thinking: false, delay: 1500 },
    ...(geminiFallbackModel && geminiFallbackModel !== geminiModel
      ? [
          { model: geminiFallbackModel, thinking: false, delay: 0 },
          { model: geminiFallbackModel, thinking: false, delay: 1500 },
        ]
      : []),
  ];

  const deadline = Date.now() + 50_000;
  const skip = new Set<string>();
  let usedModel = geminiModel;
  let response: Response | null = null;
  let lastDetail = "";

  for (const step of plan) {
    if (skip.has(step.model) || Date.now() > deadline) continue;

    if (step.delay) {
      await new Promise((resolve) => setTimeout(resolve, step.delay));
    }

    usedModel = step.model;
    response = await callGemini(step.model, buildBody(step.thinking), 15_000);

    if (response.ok) break;

    lastDetail = await response.text();

    if (response.status === 429) {
      skip.add(step.model);
    } else if (!retryable(response.status) && response.status !== 400) {
      break;
    }
  }

  if (!response || !response.ok) {
    return { ok: false, detail: lastDetail };
  }

  const payload = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  const text = (payload.candidates?.[0]?.content?.parts ?? [])
    .map((part) => part.text ?? "")
    .join("")
    .trim();

  return { ok: true, text, model: usedModel };
}
