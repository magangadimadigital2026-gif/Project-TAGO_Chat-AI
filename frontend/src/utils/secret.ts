import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Password disimpan terenkripsi di Keychain (iOS) / Keystore (Android).
// SecureStore tidak tersedia di web, jadi di web password tidak disimpan.
const KEY = "userPassword";
const supported = Platform.OS !== "web";

export async function savePassword(password: string) {
  if (supported) await SecureStore.setItemAsync(KEY, password);
}

export async function loadPassword(): Promise<string | null> {
  return supported ? SecureStore.getItemAsync(KEY) : null;
}

export async function clearPassword() {
  if (supported) await SecureStore.deleteItemAsync(KEY);
}