import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import auth from "./routes/auth.js";
import chat from "./routes/chat.js";
import food from "./routes/food.js";

const app = new Hono();

app.use("/api/*", cors());
app.route("/api/auth", auth);
app.route("/api/chat", chat);
app.route("/api/foods", food);

app.get("/", (c) => {
  return c.json({
    succes: true,
    message: "Food AI Backend API",
  });
});

app.onError((err, c) => {
  console.error("GLOBAL ERROR:", err);

  return c.json(
    {
      success: false,
      message: "Terjadi kesalahan pada server",
    },
    500,
  );
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
    hostname: "0.0.0.0",
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
