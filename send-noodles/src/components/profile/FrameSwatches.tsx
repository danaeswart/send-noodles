import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, type } from "../../constants/theme";
import type { UnlockedFrame } from "../../data/mockProfile";

type Props = {
  frames: UnlockedFrame[];
};

export default function FrameSwatches({ frames }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Unlocked Frames</Text>
      <View style={styles.row}>
        {frames.map((f) => (
          <View key={f.id} style={[styles.swatch, { backgroundColor: f.color }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.lg },
  label: { ...type.eyebrow, color: colors.muted, marginBottom: spacing.sm },
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  swatch: { width: 28, height: 28, borderWidth: 1, borderColor: colors.ink },
});
