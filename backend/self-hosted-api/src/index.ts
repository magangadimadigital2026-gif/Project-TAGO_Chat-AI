import "dotenv/config";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { Hono } from "hono";
import { authRoutes } from "./routes/auth.js";
import { chatRoutes } from "./routes/chat.js";
import { restaurantRoutes } from "./routes/restaurants.js";
import { serveStatic } from "@hono/node-server/serve-static";
import type { AppEnv } from "./types.js";

const app = new Hono<AppEnv>();
const port = Number(process.env.PORT ?? 3000);

app.use(
  "/api/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
  }),
);

app.get("/health", (c) => c.json({ status: "ok", service: "foodmate-api" }));
app.use("/images/*", serveStatic({ root: "./public" }));
app.route("/api/auth", authRoutes);
app.route("/api/chat", chatRoutes);
app.route("/api/restaurants", restaurantRoutes);

app.onError((error, c) => {
  console.error(error);
  return c.json({ error: "Internal server error" }, 500);
});

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`FoodMate API listening on port ${info.port}`);
});
