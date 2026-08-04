import { View, Text, Image, StyleSheet } from "react-native";
import { colors, type } from "../../constants/theme";

type Props = {
  source?: number; // pass require("../../assets/illustrations/x.png")
};

// Until real illustration assets exist, shows a dashed placeholder so
// nothing crashes on a missing require(). Once you've added files to
// assets/illustrations, pass one in via the illustrationSource field on
// a Challenge — this component just renders whichever it's handed.
// Random selection from the folder can be added as a small util once
// there's more than one asset to pick from.
export default function IllustrationSlot({ source }: Props) {
  if (!source) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>illustration</Text>
      </View>
    );
  }

  return <Image source={source} style={styles.image} resizeMode="contain" />;
}

const styles = StyleSheet.create({
  placeholder: {
    height: 220,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: { ...type.caption, color: colors.muted },
  image: { height: 220, width: "100%" },
});
