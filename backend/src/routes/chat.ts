
import { Hono } from "hono";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

const chat = new Hono();

// Membersihkan format Markdown dan blok JSON quick_replies.
function cleanAIReply(reply: unknown): string | null {
  if (typeof reply !== "string" || !reply.trim()) {
    return null;
  }

  let cleaned = reply.replace(/\r\n/g, "\n").trim();

  // Hapus blok JSON quick_replies yang dibungkus code fence.
  cleaned = cleaned.replace(
    /```(?:json)?\s*\{[\s\S]*?"quick_replies"\s*:[\s\S]*?\}\s*```\s*$/i,
    "",
  );

  // Hapus blok JSON quick_replies tanpa code fence.
  cleaned = cleaned.replace(
    /\n\s*\{\s*"quick_replies"\s*:[\s\S]*?\}\s*$/i,
    "",
  );

  // Hapus code fence yang tersisa.
  cleaned = cleaned.replace(/```(?:json)?/gi, "");

  // Hilangkan format Markdown tebal, miring, dan inline code.
  cleaned = cleaned
    .replace(/\*\*(.*?)\*\*/gs, "$1")
    .replace(/__(.*?)__/gs, "$1")
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "$1")
    .replace(/(?<!_)_([^_\n]+)_(?!_)/g, "$1")
    .replace(/`([^`\n]+)`/g, "$1")
    .replace(/^\s*#{1,6}\s+/gm, "")
    .trim();

  return cleaned || null;
}

chat.post("/", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const body = await c.req.json();

    const chatSchema = z.object({
      message: z.string().trim().min(1, "Pesan tidak boleh kosong"),
      conversationId: z.number().int().positive().optional(),
    });

    const result = chatSchema.safeParse(body);

    if (!result.success) {
      return c.json(
        {
          success: false,
          message: "Data tidak valid",
          errors: result.error.issues,
        },
        400,
      );
    }

    const { message, conversationId } = result.data;

    let conversation;

    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId: user.userId,
        },
      });

      if (!conversation) {
        return c.json(
          {
            success: false,
            message: "Percakapan tidak ditemukan",
          },
          404,
        );
      }
    } else {
      conversation = await prisma.conversation.create({
        data: {
          userId: user.userId,
          title: message.substring(0, 50),
        },
      });
    }

    const userMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: message,
      },
    });

    const conversationMessages = await prisma.message.findMany({
      where: {
        conversationId: conversation.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const messagesForAI = conversationMessages.map(
      (msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      }),
    );

    // Ambil menu makanan yang tersedia.
    const foods = await prisma.food.findMany({
      where: {
        isAvailable: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: true,
        subcategory: true,
        taste: true,
        spicyLevel: true,
        tags: true,
        isAvailable: true,
        portion: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    const foodContext = {
      menus: foods,
    };

    // Hubungi API AI teman.
    const aiResponse = await fetch(
      "http://192.168.1.31:3000/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messagesForAI,
          context: foodContext,
        }),
      },
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();

      console.error(
        "AI API ERROR:",
        aiResponse.status,
        aiResponse.statusText,
        errorText,
      );

      return c.json(
        {
          success: false,
          message: "Gagal menghubungi AI",
        },
        502,
      );
    }

    const aiData = (await aiResponse.json()) as {
      reply?: unknown;
    };

    // Bersihkan jawaban sebelum disimpan.
    const aiReply = cleanAIReply(aiData.reply);

    if (!aiReply) {
      console.error("AI API ERROR: Respons AI kosong atau tidak valid");

      return c.json(
        {
          success: false,
          message: "Respons AI tidak valid",
        },
        502,
      );
    }

    const aiMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: aiReply,
      },
    });

    return c.json(
      {
        success: true,
        message: "Chat berhasil",
        data: {
          conversationId: conversation.id,
          userMessage: userMessage.content,
          aiReply: aiMessage.content,
        },
      },
      201,
    );
  } catch (error) {
    console.error("CHAT ERROR:", error);

    return c.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server",
      },
      500,
    );
  }
});

// Mengambil daftar percakapan milik pengguna.
chat.get("/", authMiddleware, async (c) => {
  try {
    const user = c.get("user");

    const conversations = await prisma.conversation.findMany({
      where: {
        userId: user.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return c.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("GET CHAT ERROR:", error);

    return c.json(
      {
        success: false,
        message: "Gagal mengambil riwayat chat",
      },
      500,
    );
  }
});

// Mengambil satu percakapan beserta pesannya.
chat.get("/:id", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const id = Number(c.req.param("id"));

    if (!Number.isInteger(id) || id <= 0) {
      return c.json(
        {
          success: false,
          message: "ID percakapan tidak valid",
        },
        400,
      );
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId: user.userId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!conversation) {
      return c.json(
        {
          success: false,
          message: "Percakapan tidak ditemukan",
        },
        404,
      );
    }

    return c.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error("GET DETAIL CHAT ERROR:", error);

    return c.json(
      {
        success: false,
        message: "Gagal mengambil detail chat",
      },
      500,
    );
  }
});

export default chat;
