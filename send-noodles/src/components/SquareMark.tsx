import { View, StyleSheet } from "react-native";
import { colors } from "../constants/theme";

type Props = {
  activeIndex: number;
  size?: number;
  variant?: "onPaper" | "onInk";
};

// Signature motif carried over from the pitch deck's grid-square cover
// design. Reused as (1) the panel corner mark on each hub screen and
// (2) the swipe position indicator at the bottom of the hub. Squares,
// never dots — dots read as a generic carousel indicator; squares tie
// it back to the deck's own visual language.
export default function SquareMark({ activeIndex, size = 8, variant = "onPaper" }: Props) {
  const filled = variant === "onPaper" ? colors.ink : colors.paper;
  const empty = variant === "onPaper" ? colors.line : "rgba(244,241,232,0.35)";

  return (
    <View style={styles.row}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{
            width: size,
            height: size,
            marginHorizontal: size * 0.35,
            backgroundColor: i === activeIndex ? filled : "transparent",
            borderWidth: 1,
            borderColor: i === activeIndex ? filled : empty,
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
});
