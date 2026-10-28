import { Hono } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import {
  createAccessToken,
  hashPassword,
  verifyPassword,
} from "../auth.js";
import { authMiddleware } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

const credentials = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(128),
});

const loginInput = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authRoutes = new Hono<AppEnv>();

authRoutes.post("/register", async (c) => {
  const parsed = credentials.safeParse(await c.req.json().catch(() => null));

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
    { token, user: { id: user.id, name: user.name, email: user.email } },
    201,
  );
});

authRoutes.post("/login", async (c) => {
  const parsed = loginInput.safeParse(await c.req.json().catch(() => null));

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

authRoutes.get("/me", authMiddleware, (c) => {
  const user = c.get("user");

  return c.json({
    user: { id: user.id, name: user.name, email: user.email },
  });
});
