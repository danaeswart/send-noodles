import { TextInput, View, Text, StyleSheet, TextInputProps, ViewStyle } from "react-native";
import { colors, spacing, type } from "../../constants/theme";

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  style?: ViewStyle;
} & Pick<TextInputProps, "placeholder" | "secureTextEntry" | "keyboardType" | "autoCapitalize" | "textContentType" | "autoComplete" | "maxLength">;

// Same underline-input treatment as CaptionInput on the Snap screen —
// reused here as a shared field so Login/SignUp don't redefine it.
export default function AuthTextField({ label, value, onChangeText, style, ...inputProps }: Props) {
  return (
    <View style={[styles.wrap, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.muted}
        style={styles.input}
        {...inputProps}
      />
      <View style={styles.underline} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.lg },
  label: { ...type.eyebrow, color: colors.muted, marginBottom: spacing.sm },
  input: { ...type.serifDisplay, fontSize: 17, color: colors.ink, paddingVertical: spacing.xs },
  underline: { height: 1, backgroundColor: colors.line, marginTop: spacing.xs },
});
