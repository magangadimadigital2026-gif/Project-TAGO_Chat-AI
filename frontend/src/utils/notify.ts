import { Alert, Platform } from "react-native";

// Alert.alert dari React Native TIDAK tampil di web (tidak ada efek sama sekali).
// Helper ini memakai window.alert / window.confirm di web dan Alert di HP.

export function notify(title: string, message: string, onOk?: () => void) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    onOk?.();
    return;
  }
  Alert.alert(title, message, onOk ? [{ text: "OK", onPress: onOk }] : undefined);
}

export function confirmAction(
  title: string,
  message: string,
  okText: string,
  onOk: () => void | Promise<void>,
  destructive = true
) {
  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n\n${message}`)) void onOk();
    return;
  }
  Alert.alert(title, message, [
    { text: "Batal", style: "cancel" },
    { text: okText, style: destructive ? "destructive" : "default", onPress: () => void onOk() },
  ]);
}