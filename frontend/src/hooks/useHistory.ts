import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ConversationItem, deleteConversation, listConversations } from "../services/chat";
import { confirmAction, notify } from "../utils/notify";

export function useHistory() {
  const [items, setItems] = useState<ConversationItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Service sudah mengurutkan (terbaru dulu) dan membatasi 10 item.
  const load = useCallback(async (pull = false) => {
    pull ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      setItems(await listConversations());
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

  const filteredItems = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return items;
    return items.filter((i) => `${i.title} ${i.lastMessage}`.toLowerCase().includes(keyword));
  }, [items, query]);

  const open = (id: string) => router.dismissTo({ pathname: "/chat", params: { id } });

  const newChat = () =>
    router.dismissTo({ pathname: "/chat", params: { fresh: String(Date.now()) } });

  const remove = (item: ConversationItem) => {
    if (deletingId !== null) return;

    confirmAction(
      "Hapus percakapan",
      `Apakah kamu yakin ingin menghapus "${item.title}"?`,
      "Hapus",
      async () => {
        setDeletingId(item.id);
        try {
          await deleteConversation(item.id);
          setItems((prev) => prev.filter((c) => c.id !== item.id));
        } catch (e) {
          notify(
            "Gagal menghapus",
            e instanceof Error ? e.message : "Terjadi kesalahan. Silakan coba lagi."
          );
        } finally {
          setDeletingId(null);
        }
      }
    );
  };

  return {
    query, setQuery, loading, refreshing, error,
    filteredItems, load, open, newChat, remove,
  };
}
