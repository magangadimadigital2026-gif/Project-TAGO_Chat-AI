import dotenv from "dotenv";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

dotenv.config({ path: ".env.local" });

async function main() {
  const { text } = await generateText({
    model: google("gemini-3.6-flash"),
    prompt: "Buatkan contoh function JavaScript untuk menghitung luas persegi.",
  });

  console.log("Jawaban AI:");
  console.log(text);
}

main();
