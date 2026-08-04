import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, type } from "../../constants/theme";
import type { RecentWin } from "../../data/mockProfile";

type Props = {
  wins: RecentWin[];
};

export default function RecentWinsList({ wins }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Recent Wins</Text>
      {wins.map((w) => (
        <View key={w.id} style={styles.row}>
          <View style={[styles.bar, { backgroundColor: w.accentColor }]} />
          <View>
            <Text style={styles.title}>{w.title}</Text>
            <Text style={styles.context}>{w.context}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.lg },
  label: { ...type.eyebrow, color: colors.muted, marginBottom: spacing.sm },
  row: { flexDirection: "row", alignItems: "flex-start", marginBottom: spacing.md },
  bar: { width: 3, alignSelf: "stretch", marginRight: spacing.sm },
  title: { ...type.heading, fontSize: 15, color: colors.ink },
  context: { ...type.caption, color: colors.muted, marginTop: 2 },
});
