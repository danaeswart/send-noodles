import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, spacing, type } from "../../constants/theme";

type Props = {
  label: string;
  value: string;
  onEdit?: () => void;
};

export default function SettingsFieldRow({ label, value, onEdit }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Text style={styles.value}>{value}</Text>
        {/* TODO: wire onEdit to real field editing once backend exists */}
        <Pressable onPress={onEdit} hitSlop={8}>
          <Text style={styles.edit}>Edit</Text>
        </Pressable>
      </View>
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: { ...type.eyebrow, fontSize: 10, color: colors.muted, marginBottom: spacing.xs },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  value: { ...type.serifDisplay, fontSize: 16, color: colors.ink },
  edit: { ...type.caption, letterSpacing: 1, color: colors.muted, textTransform: "uppercase" },
  divider: { height: 1, backgroundColor: colors.line, marginTop: spacing.sm },
});
