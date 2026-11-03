import Ionicons from "@expo/vector-icons/Ionicons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../constants/palette";

type Props = {
  visible: boolean;
  name: string;
  email: string;
  onClose: () => void;
  onProfile: () => void;
  onLogout: () => void;
};

export function AccountMenu({ visible, name, email, onClose, onProfile, onLogout }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.menu, { top: insets.top + 76 }]}>
          <View style={styles.head}>
            <Text style={styles.name}>{name}</Text>
            {!!email && <Text style={styles.email}>{email}</Text>}
          </View>
          <View style={styles.divider} />

          <Pressable style={styles.item} onPress={onProfile}>
            <Ionicons name="person-circle-outline" size={20} color={colors.ink} />
            <Text style={styles.itemText}>Profil</Text>
          </Pressable>

          <Pressable style={styles.item} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />
            <Text style={[styles.itemText, { color: colors.danger }]}>Logout</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay },
  menu: {
    position: "absolute",
    right: 16,
    width: 272,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 8,
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  head: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 12 },
  name: { fontSize: 16, fontWeight: "700", color: colors.ink },
  email: { fontSize: 13, color: colors.muted, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 6, marginBottom: 6 },
  item: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 12 },
  itemText: { fontSize: 15, fontWeight: "600", color: colors.ink },
});
