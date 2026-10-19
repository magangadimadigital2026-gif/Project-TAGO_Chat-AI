import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { colors } from "../constants/palette";

// Cek sesi: ada token -> Chat, tidak ada -> Login.
export default function Index() {
  const [target, setTarget] = useState<"/chat" | "/login" | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("token").then((t) => setTarget(t ? "/chat" : "/login"));
  }, []);

  if (!target) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  return <Redirect href={target} />;
}