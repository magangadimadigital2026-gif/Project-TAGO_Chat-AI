import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { sign } from "hono/jwt";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";

const auth = new Hono();

auth.post("/register", async (c) => {
  try {
    const body = await c.req.json();

    const registerSchema = z.object({
      name: z.string().min(2, "Nama minimal 2 karakter"),
      email: z.string().email("Format email tidak valid"),
      password: z.string().min(8, "Password minimal 8 karakter"),
    });

    const result = registerSchema.safeParse(body);

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

    const { name, email, password } = result.data;

    if (!name || !email || !password) {
      return c.json(
        {
          success: false,
          message: "Nama, email, dan password wajib diisi",
        },
        400,
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return c.json(
        {
          success: false,
          message: "Email sudah terdaftar",
        },
        409,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return c.json(
      {
        success: true,
        message: "Registrasi berhasil",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      201,
    );
  } catch (error) {
    console.error(error);

    return c.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server",
      },
      500,
    );
  }
});

auth.post("/login", async (c) => {
  try {
    const body = await c.req.json();

    const loginSchema = z.object({
      email: z.string().email("Format email tidak valid"),
      password: z.string().min(8, "Password minimal 8 karakter"),
    });

    const result = loginSchema.safeParse(body);

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

    const { email, password } = result.data;

    if (!email || !password) {
      return c.json(
        {
          success: false,
          message: "Email dan password wajib diisi.",
        },
        400,
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return c.json(
        {
          success: false,
          message: "Email atau password salah.",
        },
        401,
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return c.json(
        {
          success: false,
          message: "Email atau password salah",
        },
        401,
      );
    }

    const token = await sign(
      {
        userId: user.id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      },
      process.env.JWT_SECRET!,
    );

    return c.json({
      success: true,
      message: "Login berhasil",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      },
    });
  } catch (error) {
    console.error(error);

    return c.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server",
      },
      500,
    );
  }
});

auth.get("/me", authMiddleware, async (c) => {
  const user = c.get("user");

  return c.json({
    success: true,
    message: "Token valid",
    data: user,
  });
});

export default auth;
