import { View, Text, Switch, StyleSheet } from "react-native";
import { colors, spacing, type } from "../../constants/theme";

type Props = {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
};

export default function ToggleRow({ label, description, value, onValueChange }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.textCol}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.line, true: colors.accent }}
        thumbColor={colors.paper}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  textCol: { flex: 1, paddingRight: spacing.md },
  label: { ...type.heading, fontSize: 15, color: colors.ink },
  description: { ...type.caption, color: colors.muted, marginTop: 2 },
});
