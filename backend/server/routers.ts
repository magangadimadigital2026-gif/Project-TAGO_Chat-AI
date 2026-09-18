import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

const FOODMATE_SYSTEM_PROMPT = `Kamu adalah FoodMate, asisten rekomendasi makanan berbahasa Indonesia.
Tugasmu membantu user memilih makanan yang realistis dan aman berdasarkan selera, budget, lokasi, cuaca, waktu makan, alergi, dan kondisi kesehatan yang mereka ceritakan.
Jawab ringkas namun praktis. Berikan 2-4 opsi, alasan singkat, estimasi budget bila ada, dan satu pertanyaan lanjutan jika informasi penting belum tersedia.
Jangan mengaku mengetahui lokasi atau cuaca user tanpa data. Jangan memberi diagnosis medis; untuk alergi atau kondisi kesehatan, sarankan verifikasi bahan dan konsultasi profesional bila perlu.
Jika user ingin memesan, jelaskan bahwa integrasi TAGO akan ditambahkan pada tahap berikutnya.`;

function extractText(content: string | Array<{ type: string; text?: string }>) {
  if (typeof content === "string") return content;
  return content.map((part) => part.type === "text" ? part.text ?? "" : "").join(" ").trim();
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  chat: router({
    history: protectedProcedure.query(({ ctx }) => db.listChatMessages(ctx.user.id)),

    send: protectedProcedure
      .input(z.object({ message: z.string().trim().min(1).max(2000) }))
      .mutation(async ({ ctx, input }) => {
        const previousMessages = await db.getRecentChatMessages(ctx.user.id);
        await db.createChatMessage({ userId: ctx.user.id, role: "user", content: input.message });

        const response = await invokeLLM({
          messages: [
            { role: "system", content: FOODMATE_SYSTEM_PROMPT },
            ...previousMessages.map((message) => ({ role: message.role, content: message.content })),
            { role: "user", content: input.message },
          ],
          reasoning: { effort: "low" },
          maxTokens: 700,
        });

        const rawContent = response.choices[0]?.message?.content;
        const answer = rawContent ? extractText(rawContent) : "Maaf, aku belum mendapat jawaban dari model AI.";
        await db.createChatMessage({ userId: ctx.user.id, role: "assistant", content: answer });
        return { answer };
      }),
  }),
});

export type AppRouter = typeof appRouter;
