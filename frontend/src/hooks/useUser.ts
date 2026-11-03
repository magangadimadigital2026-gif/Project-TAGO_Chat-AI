import { useEffect, useState } from "react";
import { getUser } from "../services/session";

// Membaca nama & email pengguna yang tersimpan.
export function useUser() {
  const [user, setUser] = useState({ name: "", email: "" });

  useEffect(() => {
    getUser()
      .then(setUser)
      .catch((e) => console.log("Gagal mengambil data profil:", e));
  }, []);

  return user;
}
