import { Pressable, Text, StyleSheet } from "react-native";
import { colors, spacing, type } from "../../constants/theme";

type Props = {
  label: string;
  variant?: "default" | "danger";
  onPress?: () => void;
};

export default function ActionRow({ label, variant = "default", onPress }: Props) {
  const color = variant === "danger" ? colors.alert : colors.ink;

  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Text style={[styles.label, { color }]}>{label}</Text>
      <Text style={[styles.arrow, { color }]}>{"\u2192"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  label: { ...type.serifDisplay, fontSize: 16 },
  arrow: { ...type.body },
});
