import "dotenv/config";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { db } from "./db/index.js";
import { chatMessages, users } from "./db/schema.js";
import {
  createAccessToken,
  hashPassword,
  readAccessToken,
  verifyPassword,
} from "./auth.js";

async function getWeather(lat: number, lon: number): Promise<string> {
  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) return "";
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=id`,
    );
    if (!res.ok) return "";
    const data = (await res.json()) as {
      weather: { description: string }[];
      main: { temp: number };
    };
    return `Cuaca saat ini: ${data.weather[0].description}, suhu ${Math.round(data.main.temp)}°C.`;
  } catch {
    return "";
  }
}

type AppEnv = { Variables: { user: typeof users.$inferSelect } };
const app = new Hono<AppEnv>();
const port = Number(process.env.PORT ?? 3000);
const ollamaUrl = (process.env.OLLAMA_URL ?? "http://ollama:11434").replace(
  /\/$/,
  "",
);
const ollamaModel = process.env.OLLAMA_MODEL ?? "qwen3:4b";

const aiProvider = (process.env.AI_PROVIDER ?? "ollama").toLowerCase();
const geminiApiKey = process.env.GEMINI_API_KEY ?? "";
const geminiModel = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
const geminiFallbackModel = process.env.GEMINI_FALLBACK_MODEL ?? "";
const geminiThinking = process.env.GEMINI_THINKING_LEVEL ?? "";

type ChatMsg = { role: string; content: string };
type AiResult =
  | { ok: true; text: string; model: string }
  | { ok: false; detail: string };

async function askOllama(messages: ChatMsg[]): Promise<AiResult> {
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
  if (!response.ok) return { ok: false, detail: await response.text() };
  const payload = (await response.json()) as {
    message?: { content?: string };
  };
  return {
    ok: true,
    text: payload.message?.content?.trim() ?? "",
    model: ollamaModel,
  };
}

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
    console.log(`gemini model=${model} timeout/error ${Date.now() - started}ms`);
    return new Response("Gemini timeout", { status: 504 });
  }
}

async function askGemini(messages: ChatMsg[]): Promise<AiResult> {
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
  const retryable = (s: number) => s === 429 || s >= 500;

  let usedModel = geminiModel;
  let response = await callGemini(geminiModel, buildBody(true), 20_000);
  if (response.status === 400 && geminiThinking) {
    response = await callGemini(geminiModel, buildBody(false), 20_000);
  }
  if (retryable(response.status)) {
    usedModel = geminiFallbackModel || geminiModel;
    response = await callGemini(usedModel, buildBody(false), 20_000);
  }
  if (!response.ok) return { ok: false, detail: await response.text() };
  const payload = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = (payload.candidates?.[0]?.content?.parts ?? [])
    .map((p) => p.text ?? "")
    .join("")
    .trim();
  return { ok: true, text, model: usedModel };
}

app.use(
  "/api/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
  }),
);
app.get("/health", (c) => c.json({ status: "ok", service: "foodmate-api" }));

const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer "))
    return c.json({ error: "Missing bearer token" }, 401);
  try {
    const { userId } = await readAccessToken(header.slice("Bearer ".length));
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user) return c.json({ error: "User not found" }, 401);
    c.set("user", user);
    await next();
  } catch {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
});

const credentials = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(128),
});

app.post("/api/auth/register", async (c) => {
  const parsed = credentials.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success)
    return c.json(
      {
        error: "Name, email, and password are invalid",
        details: parsed.error.flatten(),
      },
      400,
    );
  const email = parsed.data.email.toLowerCase();
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing) return c.json({ error: "Email already registered" }, 409);
  const [user] = await db
    .insert(users)
    .values({
      name: parsed.data.name,
      email,
      passwordHash: await hashPassword(parsed.data.password),
    })
    .returning();
  const token = await createAccessToken(user.id, user.email);
  return c.json(
    { token, user: { id: user.id, name: user.name, email: user.email } },
    201,
  );
});

app.post("/api/auth/login", async (c) => {
  const parsed = z
    .object({ email: z.string().email(), password: z.string().min(1) })
    .safeParse(await c.req.json().catch(() => null));
  if (!parsed.success)
    return c.json({ error: "Email or password is invalid" }, 400);
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, parsed.data.email.toLowerCase()))
    .limit(1);
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash)))
    return c.json({ error: "Email or password is incorrect" }, 401);
  const token = await createAccessToken(user.id, user.email);
  return c.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
});

app.get("/api/auth/me", authMiddleware, (c) => {
  const user = c.get("user");
  return c.json({ user: { id: user.id, name: user.name, email: user.email } });
});

app.get("/api/chat/history", authMiddleware, async (c) => {
  const user = c.get("user");
  const rows = await db
    .select({
      id: chatMessages.id,
      role: chatMessages.role,
      content: chatMessages.content,
      createdAt: chatMessages.createdAt,
    })
    .from(chatMessages)
    .where(eq(chatMessages.userId, user.id))
    .orderBy(chatMessages.createdAt);
  return c.json({ messages: rows });
});

const chatInput = z.object({
  message: z.string().trim().min(1).max(2000),
  lat: z.number().optional(),
  lon: z.number().optional(),
});
const systemPrompt = `Kamu adalah FoodMate, teman ngobrol yang santai dan ramah, membantu memilih makanan. Gunakan gaya bahasa yang hangat dan emoji secukupnya. Jika info dari user belum lengkap (budget, waktu makan, selera), tanya balik dengan pertanyaan sederhana dulu, jangan langsung kasih daftar panjang. Pertimbangkan cuaca jika tersedia dalam konteks percakapan. jangan memberi diagnosis medis; sarankan cek bahan dan konsultasi profesional untuk risiko kesehatan. Jangan mengarang atau menebak komposisi/bahan spesifik suatu makanan jika tidak yakin — cukup sebut nama makanannya saja tanpa rincian bahan yang salah, atau gunakan deskripsi umum yang aman seperti "makanan/minuman khas daerah tersebut". SELALU akhiri jawabanmu dengan baris terpisah berisi JSON : {"quick_replies": ["opsi singkat 1", "opsi singkat 2", "opsi singkat 3"]} — isi array dengan 3 balasan singkat yang relevan untuk user pilih selanjutnya.`;

app.post("/api/chat", authMiddleware, async (c) => {
  const parsed = chatInput.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success)
    return c.json({ error: "Message must contain 1-2000 characters" }, 400);
  const user = c.get("user");
  const recent = await db
    .select({ role: chatMessages.role, content: chatMessages.content })
    .from(chatMessages)
    .where(eq(chatMessages.userId, user.id))
    .orderBy(desc(chatMessages.createdAt))
    .limit(12);
  const weatherContext =
    parsed.data.lat !== undefined && parsed.data.lon !== undefined
      ? await getWeather(parsed.data.lat, parsed.data.lon)
      : "";

  const messages = [
    {
      role: "system",
      content:
        systemPrompt + (weatherContext ? `\n\nKonteks: ${weatherContext}` : ""),
    },
    ...recent
      .reverse()
      .map((item) => ({ role: item.role, content: item.content })),
    { role: "user", content: parsed.data.message },
  ];

  await db
    .insert(chatMessages)
    .values({ userId: user.id, role: "user", content: parsed.data.message });
  const result =
    aiProvider === "gemini"
      ? await askGemini(messages)
      : await askOllama(messages);
  if (!result.ok) {
    return c.json(
      { error: "AI model is unavailable", detail: result.detail },
      503,
    );
  }
  const rawAnswer = result.text || "Maaf, model belum mengembalikan jawaban.";

  let answer = rawAnswer;
  let quickReplies: string[] = [];
  const jsonMatch = rawAnswer.match(/\{[\s\S]*"quick_replies"[\s\S]*\}\s*$/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed.quick_replies)) {
        quickReplies = parsed.quick_replies;
        answer = rawAnswer.slice(0, jsonMatch.index).trim();
      }
    } catch {
      // biarkan answer tetap rawAnswer kalau JSON gagal di-parse
    }
  }

  await db
    .insert(chatMessages)
    .values({ userId: user.id, role: "assistant", content: answer });
  return c.json({ answer, quick_replies: quickReplies, model: result.model });
});

app.onError((error, c) => {
  console.error(error);
  return c.json({ error: "Internal server error" }, 500);
});

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`FoodMate API listening on port ${info.port}`);
});
