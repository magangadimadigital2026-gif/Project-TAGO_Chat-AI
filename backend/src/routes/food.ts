import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";

const food = new Hono();

// GET semua makanan yang tersedia
food.get("/", async (c) => {
  try {
    const foods = await prisma.food.findMany({
      where: {
        isAvailable: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    return c.json({
      success: true,
      data: foods,
    });
  } catch (error) {
    console.error("GET FOODS ERROR:", error);

    return c.json(
      {
        success: false,
        message: "Gagal mengambil data makanan",
      },
      500,
    );
  }
});

// GET detail satu makanan
food.get("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));

    if (!Number.isInteger(id)) {
      return c.json(
        {
          success: false,
          message: "ID makanan tidak valid",
        },
        400,
      );
    }

    const foodData = await prisma.food.findUnique({
      where: {
        id: id,
      },
    });

    if (!foodData) {
      return c.json(
        {
          success: false,
          message: "Makanan tidak ditemukan",
        },
        404,
      );
    }

    return c.json({
      success: true,
      data: foodData,
    });
  } catch (error) {
    console.error("GET FOOD DETAIL ERROR:", error);

    return c.json(
      {
        success: false,
        message: "Gagal mengambil detail makanan",
      },
      500,
    );
  }
});

export default food;
