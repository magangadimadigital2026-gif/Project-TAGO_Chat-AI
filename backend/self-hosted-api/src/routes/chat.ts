import { Hono } from "hono";
import { z } from "zod";
import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { db } from "../db/index.js";
import { chatMessages, conversations } from "../db/schema.js";
import { authMiddleware } from "../middleware/auth.js";
import { askAI, extractQuickReplies } from "../lib/ai.js";
import { systemPrompt } from "../lib/prompt.js";
import { getWeather } from "../lib/weather.js";
import {
  buildRestaurantContext,
  extractRecommendations,
  selectRestaurants,
  toRecommendations,
} from "../lib/restaurants.js";
import type { AppEnv } from "../types.js";

const chatInput = z.object({
  message: z.string().trim().min(1).max(2000),
  conversationId: z
    .union([z.number().int().positive(), z.string().regex(/^\d+$/)])
    .optional(),
  lat: z.number().optional(),
  lon: z.number().optional(),
});

// Pindahkan pesan lama yang belum memiliki conversation_id
// ke satu percakapan lama. Isi pesan tidak dihapus.
async function adoptLegacyMessages(userId: number) {
  const [firstMessage] = await db
    .select({
      id: chatMessages.id,
      content: chatMessages.content,
    })
    .from(chatMessages)
    .where(
      and(eq(chatMessages.userId, userId), isNull(chatMessages.conversationId)),
    )
    .orderBy(asc(chatMessages.id))
    .limit(1);

  if (!firstMessage) return;

  const [conversation] = await db
    .insert(conversations)
    .values({
      userId,
      title: firstMessage.content.slice(0, 100) || "Riwayat sebelumnya",
    })
    .returning({ id: conversations.id });

  await db
    .update(chatMessages)
    .set({ conversationId: conversation.id })
    .where(
      and(eq(chatMessages.userId, userId), isNull(chatMessages.conversationId)),
    );
}

export const chatRoutes = new Hono<AppEnv>();

// Endpoint kompatibilitas untuk riwayat lama.
chatRoutes.get("/history", authMiddleware, async (c) => {
  const user = c.get("user");

  await adoptLegacyMessages(user.id);

  const rows = await db
    .select({
      id: chatMessages.id,
      role: chatMessages.role,
      content: chatMessages.content,
      createdAt: chatMessages.createdAt,
      conversationId: chatMessages.conversationId,
    })
    .from(chatMessages)
    .where(eq(chatMessages.userId, user.id))
    .orderBy(asc(chatMessages.id));

  return c.json({ messages: rows });
});

// Mengambil daftar percakapan milik pengguna.
chatRoutes.get("/", authMiddleware, async (c) => {
  const user = c.get("user");

  await adoptLegacyMessages(user.id);

  const rows = await db
    .select({
      id: conversations.id,
      title: conversations.title,
      createdAt: conversations.createdAt,
      updatedAt: conversations.updatedAt,
    })
    .from(conversations)
    .where(eq(conversations.userId, user.id))
    .orderBy(desc(conversations.updatedAt));

  return c.json({ success: true, data: rows });
});

// Mengambil pesan dari satu percakapan yang dipilih.
chatRoutes.get("/:id", authMiddleware, async (c) => {
  const user = c.get("user");
  const conversationId = Number(c.req.param("id"));

  if (!Number.isSafeInteger(conversationId) || conversationId < 1) {
    return c.json(
      { success: false, message: "ID percakapan tidak valid" },
      400,
    );
  }

  const [conversation] = await db
    .select({
      id: conversations.id,
      title: conversations.title,
    })
    .from(conversations)
    .where(
      and(
        eq(conversations.id, conversationId),
        eq(conversations.userId, user.id),
      ),
    )
    .limit(1);

  if (!conversation) {
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
        eq(chatMessages.conversationId, conversation.id),
      ),
    )
    .orderBy(asc(chatMessages.id));

  return c.json({
    success: true,
    data: {
      id: conversation.id,
      title: conversation.title,
      messages: rows,
    },
  });
});

