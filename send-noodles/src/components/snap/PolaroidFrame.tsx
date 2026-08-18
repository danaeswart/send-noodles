import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { colors, spacing } from "../../constants/theme";

type Props = {
  children: ReactNode;
  footer?: ReactNode;
  width?: number | `${number}%`;
};

// Shared polaroid chrome — a photo area on top of a thick white strip —
// reused by the capture viewfinder and the review card so the photo
// reads as the same physical object across both pages.
export default function PolaroidFrame({ children, footer, width = "84%" }: Props) {
  return (
    <View style={[styles.card, { width }]}>
      <View style={styles.photoArea}>{children}</View>
      <View style={styles.footer}>{footer}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: "center",
    backgroundColor: colors.paper,
    padding: spacing.sm,
    paddingBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: colors.ink,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  photoArea: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: colors.ink,
    overflow: "hidden",
  },
  footer: { minHeight: spacing.xl, justifyContent: "center" },
});
