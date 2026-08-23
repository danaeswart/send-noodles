import { Keyboard, TextInput, View, Text, StyleSheet } from "react-native";
import { colors, spacing, type } from "../../constants/theme";

export const MAX_CAPTION_LENGTH = 140;

type Props = {
  value: string;
  onChangeText: (text: string) => void;
};

export default function CaptionInput({ value, onChangeText }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Add a Caption</Text>
        <Text style={styles.count}>
          {value.length}/{MAX_CAPTION_LENGTH}
        </Text>
      </View>
      <TextInput
        value={value}
        // Wraps to a new line on its own once text hits the edge of the
        // screen (that's `multiline`), but the return key itself should
        // never insert a line break — strip any \n so pressing enter
        // can only ever dismiss the keyboard, never start a paragraph.
        onChangeText={(text) => onChangeText(text.replace(/\n/g, ""))}
        onSubmitEditing={() => Keyboard.dismiss()}
        placeholder="my herbs went wild..."
        placeholderTextColor={colors.muted}
        style={styles.input}
        multiline
        maxLength={MAX_CAPTION_LENGTH}
        textAlignVertical="top"
        returnKeyType="done"
        submitBehavior="blurAndSubmit"
      />
      <View style={styles.underline} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.lg },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: spacing.sm,
  },
  label: { ...type.eyebrow, color: colors.muted },
  count: { ...type.caption, color: colors.muted },
  input: { ...type.serifDisplay, fontSize: 17, color: colors.ink, paddingVertical: spacing.xs },
  underline: { height: 1, backgroundColor: colors.line, marginTop: spacing.xs },
});
