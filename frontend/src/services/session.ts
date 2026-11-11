import AsyncStorage from "@react-native-async-storage/async-storage";
import { clearPassword, savePassword } from "../utils/secret";

// Semua akses (token, nama, email, password) 
const KEY = { token: "token", name: "userName", email: "userEmail" };

export const getToken = () => AsyncStorage.getItem(KEY.token);

export async function saveSession(s: {
  token: string;
  password: string;
  email: string;
  name?: string;
}) {
  await AsyncStorage.setItem(KEY.token, s.token);
  await savePassword(s.password); // terenkripsi, untuk halaman Profil
  if (s.name) await AsyncStorage.setItem(KEY.name, s.name);
  await AsyncStorage.setItem(KEY.email, s.email);
}

export async function getUser() {
  const [name, email] = await Promise.all([
    AsyncStorage.getItem(KEY.name),
    AsyncStorage.getItem(KEY.email),
  ]);
  return { name: name ?? "", email: email ?? "" };
}

export async function clearSession() {
  await AsyncStorage.multiRemove([KEY.token, KEY.name, KEY.email]);
  await clearPassword();
}
