import { Pressable, Text, StyleSheet, ViewStyle } from "react-native";
import { colors, spacing, type } from "../../constants/theme";

type Props = {
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
};

export default function AuthButton({ label, onPress, style }: Props) {
  return (
    <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed, style]} onPress={onPress}>
      <Text style={styles.label}>{label}</Text>
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
