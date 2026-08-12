import { Pressable, Text, View, StyleSheet } from "react-native";
import { colors, spacing, type } from "../../constants/theme";

type SelectableCircle = { id: string; name: string };

type Props = {
  circles: SelectableCircle[];
  selectedId: string | null;
  onChange: (circleId: string) => void;
};

// Tapping cycles through the user's circles. TEMP interaction — swap
// for a real picker/modal once someone has more than a handful of
// circles to choose from.
export default function CircleSelector({ circles, selectedId, onChange }: Props) {
  const index = Math.max(0, circles.findIndex((c) => c.id === selectedId));
  const circle = circles[index];

  const cycle = () => {
    if (circles.length === 0) return;
    const next = (index + 1) % circles.length;
    onChange(circles[next].id);
  };

  return (
    <Pressable onPress={cycle} style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.label}>Circle</Text>
        <Text style={styles.separator}>{"  |  "}</Text>
        <Text style={styles.circleName}>{circle?.name ?? "no circles yet"}</Text>
        <Text style={styles.chevron}>{" ⌄"}</Text>
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
