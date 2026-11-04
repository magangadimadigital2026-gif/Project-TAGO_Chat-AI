import { useRouter } from "expo-router";
import { useState } from "react";
import { register } from "../services/auth";
import { notify } from "../utils/notify";
import { validateRegister } from "../utils/validators";

export function useRegister() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const error = validateRegister({ name, email, password, confirmPassword });
    if (error) {
      notify("Peringatan", error);
      return;
    }

    try {
      setLoading(true);
      await register(name, email, password);
      notify("Berhasil", "Akun berhasil dibuat. Silakan login.", () =>
        router.replace("/login")
      );
    } catch (e) {
      notify("Pendaftaran Gagal", e instanceof Error ? e.message : "Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const goLogin = () => router.replace("/login");

  return {
    name, setName,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    loading, handleRegister, goLogin,
  };
}
