import { Image, ImageSourcePropType, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { FrameKey } from "../../data/mockGallery";

const FRAME_SOURCES: Record<FrameKey, ImageSourcePropType> = {
  frame1: require("../../../assets/frames/frame1.png"),
  frame2: require("../../../assets/frames/frame2.png"),
  frame3: require("../../../assets/frames/frame3.png"),
};

// Fraction of the frame's size taken up by its border on each side —
// measured against the white square cut into each frame asset, plus a
// small safety margin so the photo always sits clearly inside the
// border rather than flush against it.
const FRAME_INSET: Record<FrameKey, number> = {
  frame1: 0.22,
  frame2: 0.15,
  frame3: 0.14,
};

type Props = {
  frame: FrameKey;
  // Left unset while the wall only shows empty frames — pass a source
  // once real/placeholder photos are wired back in.
  photo?: ImageSourcePropType;
  size: number;
  style?: StyleProp<ViewStyle>;
};

export default function FramedPhoto({ frame, photo, size, style }: Props) {
  const inset = size * FRAME_INSET[frame];

  return (
    <View style={[{ width: size, height: size }, style]}>
      <Image source={FRAME_SOURCES[frame]} resizeMode="stretch" style={styles.frame} />
      {photo ? (
        <Image
          source={photo}
          resizeMode="cover"
          style={[styles.photo, { left: inset, top: inset, right: inset, bottom: inset }]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  photo: { position: "absolute" },
  frame: { width: "100%", height: "100%" },
});
