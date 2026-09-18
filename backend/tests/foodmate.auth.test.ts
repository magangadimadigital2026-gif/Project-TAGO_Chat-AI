import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../self-hosted-api/src/auth";

describe("FoodMate self-hosted auth", () => {
  it("hashes and verifies the original password", async () => {
    const stored = await hashPassword("foodmate-secret-123");
    expect(stored).not.toContain("foodmate-secret-123");
    await expect(verifyPassword("foodmate-secret-123", stored)).resolves.toBe(true);
    await expect(verifyPassword("wrong-password", stored)).resolves.toBe(false);
  });

  it("rejects malformed password hashes", async () => {
    await expect(verifyPassword("anything", "not-a-valid-hash")).resolves.toBe(false);
  });
});
