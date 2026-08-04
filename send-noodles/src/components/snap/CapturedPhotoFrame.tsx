import { View, Image, Text, StyleSheet } from "react-native";
import { colors, type } from "../../constants/theme";

type Props = {
  uri?: string;
  placeholderColor?: string;
  height?: number;
};

// Renders the captured photo. Until expo-camera is wired in, `uri` will
// always be undefined and this shows a solid mock color swatch instead
// of a dashed placeholder — seeing an actual colored block land makes
// it much easier to visually confirm the fall/recapture animation is
// working correctly.
export default function CapturedPhotoFrame({ uri, placeholderColor = colors.paperDim, height = 320 }: Props) {
  if (uri) {
    return <Image source={{ uri }} style={[styles.frame, { height }]} resizeMode="cover" />;
  }

  return (
    <View style={[styles.frame, styles.placeholder, { height, backgroundColor: placeholderColor }]}>
      <Text style={styles.placeholderText}>captured photo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { width: "100%", borderWidth: 1, borderColor: colors.ink },
  placeholder: { alignItems: "center", justifyContent: "center" },
  placeholderText: { ...type.caption, color: colors.ink, opacity: 0.5 },
});
