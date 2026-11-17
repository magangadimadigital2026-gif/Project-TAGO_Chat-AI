import { Hono } from "hono";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth.js";
import { getWeatherData } from "../lib/weather.js";
import type { AppEnv } from "../types.js";

const query = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

export const weatherRoutes = new Hono<AppEnv>();

// GET /api/weather?lat=-8.0657&lon=111.9025
weatherRoutes.get("/", authMiddleware, async (c) => {
  const parsed = query.safeParse({
    lat: c.req.query("lat"),
    lon: c.req.query("lon"),
  });
  if (!parsed.success) {
    return c.json(
      { error: "lat dan lon wajib diisi dengan koordinat yang valid" },
      400,
    );
  }

  const weather = await getWeatherData(parsed.data.lat, parsed.data.lon);
  if (!weather) {
    return c.json({ error: "Data cuaca belum tersedia" }, 503);
  }

  return c.json({ weather });
});
