import { useRouter } from "expo-router";
import { useCallback } from "react";
import { clearSession } from "../services/session";
import { confirmAction } from "../utils/notify";

export function useLogout() {
  const router = useRouter();

  return useCallback(() => {
    confirmAction("Logout", "Yakin ingin keluar?", "Logout", async () => {
      await clearSession();
      router.replace("/login");
    });
  }, [router]);
}
