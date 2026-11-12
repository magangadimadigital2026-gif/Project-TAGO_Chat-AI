import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/palette";
import type { Msg } from "../../types/chat";
import { introOnly } from "../../utils/message";
import { RecommendationCard } from "./RecommendationCard";

// msg berisi data pesan, onRetry digunakan untuk mengirim ulang pesan
export function MessageBubble({ msg, onRetry }: { msg: Msg; onRetry: () => void }) {

  // Mengecek apakah pesan dikirim oleh pengguna
  const mine = msg.role === "user";

  // Mengambil teks pembuka agar rekomendasi tidak ditampilkan berulang
  const text = !mine && msg.recs?.length ? introOnly(msg.text) : msg.text;

  return (
    // Mengatur posisi pesan pengguna di kanan dan AI di kiri
    <View style={{ alignItems: mine ? "flex-end" : "flex-start", marginBottom: 14 }}>
      {/* Kotak pesan pengguna atau AI */}
      <View style={[styles.bubble, mine ? styles.mine : styles.ai]}>
        {/* Menampilkan isi pesan jika tersedia */}
        {!!text && <Text style={[styles.text, mine && { color: colors.onPrimary }]}>{text}</Text>}
        {/* Menampilkan kartu rekomendasi dari AI */}
        {!mine && msg.recs?.map((r, i) => (
          <RecommendationCard key={`${r.name}-${i}`} rec={r} index={i} />
        ))}
      </View>

      {/* Menampilkan pemberitahuan jika pesan gagal dikirim */}
      {msg.failed && (
        <Pressable onPress={onRetry} style={styles.failed}>
          {/* Ikon pemberitahuan gagal */}
          <Ionicons name="alert-circle" size={14} color={colors.danger} />
          {/* Tombol untuk mencoba mengirim pesan kembali */}
          <Text style={styles.failedText}>Gagal terkirim. Ketuk untuk coba lagi.</Text>
        </Pressable>
      )}
    </View>
  );
}

// Mengatur desain dan tampilan komponen pesan
const styles = StyleSheet.create({

  // Mengatur ukuran dan jarak dalam kotak pesan
  bubble: { maxWidth: "85%", paddingVertical: 12, paddingHorizontal: 16, gap: 10 },
  // Tampilan kotak pesan pengguna
  mine: { backgroundColor: colors.primary, borderRadius: 24, borderBottomRightRadius: 6 },
  // Tampilan kotak pesan AI
  ai: {
    backgroundColor: colors.card,
    borderRadius: 24,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  // Mengatur ukuran dan warna tulisan pesan
  text: { fontSize: 15, lineHeight: 22, color: colors.ink },
  // Mengatur posisi ikon dan tulisan pesan gagal
  failed: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  // Mengatur tampilan tulisan pesan gagal
  failedText: { fontSize: 12, color: colors.danger },
});
