
import "dotenv/config";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { z } from "zod";
import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { db } from "./db/index.js";
import { chatMessages, conversations, users } from "./db/schema.js";
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

function cleanAIReply(text: string): string {
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
    response = await callGemini(
      step.model,
      buildBody(step.thinking),
      15_000,
    );

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

// CORS: izinkan frontend menggunakan endpoint DELETE.
app.use(
  "/api/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
  }),
);

app.get("/health", (c) =>
  c.json({ status: "ok", service: "foodmate-api" }),
);

const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const header = c.req.header("Authorization");

  if (!header?.startsWith("Bearer ")) {
    return c.json({ error: "Missing bearer token" }, 401);
  }

  try {
    const { userId } = await readAccessToken(
      header.slice("Bearer ".length),
    );

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return c.json({ error: "User not found" }, 401);
    }

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

// REGISTER
app.post("/api/auth/register", async (c) => {
  const parsed = credentials.safeParse(
    await c.req.json().catch(() => null),
  );

  if (!parsed.success) {
    return c.json(
      {
        error: "Name, email, and password are invalid",
        details: parsed.error.flatten(),
      },
      400,
    );
  }

  const email = parsed.data.email.toLowerCase();

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    return c.json({ error: "Email already registered" }, 409);
  }

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
    {
      token,
      user: { id: user.id, name: user.name, email: user.email },
    },
    201,
  );
});

// LOGIN
app.post("/api/auth/login", async (c) => {
  const parsed = z
    .object({
      email: z.string().email(),
      password: z.string().min(1),
    })
    .safeParse(await c.req.json().catch(() => null));

  if (!parsed.success) {
    return c.json({ error: "Email or password is invalid" }, 400);
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, parsed.data.email.toLowerCase()))
    .limit(1);

  if (
    !user ||
    !(await verifyPassword(parsed.data.password, user.passwordHash))
  ) {
    return c.json({ error: "Email or password is incorrect" }, 401);
  }

  const token = await createAccessToken(user.id, user.email);

  return c.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
});

// USER LOGIN INFORMATION
app.get("/api/auth/me", authMiddleware, (c) => {
  const user = c.get("user");

  return c.json({
    user: { id: user.id, name: user.name, email: user.email },
  });
});

// RIWAYAT PESAN LAMA
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
    .orderBy(asc(chatMessages.createdAt));

  return c.json({ messages: rows });
});

// Memasukkan pesan lama yang belum memiliki percakapan ke satu percakapan.
async function adoptLegacyMessages(userId: number) {
  const legacy = await db
    .select({
      role: chatMessages.role,
      content: chatMessages.content,
      createdAt: chatMessages.createdAt,
    })
    .from(chatMessages)
    .where(
      and(
        eq(chatMessages.userId, userId),
        isNull(chatMessages.conversationId),
      ),
    )
    .orderBy(asc(chatMessages.createdAt));

  if (legacy.length === 0) return;

  const first = legacy.find((message) => message.role === "user") ?? legacy[0];
  const last = legacy[legacy.length - 1];

  const [conv] = await db
    .insert(conversations)
    .values({
      userId,
      title: first.content.slice(0, 50),
      createdAt: first.createdAt,
      updatedAt: last.createdAt,
    })
    .returning();

  await db
    .update(chatMessages)
    .set({ conversationId: conv.id })
    .where(
      and(
        eq(chatMessages.userId, userId),
        isNull(chatMessages.conversationId),
      ),
    );
}

// DAFTAR PERCAKAPAN MILIK PENGGUNA
app.get("/api/chat", authMiddleware, async (c) => {
  const user = c.get("user");

  await adoptLegacyMessages(user.id);

  const rows = await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, user.id))
    .orderBy(desc(conversations.updatedAt));

  return c.json({
    success: true,
    data: rows.map((row) => ({
      id: row.id,
      title: row.title,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })),
  });
});

// DETAIL PERCAKAPAN
app.get("/api/chat/:id", authMiddleware, async (c) => {
  const user = c.get("user");
  const id = Number(c.req.param("id"));

  if (!Number.isSafeInteger(id) || id <= 0) {
    return c.json(
      { success: false, message: "ID percakapan tidak valid" },
      400,
    );
  }

  const [conv] = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.id, id),
        eq(conversations.userId, user.id),
      ),
    )
    .limit(1);

  if (!conv) {
    return c.json(
      { success: false, message: "Percakapan tidak ditemukan" },
      404,
    );
  }

  const rows = await db
    .select({
      id: chatMessages.id,
      role: chatMessages.role,
      content: chatMessages.content,
      createdAt: chatMessages.createdAt,
    })
    .from(chatMessages)
    .where(
      and(
        eq(chatMessages.userId, user.id),
        eq(chatMessages.conversationId, conv.id),
      ),
    )
    .orderBy(asc(chatMessages.createdAt));

  return c.json({
    success: true,
    data: {
      id: conv.id,
      title: conv.title,
      messages: rows,
    },
  });
});

