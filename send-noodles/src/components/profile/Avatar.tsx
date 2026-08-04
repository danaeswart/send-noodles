import { View, Text, Image, StyleSheet } from "react-native";
import { colors, type } from "../../constants/theme";

type Props = {
  source?: number;
  size?: number;
};

// Square, hard-edged avatar frame — deliberately not rounded, matching
// the deck's sharp-corner language. Shows a dashed placeholder until a
// real illustration/photo asset is passed in.
export default function Avatar({ source, size = 132 }: Props) {
  if (!source) {
    return (
      <View style={[styles.placeholder, { width: size, height: size }]}>
        <Text style={styles.placeholderText}>avatar</Text>
      </View>
    );
  }

  return <Image source={source} style={[styles.image, { width: size, height: size }]} resizeMode="cover" />;
}

const styles = StyleSheet.create({
  placeholder: {
    borderWidth: 1.5,
    borderColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: { ...type.caption, color: colors.muted },
  image: { borderWidth: 1.5, borderColor: colors.ink },
});
