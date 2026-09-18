import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";

type Variables = {
  user: {
    userId: number;
    email: string;
    exp?: number;
    iat?: number;
  };
};

export const authMiddleware = createMiddleware<{ Variables: Variables }>(
  async (c, next) => {
    const authHeader = c.req.header("Authorization");

    if (!authHeader) {
      return c.json(
        {
          success: false,
          message: "Token tidak ditemukan",
        },
        401,
      );
    }

    const token = authHeader.replace("Bearer ", "");

    try {
      const payload = (await verify(
        token,
        process.env.JWT_SECRET!,
        "HS256",
      )) as unknown as Variables["user"];

      c.set("user", payload);

      await next();
    } catch (error) {
      console.error("JWT ERROR:", error);

      return c.json(
        {
          success: false,
          message: "Token tidak valid atau sudah expired",
        },
        401,
      );
    }
  },
);