// Menghapus satu percakapan beserta semua pesannya.
chatRoutes.delete("/:id", authMiddleware, async (c) => {
  const user = c.get("user");
  const conversationId = Number(c.req.param("id"));

  if (!Number.isSafeInteger(conversationId) || conversationId < 1) {
    return c.json(
      { success: false, message: "ID percakapan tidak valid" },
      400,
    );
  }

  const [conversation] = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(
      and(
        eq(conversations.id, conversationId),
        eq(conversations.userId, user.id),
      ),
    )
    .limit(1);

  if (!conversation) {
    return c.json(
      { success: false, message: "Percakapan tidak ditemukan" },
      404,
    );
  }

  // Hapus pesan dulu, baru percakapannya.
  await db
    .delete(chatMessages)
    .where(
      and(
        eq(chatMessages.userId, user.id),
        eq(chatMessages.conversationId, conversation.id),
      ),
    );

  await db
    .delete(conversations)
    .where(
      and(
        eq(conversations.id, conversation.id),
        eq(conversations.userId, user.id),
      ),
    );

  return c.json({ success: true, message: "Percakapan dihapus" });
});

// Kirim pesan baru dan dapatkan jawaban AI.
chatRoutes.post("/", authMiddleware, async (c) => {
  const parsed = chatInput.safeParse(await c.req.json().catch(() => null));

  if (!parsed.success) {
    return c.json(
      { success: false, message: "Pesan atau ID percakapan tidak valid" },
      400,
    );
  }

  const user = c.get("user");

  await adoptLegacyMessages(user.id);

  let conversationId: number | undefined;

  if (parsed.data.conversationId !== undefined) {
    conversationId = Number(parsed.data.conversationId);

    const [existingConversation] = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, user.id),
        ),
      )
      .limit(1);

    if (!existingConversation) {
      return c.json(
        { success: false, message: "Percakapan tidak ditemukan" },
        404,
      );
    }
  }

  // Konteks AI hanya mengambil pesan dari percakapan yang aktif.
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
        .orderBy(desc(chatMessages.id))
        .limit(12)
    : [];

  const weatherContext =
    parsed.data.lat !== undefined && parsed.data.lon !== undefined
      ? await getWeather(parsed.data.lat, parsed.data.lon)
      : "";

  // Pilih tempat yang cocok dengan pesan (dan pesan user sebelumnya di percakapan ini).
  const searchText = [
    ...recent
      .filter((item) => item.role === "user")
      .map((item) => item.content),
    parsed.data.message,
  ].join(" ");
  const candidates = selectRestaurants(searchText);

  const messages = [
    {
      role: "system",
      content:
        systemPrompt +
        (weatherContext ? `\n\nKonteks: ${weatherContext}` : "") +
        `\n\n${buildRestaurantContext(candidates)}`,
    },
    ...recent.reverse().map((item) => ({
      role: item.role,
      content: item.content,
    })),
    { role: "user", content: parsed.data.message },
  ];

  const result = await askAI(messages);

  if (!result.ok || !result.text) {
    return c.json(
      {
        success: false,
        error: "AI model is unavailable",
        message: "AI sedang sibuk, coba kirim lagi sebentar.",
        detail: result.ok ? "Empty reply" : result.detail,
      },
      503,
    );
  }

  // Ambil id restoran yang direkomendasikan AI, lalu isi detailnya dari data.
  const { text: replyText, ids: recommendedIds } = extractRecommendations(
    result.text,
    candidates.map((item) => item.id),
  );
  const { answer, quickReplies } = extractQuickReplies(replyText);
  const recommendations = toRecommendations(recommendedIds);

  // Buat percakapan baru hanya setelah AI berhasil menjawab.
  if (conversationId === undefined) {
    const [newConversation] = await db
      .insert(conversations)
      .values({
        userId: user.id,
        title: parsed.data.message.slice(0, 100),
      })
      .returning({ id: conversations.id });

    conversationId = newConversation.id;
  }

  // Simpan pesan user dan AI ke percakapan yang sama.
  await db.insert(chatMessages).values([
    {
      userId: user.id,
      conversationId,
      role: "user",
      content: parsed.data.message,
    },
    {
      userId: user.id,
      conversationId,
      role: "assistant",
      content: answer,
    },
  ]);

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
    answer,
    quick_replies: quickReplies,
    recommendations,
    model: result.model,
    conversationId,
    userMessage: parsed.data.message,
    aiReply: answer,
  });
});
