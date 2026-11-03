import { ActivityIndicator, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { colors } from "../../constants/palette";

export function Loading({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.center, style]}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
