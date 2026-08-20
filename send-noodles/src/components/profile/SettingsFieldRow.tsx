import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, spacing, type } from "../../constants/theme";

type Props = {
  label: string;
  value: string;
  isEditing: boolean;
  draftValue?: string;
  onChangeDraft?: (text: string) => void;
  onStartEdit: () => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  placeholder?: string;
};

// Purely presentational — editing is a single all-three-fields-at-once
// mode driven by the parent (ProfileSettingsPage), with one shared
// Cancel/Save pair up top rather than a Save button per row. This row
// just renders its label plus either the read-only value + an "Edit"
// trigger (which hands control back to the parent to enter edit mode),
// or a text input bound to the parent's draft state while editing.
export default function SettingsFieldRow({
  label,
  value,
  isEditing,
  draftValue,
  onChangeDraft,
  onStartEdit,
  secureTextEntry,
  keyboardType,
  placeholder,
}: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      {isEditing ? (
        <TextInput
          style={styles.input}
          value={draftValue}
          onChangeText={onChangeDraft}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
        />
      ) : (
        <View style={styles.row}>
          <Text style={styles.value}>{value}</Text>
          <Pressable onPress={onStartEdit} hitSlop={8}>
            <Text style={styles.edit}>Edit</Text>
          </Pressable>
        </View>
      )}
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
  input: {
    ...type.serifDisplay,
    fontSize: 16,
    color: colors.ink,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
    paddingVertical: spacing.xs,
  },
  divider: { height: 1, backgroundColor: colors.line, marginTop: spacing.sm },
});
