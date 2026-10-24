
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../constants/palette";
import {
  ConversationItem,
  deleteConversation,
  listConversations,
} from "../services/chat";

// Mengubah angka menjadi dua digit
const pad = (n: number) => String(n).padStart(2, "0");

// Mengubah waktu menjadi jam atau tanggal
function timeLabel(iso: string) {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday || isYesterday) {
    return `${pad(date.getHours())}.${pad(date.getMinutes())}`;
  }

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();

  // Menyimpan daftar percakapan
  const [items, setItems] = useState<ConversationItem[]>([]);

  // Menyimpan kata kunci pencarian
  const [query, setQuery] = useState("");

  // Status loading dan refresh
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Menyimpan ID percakapan yang sedang dihapus
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Menyimpan pesan error
  const [error, setError] = useState("");

  // Mengambil daftar riwayat dari backend
  const load = useCallback(async (pull = false) => {
    if (pull) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const data = await listConversations();

      // Mengurutkan percakapan dari terbaru
      const sortedData = [...data].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() -
          new Date(a.updatedAt).getTime()
      );

      // Menampilkan maksimal 10 percakapan
      setItems(sortedData.slice(0, 10));
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Gagal memuat riwayat."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Memuat riwayat saat halaman dibuka
  useEffect(() => {
    load();
  }, [load]);

  // Mencari percakapan berdasarkan judul
  const filteredItems = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      return items;
    }

    return items.filter((item) =>
      `${item.title} ${item.lastMessage}`
        .toLowerCase()
        .includes(keyword)
    );
  }, [items, query]);

  // Membuka percakapan yang dipilih
  const open = (id: string) => {
    router.dismissTo({
      pathname: "/chat",
      params: { id },
    });
  };

  // Membuka chat baru
  const newChat = () => {
    router.dismissTo({
      pathname: "/chat",
      params: { fresh: String(Date.now()) },
    });
  };

  // Meminta konfirmasi sebelum menghapus
  const remove = (item: ConversationItem) => {
    if (deletingId !== null) {
      return;
    }

    Alert.alert(
      "Hapus percakapan",
      `Apakah kamu yakin ingin menghapus "${item.title}"?`,
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            setDeletingId(item.id);

            try {
              // Menghapus percakapan melalui backend
              await deleteConversation(item.id);

              // Menghilangkan percakapan dari daftar
              setItems((previous) =>
                previous.filter(
                  (conversation) =>
                    conversation.id !== item.id
                )
              );
            } catch (e) {
              Alert.alert(
                "Gagal menghapus",
                e instanceof Error
                  ? e.message
                  : "Terjadi kesalahan. Silakan coba lagi."
              );
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header halaman */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 12 },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          style={styles.iconBtn}
          onPress={() => router.back()}
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color="#fff"
          />
        </Pressable>

        <Text style={styles.title}>Riwayat Chat</Text>
      </View>

      {/* Kolom pencarian */}
      <View style={styles.search}>
        <Ionicons
          name="search"
          size={20}
          color={colors.muted}
        />

        <TextInput
          style={styles.searchInput}
          placeholder="Cari percakapan"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {/* Tampilan loading */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        // Tampilan jika gagal mengambil riwayat
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>
            Riwayat tidak bisa dimuat
          </Text>

          <Text style={styles.emptySub}>{error}</Text>

          <Pressable
            style={styles.retry}
            onPress={() => load()}
          >
            <Text style={styles.retryText}>
              Coba lagi
            </Text>
          </Pressable>
        </View>
      ) : (
        // Daftar riwayat menggunakan FlatList
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor={colors.primary}
            />
          }
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyTitle}>
                {query
                  ? "Tidak ada hasil"
                  : "Belum ada percakapan"}
              </Text>

              <Text style={styles.emptySub}>
                {query
                  ? "Coba kata kunci lain."
                  : "Mulai chat baru untuk mendapat rekomendasi makanan."}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              {/* Bagian judul untuk membuka chat */}
              <Pressable
                style={styles.conversation}
                onPress={() => open(item.id)}
                accessibilityRole="button"
                accessibilityLabel={`Buka percakapan ${item.title}`}
              >
                <Text
                  style={styles.rowTitle}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>

                <Text
                  style={styles.rowSub}
                  numberOfLines={1}
                >
                  {item.lastMessage}
                </Text>
              </Pressable>

              {/* Waktu percakapan */}
              <Text style={styles.time}>
                {timeLabel(item.updatedAt)}
              </Text>

              {/* Tombol hapus per percakapan */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Hapus percakapan ${item.title}`}
                hitSlop={10}
                onPress={() => remove(item)}
                style={styles.deleteBtn}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={colors.muted}
                />
              </Pressable>
            </View>
          )}
        />
      )}

      {/* Tombol membuat chat baru */}
      <Pressable
        style={[
          styles.fab,
          {
            bottom: Math.max(insets.bottom, 12) + 16,
          },
        ]}
        onPress={newChat}
        accessibilityRole="button"
        accessibilityLabel="Buat chat baru"
      >
        <Ionicons name="add" size={22} color="#fff" />
        <Text style={styles.fabText}>Chat Baru</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: colors.primary,
  },

  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },

  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.soft,
    marginHorizontal: 20,
    marginTop: 20,
    paddingHorizontal: 16,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.ink,
  },

  listContent: {
    padding: 20,
    paddingBottom: 120,
    flexGrow: 1,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  conversation: {
    flex: 1,
  },

  rowTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },

  rowSub: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 3,
  },

  time: {
    fontSize: 12,
    color: colors.muted,
  },

  deleteBtn: {
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.ink,
    textAlign: "center",
  },

  emptySub: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 6,
    textAlign: "center",
  },

  retry: {
    marginTop: 16,
    height: 44,
    paddingHorizontal: 24,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  retryText: {
    color: "#fff",
    fontWeight: "700",
  },

  fab: {
    position: "absolute",
    right: 20,
    height: 52,
    paddingHorizontal: 22,
    borderRadius: 26,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    elevation: 6,
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },

  fabText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
