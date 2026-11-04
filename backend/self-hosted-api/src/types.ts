import type { users } from "./db/schema.js";

export type AppEnv = { Variables: { user: typeof users.$inferSelect } };

export type ChatMsg = { role: string; content: string };

export type AiResult =
  | { ok: true; text: string; model: string }
  | { ok: false; detail: string };
