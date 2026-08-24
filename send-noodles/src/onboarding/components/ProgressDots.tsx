import { StyleSheet, View } from "react-native";
import { colors, spacing } from "../../constants/theme";

type Props = { total: number; index: number };

// Same small-dot-row language as TopSwipeNavigator's page indicator,
// reused here so the tutorial's own progress reads as part of the same
// visual system rather than a bolted-on library component.
export default function ProgressDots({ total, index }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
      ))}
    </View>
  );
}

const DOT_SIZE = 6;

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  dot: { width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2, backgroundColor: colors.line },
  dotActive: { backgroundColor: colors.accent, width: DOT_SIZE * 2.2 },
});
