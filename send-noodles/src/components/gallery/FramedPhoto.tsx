import { Image, ImageSourcePropType, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { FrameKey } from "../../data/wallLayout";

const FRAME_SOURCES: Record<FrameKey, ImageSourcePropType> = {
  frame1: require("../../../assets/frames/frame1.png"),
  frame2: require("../../../assets/frames/frame2.png"),
  frame3: require("../../../assets/frames/frame3.png"),
  // Same art as the profile's reward badges (constants/frames.ts).
  Frame_First: require("../../../assets/frames/Frame_First.png"),
  Frame_Three: require("../../../assets/frames/Frame_Three.png"),
  Frame_Five: require("../../../assets/frames/Frame_five.png"),
  Frame_Seven: require("../../../assets/frames/Frame_Seven.png"),
  Frame_Ten: require("../../../assets/frames/Frame_Ten.png"),
  Frame_Daily_Challenge: require("../../../assets/frames/Frame_Daily_Challenge.png"),
  Frame_Time_Sensitive_Challenge: require("../../../assets/frames/Frame_Time_Sensitive_Challenge.png"),
  Frame_Friend_Challenge: require("../../../assets/frames/Frame_Friend_Challenge.png"),
  Frame_Weekly_Challenge: require("../../../assets/frames/Frame_Weekly_Challenge.png"),
};

// Fraction of the frame's size taken up by its border on each side —
// measured against the white square cut into each frame asset, plus a
// small safety margin so the photo always sits clearly inside the
// border rather than flush against it.
const FRAME_INSET: Record<FrameKey, number> = {
  frame1: 0.22,
  frame2: 0.15,
  frame3: 0.14,
  Frame_First: 0.14,
  Frame_Three: 0.14,
  Frame_Five: 0.14,
  Frame_Seven: 0.14,
  Frame_Ten: 0.22,
  Frame_Daily_Challenge: 0.14,
  Frame_Time_Sensitive_Challenge: 0.14,
  Frame_Friend_Challenge: 0.14,
  Frame_Weekly_Challenge: 0.14,
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
      <Image source={FRAME_SOURCES[frame]} resizeMode="contain" style={styles.frame} />
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
