import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import {
  AccountMenu,
  ChatHeader,
  ChatInput,
  EmptyState,
  MessageBubble,
  SuggestionChips,
  TypingIndicator,
} from "../components/chat";
import { Loading } from "../components/ui";
import { colors } from "../constants/palette";
import { useChat } from "../hooks/useChat";
import { useLogout } from "../hooks/useLogout";
import { useUser } from "../hooks/useUser";
import type { Msg } from "../types/chat";

export default function ChatScreen() {
  const { id, fresh } = useLocalSearchParams<{ id?: string; fresh?: string }>();
  const listRef = useRef<FlatList<Msg>>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const user = useUser();
  const chat = useChat(id, fresh);
  const logout = useLogout();

  // Tutup menu dulu, baru jalankan aksinya
  const fromMenu = (action: () => void) => () => {
    setMenuOpen(false);
    action();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ChatHeader
        menuOpen={menuOpen}
        onHistory={() => router.push("/history")}
        onMenu={() => setMenuOpen(true)}
      />

      {chat.loading ? (
        <Loading />
      ) : (
        <FlatList
          ref={listRef}
          data={chat.messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={<EmptyState name={user.name || "User"} onPick={chat.send} />}
          renderItem={({ item }) => (
            <MessageBubble msg={item} onRetry={() => chat.retry(item)} />
          )}
          ListFooterComponent={
            <View>
              {chat.sending && <TypingIndicator />}
              {!chat.sending && chat.suggestions.length > 0 && (
                <SuggestionChips suggestions={chat.suggestions} onPick={chat.send} />
              )}
            </View>
          }
        />
      )}

      <ChatInput
        value={chat.input}
        onChange={chat.setInput}
        onSend={() => chat.send(chat.input)}
        sending={chat.sending}
      />

      <AccountMenu
        visible={menuOpen}
        name={user.name || "User"}
        email={user.email}
        onClose={() => setMenuOpen(false)}
        onProfile={fromMenu(() => router.push("/profile"))}
        onLogout={fromMenu(logout)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  list: { flexGrow: 1, padding: 20 },
});
