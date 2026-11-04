import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { ProfileCard, ProfileHeader } from "../components/profile";
import { useUser } from "../hooks/useUser";

export default function ProfileScreen() {
  const user = useUser();

  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/chat"));

  return (
    <View style={styles.container}>
      <ProfileHeader onBack={goBack} />
      <ProfileCard name={user.name} email={user.email} onBack={goBack} />
      <Text style={styles.footer}>Powered by TAGO</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F8FC", paddingHorizontal: 20, paddingTop: 25 },
  footer: { textAlign: "center", color: "#9CA3AF", fontSize: 12, marginTop: 25, marginBottom: 15 },
});
