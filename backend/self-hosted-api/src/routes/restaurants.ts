import { Hono } from "hono";
import { restaurants } from "../data/restaurants.js";
import type { AppEnv } from "../types.js";

export const restaurantRoutes = new Hono<AppEnv>();

// GET /api/restaurants?q=bakso
restaurantRoutes.get("/", (c) => {
  const q = c.req.query("q")?.toLowerCase();
  const data = restaurants
    .filter(
      (r) =>
        !q ||
        r.nama.toLowerCase().includes(q) ||
        r.menu.some((m) => m.nama.toLowerCase().includes(q)),
    )
    .sort((a, b) => a.jarakKm - b.jarakKm);
  return c.json({ data });
});

// GET /api/restaurants/1
restaurantRoutes.get("/:id", (c) => {
  const id = Number(c.req.param("id"));
  const restaurant = restaurants.find((r) => r.id === id);
  if (!restaurant) return c.json({ error: "Restoran tidak ditemukan" }, 404);
  return c.json({ data: restaurant });
});
