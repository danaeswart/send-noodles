import { useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { colors, spacing } from "../../constants/theme";

type Props = {
  count: number;
};

// Simple selectable circle row standing in for real avatar-style icons.
// Swap the inner View for actual illustrated face icons once that asset
// set exists — selection logic/state stays the same.
export default function AvatarStyleRow({ count }: Props) {
  const [selected, setSelected] = useState(0);

  return (
    <View style={styles.row}>
      {Array.from({ length: count }, (_, i) => (
        <Pressable key={i} onPress={() => setSelected(i)} hitSlop={6}>
          <View style={[styles.circle, i === selected && styles.circleSelected]} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.sm },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paperDim,
  },
  circleSelected: { borderColor: colors.ink, borderWidth: 1.5 },
});
