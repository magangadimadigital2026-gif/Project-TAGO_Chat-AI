import { trpc } from "@/lib/trpc";
import { startOAuthLogin } from "@/constants/oauth";
import { useAuth } from "@/hooks/use-auth";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Halo! Aku FoodMate. Ceritakan selera, budget, lokasi, atau kondisi kamu hari ini—aku bantu pilih makanan yang paling cocok.",
};

const suggestions = ["Makan siang hemat", "Lagi hujan", "Tinggi protein", "Kuliner dekat saya"];

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: 20, paddingBottom: 18, gap: 12 },
  messageRow: { flexDirection: "row", marginBottom: 4 },
  messageBubble: { maxWidth: "86%", borderRadius: 18, paddingHorizontal: 15, paddingVertical: 12 },
  inputRow: { flexDirection: "row", alignItems: "flex-end", gap: 10, paddingHorizontal: 20, paddingTop: 10 },
  input: { flex: 1, minHeight: 48, maxHeight: 120, borderRadius: 18, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15 },
  sendButton: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
});

export default function HomeScreen() {
  const colors = useColors();
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const historyQuery = trpc.chat.history.useQuery(undefined, { enabled: isAuthenticated });
  const sendMutation = trpc.chat.send.useMutation();

  useEffect(() => {
    if (historyQuery.data?.length) {
      setMessages(
        historyQuery.data.map((message) => ({
          id: String(message.id),
          role: message.role,
          content: message.content,
        })),
      );
    }
  }, [historyQuery.data]);

  const displayName = useMemo(() => user?.name?.split(" ")[0] || "kamu", [user?.name]);

  const handleLogin = async () => {
    try {
      await startOAuthLogin();
    } catch (error) {
      Alert.alert("Login gagal", error instanceof Error ? error.message : "Coba lagi.");
    }
  };

  const handleSend = async (preset?: string) => {
    const content = (preset ?? draft).trim();
    if (!content || sendMutation.isPending) return;

    setDraft("");
    const userMessage: ChatMessage = { id: `local-${Date.now()}`, role: "user", content };
    setMessages((current) => [...current, userMessage]);

    try {
      const result = await sendMutation.mutateAsync({ message: content });
      setMessages((current) => [
        ...current,
        { id: `assistant-${Date.now()}`, role: "assistant", content: result.answer },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: error instanceof Error ? error.message : "Maaf, aku belum bisa menjawab. Coba lagi.",
        },
      ]);
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="px-6 pt-8">
        <View className="flex-1 justify-between pb-8">
          <View className="gap-6 pt-12">
            <View className="h-16 w-16 items-center justify-center rounded-3xl bg-primary">
              <IconSymbol name="fork.knife" size={30} color="#FFFFFF" />
            </View>
            <View className="gap-3">
              <Text className="text-4xl font-bold leading-tight text-foreground">Makan lebih tepat.</Text>
              <Text className="text-base leading-6 text-muted">
                FoodMate membaca kebutuhanmu dan memberi rekomendasi makanan yang terasa personal, bukan asal daftar menu.
              </Text>
            </View>
            <View className="gap-3 rounded-3xl border border-border bg-surface p-5">
              <Text className="text-lg font-semibold text-foreground">Yang bisa kamu tanyakan</Text>
              <Text className="text-sm leading-5 text-muted">Budget, cuaca, lokasi, alergi, preferensi diet, sampai makanan yang sedang kamu inginkan.</Text>
            </View>
          </View>
          <View className="gap-3">
            <Pressable onPress={handleLogin} style={({ pressed }) => [pressed && { opacity: 0.8 }, { backgroundColor: colors.primary, borderRadius: 18, padding: 16, alignItems: "center" }]}>
              <Text className="font-semibold text-white">Masuk atau daftar</Text>
            </Pressable>
            <Text className="text-center text-xs leading-4 text-muted">Akun diperlukan agar riwayat chat tersimpan aman.</Text>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View className="border-b border-border px-5 pb-4 pt-3">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xs font-semibold uppercase tracking-widest text-primary">FOODMATE AI</Text>
              <Text className="mt-1 text-2xl font-bold text-foreground">Hai, {displayName}</Text>
            </View>
            <Pressable onPress={logout} style={({ pressed }) => [pressed && { opacity: 0.6 }, { padding: 8 }]}>
              <IconSymbol name="person.crop.circle" size={28} color={colors.muted} />
            </Pressable>
          </View>
          <Text className="mt-2 text-sm text-muted">Ceritakan kebutuhan makanmu hari ini.</Text>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <View style={[styles.messageRow, { justifyContent: item.role === "user" ? "flex-end" : "flex-start" }]}>
              <View style={[styles.messageBubble, { backgroundColor: item.role === "user" ? colors.primary : colors.surface }]}>
                <Text style={{ color: item.role === "user" ? "#FFFFFF" : colors.foreground, fontSize: 15, lineHeight: 22 }}>{item.content}</Text>
              </View>
            </View>
          )}
          ListHeaderComponent={
            <View className="mt-5 mb-1">
              <Text className="mb-3 text-sm font-semibold text-foreground">Coba mulai dari sini</Text>
              <View className="flex-row flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <Pressable key={suggestion} onPress={() => handleSend(suggestion)} style={({ pressed }) => [pressed && { opacity: 0.6 }, { borderColor: colors.border, borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 }]}>
                    <Text style={{ color: colors.foreground, fontSize: 13 }}>{suggestion}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          }
        />

        <View style={styles.inputRow}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Contoh: makanan hangat di bawah 30 ribu"
            placeholderTextColor={colors.muted}
            multiline
            returnKeyType="send"
            onSubmitEditing={() => handleSend()}
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.surface }]}
          />
          <Pressable onPress={() => handleSend()} disabled={!draft.trim() || sendMutation.isPending} style={({ pressed }) => [styles.sendButton, { backgroundColor: colors.primary, opacity: !draft.trim() || sendMutation.isPending ? 0.45 : pressed ? 0.75 : 1 }]}>
            {sendMutation.isPending ? <ActivityIndicator size="small" color="#FFFFFF" /> : <IconSymbol name="paperplane.fill" size={22} color="#FFFFFF" />}
          </Pressable>
        </View>
        <Text className="px-5 pb-2 pt-2 text-center text-[11px] text-muted">AI bisa keliru. Selalu cek alergi dan kondisi kesehatan sebelum makan.</Text>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
