import { View, Text, StyleSheet } from "react-native";
import { colors, type, spacing } from "../constants/theme";
import SquareMark from "./SquareMark";

type Props = {
  eyebrow: string;
  title: string;
  index: number; // 0-4, position in the 5-panel swipe deck
  children?: React.ReactNode;
};

// Shared shell for the swipe-deck panels that use a standard header +
// body layout (Gallery Wall, Circles, Snap, Profile). HomeChallenges is
// the exception — it manages its own full-bleed layout since it's a
// vertical TikTok-style feed nested inside this horizontal deck.
export default function PanelShell({ eyebrow, title, index, children }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <SquareMark activeIndex={index} total={5} variant="onPaper" />
      </View>

      <Text style={styles.title}>{title}</Text>

      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper, paddingHorizontal: spacing.lg, paddingTop: spacing.xxl },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xl },
  eyebrow: { ...type.eyebrow, color: colors.muted },
  title: { ...type.display, color: colors.ink },
  body: { flex: 1, marginTop: spacing.lg },
});
