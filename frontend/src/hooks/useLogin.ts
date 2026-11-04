import { useRouter } from "expo-router";
import { useState } from "react";
import { AuthError, login } from "../services/auth";
import { saveSession } from "../services/session";
import { confirmAction, notify } from "../utils/notify";

export function useLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      notify("Peringatan", "Email dan password harus diisi.");
      return;
    }

    try {
      setLoading(true);
      const { token, user } = await login(email, password);
      await saveSession({
        token,
        password,
        name: user?.name,
        email: user?.email ?? email.trim(),
      });
      router.replace("/chat");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Terjadi kesalahan.";
      const code = e instanceof AuthError ? e.code : undefined;

      if (code === "ACCOUNT_NOT_FOUND") {
        // Akun belum terdaftar -> tawarkan pindah ke halaman daftar
        confirmAction("Akun Belum Terdaftar", message, "Daftar", () => router.push("/register"), false);
      } else if (code === "INVALID_PASSWORD") {
        notify("Password Salah", message);
      } else if (code === "NETWORK") {
        notify("Gagal", message);
      } else {
        notify("Login Gagal", message);
      }
    } finally {
      setLoading(false);
    }
  };

  const goRegister = () => router.push("/register");

  return { email, setEmail, password, setPassword, loading, handleLogin, goRegister };
}
