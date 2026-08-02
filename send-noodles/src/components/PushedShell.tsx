import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors, type, spacing } from "../constants/theme";

type Props = {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
};

// Inverse of PanelShell: ink background, cream text. Used for screens
// pushed on top of the swipe hub (SnapReview, CircleDetail) so leaving
// the hub reads as a clear visual state change, not just a new screen.
export default function PushedShell({ eyebrow, title, children }: Props) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backTap}>
        <Text style={styles.backLabel}>[temp] ← Back</Text>
      </Pressable>

      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ink, paddingHorizontal: spacing.lg, paddingTop: spacing.xxl },
  backTap: { marginBottom: spacing.lg },
  backLabel: { ...type.caption, color: colors.muted },
  eyebrow: { ...type.eyebrow, color: colors.accent },
  title: { ...type.display, color: colors.paper, marginTop: spacing.xs },
  body: { flex: 1, marginTop: spacing.lg },
});
