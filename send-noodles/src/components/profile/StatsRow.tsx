import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, type } from "../../constants/theme";

type Props = {
  points: number;
  snaps: number;
  circles: number;
};

export default function StatsRow({ points, snaps, circles }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.cell}>
        <Text style={styles.number}>{points.toLocaleString()}</Text>
        <Text style={styles.label}>Points</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.cell}>
        <Text style={styles.number}>{snaps}</Text>
        <Text style={styles.label}>Snaps</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.cell}>
        <Text style={styles.number}>{circles}</Text>
        <Text style={styles.label}>Circles</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.lg },
  cell: { flex: 1, alignItems: "flex-start" },
  divider: { width: 1, height: 36, backgroundColor: colors.line },
  number: { ...type.serifDisplay, fontSize: 28, color: colors.ink },
  label: { ...type.eyebrow, color: colors.muted, marginTop: spacing.xs },
});
