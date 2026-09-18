import { randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { SignJWT, jwtVerify } from "jose";

const scrypt = promisify(nodeScrypt);
const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "change-me-in-production");

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, storedKey] = stored.split(":");
  if (!salt || !storedKey) return false;
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(storedKey, "hex");
  return expected.length === derivedKey.length && timingSafeEqual(expected, derivedKey);
}

export async function createAccessToken(userId: number, email: string) {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN ?? "7d")
    .sign(secret);
}

export async function readAccessToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  const userId = Number(payload.sub);
  if (!Number.isInteger(userId) || userId <= 0) throw new Error("Invalid token subject");
  return { userId, email: String(payload.email ?? "") };
}
