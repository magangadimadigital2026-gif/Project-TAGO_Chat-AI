import { router } from "expo-router";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { ConversationRow, NewChatButton, SearchBar } from "../components/history";
import { Loading, PrimaryButton, ScreenHeader, StateMessage } from "../components/ui";
import { colors } from "../constants/palette";
import { useHistory } from "../hooks/useHistory";

export default function HistoryScreen() {
  const h = useHistory();

  return (
    <View style={styles.container}>
      <ScreenHeader title="Riwayat Chat" onBack={() => router.back()} />
      <SearchBar value={h.query} onChange={h.setQuery} />

      {h.loading ? (
        <Loading />
      ) : h.error ? (
        <StateMessage title="Riwayat tidak bisa dimuat" subtitle={h.error}>
          <PrimaryButton title="Coba lagi" onPress={() => h.load()} style={styles.retry} />
        </StateMessage>
      ) : (
        <FlatList
          data={h.filteredItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={h.refreshing}
              onRefresh={() => h.load(true)}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <StateMessage
              title={h.query ? "Tidak ada hasil" : "Belum ada percakapan"}
              subtitle={
                h.query
                  ? "Coba kata kunci lain."
                  : "Mulai chat baru untuk mendapat rekomendasi makanan."
              }
            />
          }
          renderItem={({ item }) => (
            <ConversationRow
              item={item}
              onOpen={() => h.open(item.id)}
              onDelete={() => h.remove(item)}
            />
          )}
        />
      )}

      <NewChatButton onPress={h.newChat} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  list: { padding: 20, paddingBottom: 120, flexGrow: 1 },
  retry: { marginTop: 16, height: 44, paddingHorizontal: 24, borderRadius: 22 },
});
