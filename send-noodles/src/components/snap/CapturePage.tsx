import { useEffect } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { colors, spacing, type } from "../../constants/theme";
import CapturedPhotoFrame from "./CapturedPhotoFrame";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SWIPE_THRESHOLD = 60;

type Props = {
  hasPhoto: boolean;
  photoColor: string;
  onCapture: () => void;
  onRequestReview: () => void;
};

// Top page of the capture/send flow. Stands in for a live camera
// preview until that's wired in.
// TODO: replace the dashed viewfinder box with a real
// <CameraView style={StyleSheet.absoluteFill} facing="back" /> from
// expo-camera, and call takePictureAsync() from a real shutter trigger
// instead of the mock swipe-down handler below.
//
// Swipe DOWN here always captures — or re-captures, silently discarding
// whatever photo was already there — and never changes page. This is
// deliberate: it lets someone retake a shot as many times as they want
// without ever leaving this screen.
// Swipe UP moves to the review page, but only once a photo exists.
export default function CapturePage({ hasPhoto, photoColor, onCapture, onRequestReview }: Props) {
  const fallProgress = useSharedValue(0);

  useEffect(() => {
    if (hasPhoto) {
      fallProgress.value = 0;
      fallProgress.value = withTiming(1, { duration: 550, easing: Easing.in(Easing.cubic) });
    }
  }, [hasPhoto, photoColor]);

  const fallStyle = useAnimatedStyle(() => ({
    opacity: 1 - fallProgress.value,
    transform: [{ translateY: fallProgress.value * (SCREEN_HEIGHT * 0.35) }],
  }));

  const dockStyle = useAnimatedStyle(() => ({
    opacity: fallProgress.value,
  }));

  const pan = Gesture.Pan()
    .activeOffsetY([-10, 10])
    .failOffsetX([-15, 15])
    .onEnd((e) => {
      if (e.translationY > SWIPE_THRESHOLD) {
        runOnJS(onCapture)();
      } else if (e.translationY < -SWIPE_THRESHOLD && hasPhoto) {
        runOnJS(onRequestReview)();
      }
    });

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.page}>
        <View style={styles.viewfinder}>
          <Text style={styles.viewfinderLabel}>camera preview</Text>
        </View>

        {hasPhoto && (
          <Animated.View style={[styles.fallingThumb, fallStyle]} pointerEvents="none">
            <CapturedPhotoFrame placeholderColor={photoColor} height={140} />
          </Animated.View>
        )}

        <View style={styles.footer}>
          <Text style={styles.instruction}>
            {hasPhoto ? "swipe up to review your snap" : "swipe down to capture"}
          </Text>
          {hasPhoto && (
            <Animated.View style={[styles.dock, dockStyle]}>
              <View style={[styles.dockChip, { backgroundColor: photoColor }]} />
              <Text style={styles.dockLabel}>photo ready below</Text>
            </Animated.View>
          )}
        </View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.ink, paddingHorizontal: spacing.lg, justifyContent: "space-between" },
  viewfinder: {
    flex: 1,
    marginTop: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.paperDim,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  viewfinderLabel: { ...type.caption, color: colors.paperDim, opacity: 0.6 },
  fallingThumb: { position: "absolute", alignSelf: "center", top: "30%", width: "70%" },
  footer: { paddingBottom: spacing.xxl, alignItems: "center" },
  instruction: { ...type.eyebrow, color: colors.paper, marginBottom: spacing.sm },
  dock: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  dockChip: { width: 20, height: 20, borderWidth: 1, borderColor: colors.paper },
  dockLabel: { ...type.caption, color: colors.paperDim },
});
