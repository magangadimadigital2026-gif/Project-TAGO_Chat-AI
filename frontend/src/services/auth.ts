import { API_URL } from "../constants/api";

export class AuthError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

async function post(path: string, body: object, fallback: string) {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new AuthError(
      "Tidak dapat terhubung ke server. Periksa koneksi Backend.",
      "NETWORK"
    );
  }

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new AuthError(result.error || result.message || fallback, result.code);
  }
  return result;
}

export async function login(email: string, password: string) {
  const result = await post(
    "/api/auth/login",
    { email: email.trim(), password },
    "Email atau password salah."
  );

  const token: string | undefined = result.data?.token ?? result.token;
  const user: { name?: string; email?: string } | undefined =
    result.data?.user ?? result.user;

  if (!token) throw new AuthError("Token tidak ditemukan dari server.", "NO_TOKEN");
  return { token, user };
}

export async function register(name: string, email: string, password: string) {
  await post(
    "/api/auth/register",
    { name: name.trim(), email: email.trim(), password },
    "Silakan coba lagi."
  );
}
