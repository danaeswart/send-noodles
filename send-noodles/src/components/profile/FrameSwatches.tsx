import { View, Text, Image, StyleSheet } from "react-native";
import { colors, spacing, type } from "../../constants/theme";
import { frameRewardForId } from "../../constants/frames";

type Props = {
  frameIds: string[];
};

export default function FrameSwatches({ frameIds }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Unlocked Frames</Text>
      {frameIds.length === 0 ? (
        <Text style={styles.empty}>send your first snap to unlock one</Text>
      ) : (
        <View style={styles.row}>
          {frameIds.map((id) => {
            const frame = frameRewardForId(id);
            return frame ? (
              <Image key={id} source={frame.source} style={styles.swatch} resizeMode="cover" />
            ) : (
              <View key={id} style={[styles.swatch, styles.unknownSwatch]} />
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.lg },
  label: { ...type.eyebrow, color: colors.muted, marginBottom: spacing.sm },
  empty: { ...type.caption, color: colors.muted },
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  swatch: { width: 28, height: 28, borderWidth: 1, borderColor: colors.ink },
  unknownSwatch: { backgroundColor: colors.paperDim },
});
