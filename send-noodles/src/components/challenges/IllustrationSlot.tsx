import { View, Text, Image, StyleSheet } from "react-native";
import { colors, type } from "../../constants/theme";

type Props = {
  source?: number; // pass require("../../assets/illustrations/x.png"), see src/constants/illustrations.ts
  big?: boolean; // shown larger when a circle has no active challenge right now
};

// Falls back to a dashed placeholder if no source is handed in (should
// only happen if assets/illustrations ends up empty), otherwise just
// renders whichever illustration src/hooks/useHomeChallenges.ts randomly
// picked for this circle's card.
export default function IllustrationSlot({ source, big }: Props) {
  if (!source) {
    return (
      <View style={[styles.placeholder, big && styles.big]}>
        <Text style={styles.placeholderText}>illustration</Text>
      </View>
    );
  }

  return <Image source={source} style={[styles.image, big && styles.big]} resizeMode="contain" />;
}

const styles = StyleSheet.create({
  placeholder: {
    height: 260,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: { ...type.caption, color: colors.muted },
  // Deliberately wider than the card and pulled past its own right edge
  // (negative marginRight beats out the card's horizontal padding) so
  // the illustration bleeds off the physical screen edge rather than
  // sitting neatly inside it.
  image: { height: 260, width: "125%", alignSelf: "flex-end", marginRight: -56 },
  big: { height: 340, width: "135%", marginRight: -72 },
});
