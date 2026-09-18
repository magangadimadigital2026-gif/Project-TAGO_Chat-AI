import dotenv from "dotenv";
import { google } from "@ai-sdk/google";
import { generateImage } from "ai";
import fs from "node:fs/promises";

dotenv.config({ path: ".env.local" });

async function main() {
  const { image } = await generateImage({
    model: google.image("gemini-3.1-flash-lite-image"),
    prompt: "Seekor beruang teddy memakai topi hitam sedang mendaki gunung.",
  });

  await fs.writeFile("public/generated-image.png", image.uint8Array);

  console.log("Gambar berhasil dibuat!");
  console.log("Lokasi: public/generated-image.png");
}

main().catch(console.error);