// HAPUS SATU PERCAKAPAN
app.delete("/api/chat/:id", authMiddleware, async (c) => {
  const user = c.get("user");
  const id = Number(c.req.param("id"));

  if (!Number.isSafeInteger(id) || id <= 0) {
    return c.json(
      { success: false, message: "ID percakapan tidak valid" },
      400,
    );
  }

  const [deletedConversation] = await db
    .delete(conversations)
    .where(
      and(
        eq(conversations.id, id),
        eq(conversations.userId, user.id),
      ),
    )
    .returning({ id: conversations.id });

  if (!deletedConversation) {
    return c.json(
      { success: false, message: "Percakapan tidak ditemukan" },
      404,
    );
  }

  return c.json({
    success: true,
    message: "Percakapan berhasil dihapus",
    data: { id: deletedConversation.id },
  });
});

// VALIDASI INPUT CHAT
const chatInput = z.object({
  message: z.string().trim().min(1).max(2000),
  conversationId: z.unknown().optional(),
  lat: z.number().optional(),
  lon: z.number().optional(),
});

const systemPrompt = `Kamu adalah FoodMate, teman ngobrol yang santai dan ramah, membantu memilih makanan. Gunakan gaya bahasa yang hangat dan emoji secukupnya. Jika info dari user belum lengkap (budget, waktu makan, selera), tanya balik dengan pertanyaan sederhana dulu, jangan langsung kasih daftar panjang. Pertimbangkan cuaca jika tersedia dalam konteks percakapan. jangan memberi diagnosis medis; sarankan cek bahan dan konsultasi profesional untuk risiko kesehatan. Jangan mengarang atau menebak komposisi/bahan spesifik suatu makanan jika tidak yakin - cukup sebut nama makanannya saja tanpa rincian bahan yang salah, atau gunakan deskripsi umum yang aman seperti "makanan/minuman khas daerah tersebut". Tulis dengan teks biasa: jangan pakai Markdown, tanda bintang, pagar, atau backtick. Untuk daftar, tulis angka dan titik di baris baru. SELALU akhiri jawabanmu dengan baris terpisah berisi JSON : {"quick_replies": ["opsi singkat 1", "opsi singkat 2", "opsi singkat 3"]} - isi array dengan 3 balasan singkat yang relevan untuk user pilih selanjutnya.`;

// KIRIM PESAN CHAT
app.post("/api/chat", authMiddleware, async (c) => {
  const parsed = chatInput.safeParse(
    await c.req.json().catch(() => null),
  );

  if (!parsed.success) {
    return c.json(
      { error: "Message must contain 1-2000 characters" },
      400,
    );
  }

  const user = c.get("user");
  const requestedId = Number(parsed.data.conversationId);
  let conversationId: number | null = null;

  if (Number.isInteger(requestedId) && requestedId > 0) {
    const [conv] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, requestedId),
          eq(conversations.userId, user.id),
        ),
      )
      .limit(1);

    if (!conv) {
      return c.json(
        {
          error: "Conversation not found",
          message: "Percakapan tidak ditemukan",
        },
        404,
      );
    }

    conversationId = conv.id;
  }

  const recent = conversationId
    ? await db
        .select({
          role: chatMessages.role,
          content: chatMessages.content,
        })
        .from(chatMessages)
        .where(
          and(
            eq(chatMessages.userId, user.id),
            eq(chatMessages.conversationId, conversationId),
          ),
        )
        .orderBy(desc(chatMessages.createdAt))
        .limit(12)
    : [];

  const weatherContext =
    parsed.data.lat !== undefined && parsed.data.lon !== undefined
      ? await getWeather(parsed.data.lat, parsed.data.lon)
      : "";

  const messages: ChatMsg[] = [
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

  const result =
    aiProvider === "gemini"
      ? await askGemini(messages)
      : await askOllama(messages);

  if (!result.ok || !result.text) {
    return c.json(
      {
        error: "AI model is unavailable",
        message: "AI sedang sibuk, coba kirim lagi sebentar.",
        detail: result.ok ? "Empty reply" : result.detail,
      },
      503,
    );
  }

  let answer = result.text;
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
      // Pertahankan jawaban jika JSON quick replies tidak valid.
    }
  }

  answer = cleanAIReply(answer);

  if (!conversationId) {
    const [conv] = await db
      .insert(conversations)
      .values({
        userId: user.id,
        title: parsed.data.message.slice(0, 50),
      })
      .returning();

    conversationId = conv.id;
  }

  await db.insert(chatMessages).values({
    userId: user.id,
    conversationId,
    role: "user",
    content: parsed.data.message,
  });

  await db.insert(chatMessages).values({
    userId: user.id,
    conversationId,
    role: "assistant",
    content: answer,
  });

  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(
      and(
        eq(conversations.id, conversationId),
        eq(conversations.userId, user.id),
      ),
    );

  return c.json({
    success: true,
    // Kompatibilitas dengan frontend lama.
    answer,
    quick_replies: quickReplies,
    model: result.model,
    // Data untuk frontend baru.
    conversationId,
    userMessage: parsed.data.message,
    aiReply: answer,
  });
});

// PENANGANAN ERROR
app.onError((error, c) => {
  console.error(error);
  return c.json({ error: "Internal server error" }, 500);
});

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`FoodMate API listening on port ${info.port}`);
});
