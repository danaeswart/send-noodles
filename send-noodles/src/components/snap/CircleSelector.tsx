import { useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { colors, spacing, type } from "../../constants/theme";
import { mockCircles } from "../../data/mockCircles";

type Props = { onChange?: (circleId: string) => void };

// Tapping cycles through the user's circles. TEMP interaction — swap
// for a real picker/modal once someone has more than a handful of
// circles to choose from.
export default function CircleSelector({ onChange }: Props) {
  const [index, setIndex] = useState(0);
  const circle = mockCircles[index];

  const cycle = () => {
    const next = (index + 1) % mockCircles.length;
    setIndex(next);
    onChange?.(mockCircles[next].id);
  };

  return (
    <Pressable onPress={cycle} style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.label}>Circle</Text>
        <Text style={styles.separator}>{"  |  "}</Text>
        <Text style={styles.circleName}>{circle.name}</Text>
        <Text style={styles.chevron}>{" \u2304"}</Text>
      </View>
      <View style={styles.underline} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: "flex-start", width: "100%" },
  row: { flexDirection: "row", alignItems: "center" },
  label: { ...type.eyebrow, color: colors.muted },
  separator: { color: colors.line },
  circleName: { ...type.serifDisplay, fontSize: 16, color: colors.alert },
  chevron: { color: colors.alert, fontSize: 14 },
  underline: { height: 2, backgroundColor: colors.alert, marginTop: spacing.xs, width: "100%" },
});
