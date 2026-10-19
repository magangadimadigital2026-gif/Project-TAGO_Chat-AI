import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../constants/palette";
import { ConversationItem, deleteConversation, listConversations } from "../services/chat";

const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const pad = (n: number) => String(n).padStart(2, "0");

function groupName(iso: string) {
  const diff = (dayStart(new Date()) - dayStart(new Date(iso))) / 86400000;
  return diff <= 0 ? "Hari ini" : diff === 1 ? "Kemarin" : "Sebelumnya";
}

function timeLabel(iso: string) {
  const d = new Date(iso);
  return groupName(iso) === "Sebelumnya"
    ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`
    : `${pad(d.getHours())}.${pad(d.getMinutes())}`;
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<ConversationItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (pull = false) => {
    pull ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      const data = await listConversations();
      setItems([...data].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat riwayat.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? items.filter((i) => `${i.title} ${i.lastMessage}`.toLowerCase().includes(q))
      : items;
    const order = ["Hari ini", "Kemarin", "Sebelumnya"];
    return order
      .map((title) => ({ title, data: filtered.filter((i) => groupName(i.updatedAt) === title) }))
      .filter((s) => s.data.length > 0);
  }, [items, query]);

  const open = (id: string) =>
    router.dismissTo({ pathname: "/chat", params: { id } });

  const newChat = () =>
    router.dismissTo({ pathname: "/chat", params: { fresh: String(Date.now()) } });

  const remove = (item: ConversationItem) =>
    Alert.alert("Hapus percakapan", `Hapus "${item.title}"?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteConversation(item.id);
            setItems((p) => p.filter((i) => i.id !== item.id));
          } catch (e) {
            Alert.alert("Gagal menghapus", e instanceof Error ? e.message : "Coba lagi.");
          }
        },
      },
    ]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable accessibilityLabel="Kembali" style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
        <Text style={styles.title}>Riwayat Chat</Text>
      </View>

      <View style={styles.search}>
        <Ionicons name="search" size={20} color={colors.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari percakapan"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Riwayat tidak bisa dimuat</Text>
          <Text style={styles.emptySub}>{error}</Text>
          <Pressable style={styles.retry} onPress={() => load()}>
            <Text style={styles.retryText}>Coba lagi</Text>
          </Pressable>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 120, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.primary} />}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyTitle}>{query ? "Tidak ada hasil" : "Belum ada percakapan"}</Text>
              <Text style={styles.emptySub}>
                {query ? "Coba kata kunci lain." : "Mulai chat baru untuk mendapat rekomendasi makanan."}
              </Text>
            </View>
          }
          renderSectionHeader={({ section }) => <Text style={styles.group}>{section.title}</Text>}
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => open(item.id)} onLongPress={() => remove(item)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.rowSub} numberOfLines={1}>{item.lastMessage}</Text>
              </View>
              <Text style={styles.time}>{timeLabel(item.updatedAt)}</Text>
              <Pressable accessibilityLabel="Hapus" hitSlop={10} onPress={() => remove(item)}>
                <Ionicons name="trash-outline" size={20} color={colors.muted} />
              </Pressable>
            </Pressable>
          )}
        />
      )}

      <Pressable style={[styles.fab, { bottom: Math.max(insets.bottom, 12) + 16 }]} onPress={newChat}>
        <Ionicons name="add" size={22} color="#fff" />
        <Text style={styles.fabText}>Chat Baru</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 14, backgroundColor: colors.primary },
  iconBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.14)", borderWidth: 1, borderColor: "rgba(255,255,255,0.35)" },
  title: { color: "#fff", fontSize: 18, fontWeight: "700" },
  search: { flexDirection: "row", alignItems: "center", gap: 10, height: 48, borderRadius: 24, backgroundColor: colors.soft, marginHorizontal: 20, marginTop: 20, paddingHorizontal: 16 },
  searchInput: { flex: 1, fontSize: 14, color: colors.ink },
  group: { fontSize: 13, fontWeight: "700", color: colors.muted, marginTop: 16, marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 10 },
  rowTitle: { fontSize: 15, fontWeight: "700", color: colors.ink },
  rowSub: { fontSize: 13, color: colors.muted, marginTop: 3 },
  time: { fontSize: 12, color: colors.muted },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: colors.ink, textAlign: "center" },
  emptySub: { fontSize: 14, color: colors.muted, marginTop: 6, textAlign: "center" },
  retry: { marginTop: 16, height: 44, paddingHorizontal: 24, borderRadius: 22, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  retryText: { color: "#fff", fontWeight: "700" },
  fab: { position: "absolute", right: 20, height: 52, paddingHorizontal: 22, borderRadius: 26, backgroundColor: colors.primary, flexDirection: "row", alignItems: "center", gap: 8, elevation: 6, shadowColor: colors.primary, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },
  fabText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});