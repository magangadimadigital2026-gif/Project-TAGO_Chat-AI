
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/palette";
import type { Msg } from "../../types/chat";
import { introOnly } from "../../utils/message";
import { RecommendationCard } from "./RecommendationCard";

// Komponen untuk menampilkan satu pesan dari pengguna atau AI
// msg berisi data pesan, onRetry digunakan untuk mengirim ulang pesan
export function MessageBubble({
  msg,
  onRetry,
}: {
  msg: Msg;
  onRetry: () => void;
}) {

  // Mengecek apakah pesan dikirim oleh pengguna
  const mine = msg.role === "user";

  // Jika pesan dari AI memiliki rekomendasi,
  // tampilkan bagian pembukanya saja agar tidak ada teks berulang
  const text = !mine && msg.recs?.length ? introOnly(msg.text) : msg.text;

  return (
    // Mengatur posisi pesan:
    // Pesan pengguna di sebelah kanan, pesan AI di sebelah kiri
    <View
      style={{
        alignItems: mine ? "flex-end" : "flex-start",
        marginBottom: 14,
      }}
    >

      {/* Tampilan kotak pesan pengguna atau AI */}
      <View style={[styles.bubble, mine ? styles.mine : styles.ai]}>

        {/* Menampilkan isi pesan jika tidak kosong */}
        <Text
          style={[
            styles.text,
            mine && { color: colors.onPrimary },
          ]}
        >
          {!!text ? text : ""}
        </Text>

        {/* Menampilkan daftar rekomendasi jika pesan berasal dari AI */}
        {!mine &&
          msg.recs?.map((r, i) => (
            <RecommendationCard
              key={`${r.name}-${i}`}
              rec={r}
              index={i}
            />
          ))}
      </View>

      {/* Jika pesan gagal dikirim, tampilkan pemberitahuan */}
      {msg.failed && (
        <Pressable onPress={onRetry} style={styles.failed}>

          {/* Ikon pemberitahuan gagal */}
          <Ionicons
            name="alert-circle"
            size={14}
            color={colors.danger}
          />

          {/* Tulisan yang bisa diketuk untuk mencoba mengirim ulang */}
          <Text style={styles.failedText}>
            Gagal terkirim. Ketuk untuk coba lagi.
          </Text>
        </Pressable>
      )}
    </View>
  );
}

// Mengatur desain dan tampilan komponen pesan
const styles = StyleSheet.create({

  // Mengatur ukuran maksimal, jarak, dan ruang dalam kotak pesan
  bubble: {
    maxWidth: "85%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
  },

  // Tampilan kotak pesan milik pengguna
  mine: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    borderBottomRightRadius: 6,
  },

  // Tampilan kotak pesan dari AI
  ai: {
    backgroundColor: colors.card,
    borderRadius: 24,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Mengatur ukuran dan warna tulisan pesan
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
  },

  // Mengatur posisi ikon dan tulisan pesan gagal
  failed: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },

  // Mengatur tampilan tulisan pesan gagal
  failedText: {
    fontSize: 12,
    color: colors.danger,
  },
});
