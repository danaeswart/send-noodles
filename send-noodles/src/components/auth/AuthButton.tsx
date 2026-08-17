import { Pressable, Text, StyleSheet, TextStyle, ViewStyle } from "react-native";
import { colors, spacing, type } from "../../constants/theme";

type Props = {
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export default function AuthButton({ label, onPress, style, textStyle }: Props) {
  return (
    <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed, style]} onPress={onPress}>
      <Text style={[styles.label, textStyle]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.ink,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: spacing.sm,
    marginTop: spacing.xl,
  },
  pressed: { opacity: 0.85 },
  label: { ...type.eyebrow, color: colors.paper, letterSpacing: 2 },
});
