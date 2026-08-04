import { TextInput, View, Text, StyleSheet } from "react-native";
import { colors, spacing, type } from "../../constants/theme";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
};

export default function CaptionInput({ value, onChangeText }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Add a Caption</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="my herbs went wild..."
        placeholderTextColor={colors.muted}
        style={styles.input}
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
