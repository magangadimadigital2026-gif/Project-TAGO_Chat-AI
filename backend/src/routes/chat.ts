import { Hono } from "hono";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

const chat = new Hono();

chat.post("/", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const body = await c.req.json();

    const chatSchema = z.object({
      message: z.string().min(1, "Pesan tidak boleh kosong"),
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

    if (!message) {
      return c.json(
        {
          success: false,
          message: "Pesan wajib diisi",
        },
        400,
      );
    }

    let conversation;

    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: {
          id: Number(conversationId),
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

    // Ambil data makanan yang tersedia dari database
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

    // Context makanan yang akan dikirim ke AI
    const foodContext = {
      menus: foods,
    };

    console.log(
      "REQUEST KE AI:",
      JSON.stringify(
        {
          messages: messagesForAI,
          context: foodContext,
        },
        null,
        2,
      ),
    );

    const aiResponse = await fetch("http://192.168.1.31:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messagesForAI,
        context: foodContext,
      }),
    });

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

    const aiData = await aiResponse.json();

    const aiReply = aiData.reply;

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

chat.get("/:id", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const id = Number(c.req.param("id"));

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: id,
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
