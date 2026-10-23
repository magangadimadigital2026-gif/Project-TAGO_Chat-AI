import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../constants/palette";
import { Rec, getConversation, sendMessage } from "../services/chat";
import { confirmAction, notify } from "../utils/notify";
import { clearPassword } from "../utils/secret";

type Msg = {
  id: string;
  role: "user" | "ai";
  text: string;
  recs?: Rec[];
  failed?: boolean;
};

const EXAMPLES = [
  "Makanan pedas tapi hemat",
  "Sarapan sehat yang cepat",
  "Mie kuah untuk malam hujan",
];

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { id, fresh } = useLocalSearchParams<{ id?: string; fresh?: string }>();
  const listRef = useRef<FlatList<Msg>>(null);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [convId, setConvId] = useState<string | undefined>(id);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState({ name: "User", email: "" });

  useEffect(() => {
    (async () => {
      const name = await AsyncStorage.getItem("userName");
      const email = await AsyncStorage.getItem("userEmail");
      setUser({ name: name || "User", email: email || "" });
    })();
  }, []);

    // Buka percakapan lama (id), mulai baru (fresh), atau muat riwayat terakhir.
    useEffect(() => {
      const target = id;

      setConvId(target);
      setMessages([]);
      setSuggestions([]);

      if (!target) return;

      setLoading(true);

      getConversation(target)
        .then((c) =>
          setMessages(
            c.messages.map((m) => ({
              id: m.id,
              role: m.role,
              text: m.text,
              recs: m.recommendations,
            }))
          )
        )
        .catch((e) => notify("Gagal memuat", e.message))
        .finally(() => setLoading(false));
    }, [id, fresh]);

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || sending) return;

    const userMsg: Msg = { id: `u${Date.now()}`, role: "user", text };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setSuggestions([]);
    setSending(true);

    try {
      const r = await sendMessage(text, convId);
      setConvId(r.conversationId);
      setMessages((p) => [
        ...p,
        { id: `a${Date.now()}`, role: "ai", text: r.reply, recs: r.recommendations },
      ]);
      setSuggestions(r.suggestions ?? []);
    } catch {
      setMessages((p) =>
        p.map((m) => (m.id === userMsg.id ? { ...m, failed: true } : m))
      );
    } finally {
      setSending(false);
    }
  };

  const retry = (m: Msg) => {
    setMessages((p) => p.filter((x) => x.id !== m.id));
    send(m.text);
  };

  const openHistory = () => {
    setMenuOpen(false);
    router.push("/history");
  };

  const openProfile = () => {
    setMenuOpen(false);
    router.push("/profile");
  };

  const logout = () => {
    setMenuOpen(false);
    confirmAction("Logout", "Yakin ingin keluar?", "Logout", async () => {
      await AsyncStorage.multiRemove(["token", "userName", "userEmail"]);
      await clearPassword();
      router.replace("/login");
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.logoWrap}>
          <Image source={require("../../assets/images/goai.png")} style={styles.logo} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>GoAI</Text>
          <Text style={styles.subtitle}>Asisten rekomendasi makanan</Text>
        </View>
        <Pressable
          accessibilityLabel="Riwayat chat"
          style={styles.iconBtn}
          onPress={openHistory}
        >
          <Ionicons name="time-outline" size={22} color="#fff" />
        </Pressable>
        <Pressable
          accessibilityLabel="Menu akun"
          style={[styles.iconBtn, menuOpen && styles.iconBtnOn]}
          onPress={() => setMenuOpen(true)}
        >
          <Ionicons name="person-outline" size={22} color={menuOpen ? colors.primary : "#fff"} />
        </Pressable>
      </View>

      {/* Pesan */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}              contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <EmptyState name={user.name} onPick={(t) => send(t)} />
          }
          renderItem={({ item }) => (
            <MessageItem msg={item} onRetry={() => retry(item)} />
          )}
          ListFooterComponent={
            <View>
              {sending && <Typing />}
              {!sending && suggestions.length > 0 && (
                <View style={styles.chips}>
                  {suggestions.map((s) => (
                    <Pressable key={s} style={styles.chip} onPress={() => send(s)}>
                      <Text style={styles.chipText}>{s}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          }
        />
      )}

      {/* Input */}
      <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TextInput
          style={styles.input}
          placeholder="Tulis pesan…"
          placeholderTextColor={colors.muted}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={1000}
        />
        <Pressable
          accessibilityLabel="Kirim"
          style={[styles.sendBtn, (!input.trim() || sending) && { opacity: 0.5 }]}
          disabled={!input.trim() || sending}
          onPress={() => send(input)}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </Pressable>
      </View>

      {/* Menu akun */}
      <Modal transparent visible={menuOpen} animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setMenuOpen(false)}>
          <View style={[styles.menu, { top: insets.top + 76 }]}>
            <View style={styles.menuHead}>
              <Text style={styles.menuName}>{user.name}</Text>
              {!!user.email && <Text style={styles.menuEmail}>{user.email}</Text>}
            </View>
            <View style={styles.divider} />

            <Pressable style={styles.menuItem} onPress={openProfile}>
              <Ionicons name="person-circle-outline" size={20} color={colors.ink} />
              <Text style={styles.menuText}>Profil</Text>
            </Pressable>

            <Pressable style={styles.menuItem} onPress={logout}>
              <Ionicons name="log-out-outline" size={20} color={colors.danger} />
              <Text style={[styles.menuText, { color: colors.danger }]}>Logout</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function MessageItem({ msg, onRetry }: { msg: Msg; onRetry: () => void }) {
  const mine = msg.role === "user";
  return (
    <View style={{ alignItems: mine ? "flex-end" : "flex-start", marginBottom: 14 }}>
      <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleAi]}>
        <Text style={[styles.bubbleText, mine && { color: colors.onPrimary }]}>{msg.text}</Text>
        {!mine &&
          msg.recs?.map((r) => (
            <View key={r.name} style={styles.rec}>
              <View style={styles.recThumb}>
                {r.imageUrl ? (
                  <Image source={{ uri: r.imageUrl }} style={styles.recImg} />
                ) : (
                  <Ionicons name="restaurant-outline" size={24} color={colors.primary} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.recName}>{r.name}</Text>
                <Text style={styles.recReason}>{r.reason}</Text>
              </View>
            </View>
          ))}
      </View>
      {msg.failed && (
        <Pressable onPress={onRetry} style={styles.failed}>
          <Ionicons name="alert-circle" size={14} color={colors.danger} />
          <Text style={styles.failedText}>Gagal terkirim. Ketuk untuk coba lagi.</Text>
        </Pressable>
      )}
    </View>
  );
}

function Typing() {
  return (
    <View style={[styles.bubble, styles.bubbleAi, { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8 }]}>
      <ActivityIndicator size="small" color={colors.primary} />
      <Text style={[styles.bubbleText, { color: colors.muted }]}>GoAI sedang mengetik…</Text>
    </View>
  );
}

function EmptyState({ name, onPick }: { name: string; onPick: (t: string) => void }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyCircle}>
        <Image source={require("../../assets/images/goai.png")} style={{ width: 96, height: 96 }} />
      </View>
      <Text style={styles.emptyTitle}>Hai, {name}!</Text>
      <Text style={styles.emptySub}>Mau makan apa hari ini?</Text>
      <View style={{ alignSelf: "stretch", gap: 10, marginTop: 16 }}>
        {EXAMPLES.map((t) => (
          <Pressable key={t} style={styles.example} onPress={() => onPick(t)}>
            <Text style={styles.exampleText}>{t}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingBottom: 14, backgroundColor: colors.primary},
  logoWrap: { backgroundColor: "#fff", borderRadius: 12, padding: 3 },
  logo: { width: 36, height: 36, borderRadius: 9 },
  title: { color: "#fff", fontSize: 18, fontWeight: "700" },
  subtitle: { color: "rgba(255,255,255,0.85)", fontSize: 12 },
  iconBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.14)", borderWidth: 1, borderColor: "rgba(255,255,255,0.35)" },
  iconBtnOn: { backgroundColor: "#fff" },
  list: { flexGrow: 1, padding: 20 },
  bubble: { maxWidth: "85%", paddingVertical: 12, paddingHorizontal: 16, gap: 10 },
  bubbleMine: { backgroundColor: colors.primary, borderRadius: 24, borderBottomRightRadius: 6 },
  bubbleAi: { backgroundColor: colors.card, borderRadius: 24, borderBottomLeftRadius: 6, borderWidth: 1, borderColor: colors.border },
  bubbleText: { fontSize: 15, lineHeight: 22, color: colors.ink },
  rec: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.soft, borderRadius: 12, padding: 10 },
  recThumb: { width: 52, height: 52, borderRadius: 12, backgroundColor: colors.card, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  recImg: { width: 52, height: 52 },
  recName: { fontSize: 14, fontWeight: "700", color: colors.ink },
  recReason: { fontSize: 13, color: colors.muted, marginTop: 2 },
  failed: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  failedText: { fontSize: 12, color: colors.danger },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  chip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: "600", color: colors.ink },
  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: 10, paddingHorizontal: 20, paddingTop: 12, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border },
  input: { flex: 1, maxHeight: 120, minHeight: 48, borderRadius: 24, backgroundColor: colors.soft, paddingHorizontal: 18, paddingTop: 13, paddingBottom: 13, fontSize: 15, color: colors.ink },
  sendBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  overlay: { flex: 1, backgroundColor: colors.overlay },
  menu: { position: "absolute", right: 16, width: 272, backgroundColor: colors.card, borderRadius: 20, padding: 8, elevation: 12, shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
  menuHead: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 12 },
  menuName: { fontSize: 16, fontWeight: "700", color: colors.ink },
  menuEmail: { fontSize: 13, color: colors.muted, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 6, marginBottom: 6 },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 12 },
  menuText: { fontSize: 15, fontWeight: "600", color: colors.ink },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 24 },
  emptyCircle: { alignItems: "center", justifyContent: "center", marginBottom: 12 },
  emptyTitle: { fontSize: 24, fontWeight: "700", color: colors.ink },
  emptySub: { fontSize: 15, color: colors.muted, marginTop: 4 },
  example: { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16 },
  exampleText: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.ink },
});