import { View, Text, StyleSheet } from "react-native";
import { colors, type, spacing } from "../constants/theme";
import SquareMark from "./SquareMark";

type Props = {
  eyebrow: string;
  title: string;
  index: number; // 0 = Lobby, 1 = Gallery, 2 = Profile
  children?: React.ReactNode;
};

// Shared shell for the three hub panels (Lobby / Gallery / Profile).
// Cream background with an ink corner mark — mirrors the pitch deck's
// light content sections. Pushed screens use the inverse PushedShell
// so leaving the hub visually signals a state change.
export default function PanelShell({ eyebrow, title, index, children }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <SquareMark activeIndex={index} variant="onPaper" />
      </View>

      <Text style={styles.title}>{title}</Text>

      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper, paddingHorizontal: spacing.lg, paddingTop: spacing.xxl },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xl },
  eyebrow: { ...type.eyebrow, color: colors.muted },
  title: { ...type.display, color: colors.ink },
  body: { flex: 1, marginTop: spacing.lg },
});
