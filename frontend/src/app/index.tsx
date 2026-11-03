import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { Loading } from "../components/ui";
import { colors } from "../constants/palette";

// Cek sesi: ada token -> Chat, tidak ada -> Login.
export default function Index() {
  const [target, setTarget] = useState<"/chat" | "/login" | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("token").then((t) => setTarget(t ? "/chat" : "/login"));
  }, []);

  if (!target) return <Loading style={{ backgroundColor: colors.bg }} />;
  return <Redirect href={target} />;
}
