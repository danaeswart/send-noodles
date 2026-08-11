import { useEffect, useRef, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
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
  photoUri: string | null;
  onCapture: (uri: string) => void;
  onRequestReview: () => void;
};

// Top page of the capture/send flow — a live camera viewfinder.
// Swipe DOWN here always captures — or re-captures, silently discarding
// whatever photo was already there — and never changes page. This is
// deliberate: it lets someone retake a shot as many times as they want
// without ever leaving this screen.
// Swipe UP moves to the review page, but only once a photo exists.
export default function CapturePage({ hasPhoto, photoUri, onCapture, onRequestReview }: Props) {
  const fallProgress = useSharedValue(0);
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (hasPhoto) {
      fallProgress.value = 0;
      fallProgress.value = withTiming(1, { duration: 550, easing: Easing.in(Easing.cubic) });
    }
  }, [hasPhoto, photoUri]);

  const fallStyle = useAnimatedStyle(() => ({
    opacity: 1 - fallProgress.value,
    transform: [{ translateY: fallProgress.value * (SCREEN_HEIGHT * 0.35) }],
  }));

  const dockStyle = useAnimatedStyle(() => ({
    opacity: fallProgress.value,
  }));

  const handleShutter = async () => {
    if (!cameraRef.current || !isCameraReady) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
    if (photo?.uri) onCapture(photo.uri);
  };

  const flipCamera = () => setFacing((current) => (current === "back" ? "front" : "back"));

  const pan = Gesture.Pan()
    .activeOffsetY([-10, 10])
    .failOffsetX([-15, 15])
    .onEnd((e) => {
      if (e.translationY > SWIPE_THRESHOLD) {
        runOnJS(handleShutter)();
      } else if (e.translationY < -SWIPE_THRESHOLD && hasPhoto) {
        runOnJS(onRequestReview)();
      }
    });

  if (!permission) {
    return <View style={styles.page} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.page, styles.permissionWrap]}>
        <Text style={styles.permissionTitle}>camera access needed</Text>
        <Text style={styles.permissionBody}>
          send noodles uses your camera to capture the photo you send.
        </Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonLabel}>grant camera access</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.page}>
        <View style={styles.viewfinderWrap}>
          <View style={styles.viewfinder}>
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing={facing}
              onCameraReady={() => setIsCameraReady(true)}
            />
            <Pressable style={styles.flipButton} onPress={flipCamera} hitSlop={12}>
              <Text style={styles.flipButtonLabel}>flip</Text>
            </Pressable>
          </View>
        </View>

        {hasPhoto && photoUri && (
          <Animated.View style={[styles.fallingThumb, fallStyle]} pointerEvents="none">
            <CapturedPhotoFrame uri={photoUri} height={140} />
          </Animated.View>
        )}

        <View style={styles.footer}>
          <Text style={styles.instruction}>
            {hasPhoto ? "swipe up to review your snap" : "swipe down to capture"}
          </Text>
          {hasPhoto && photoUri && (
            <Animated.View style={[styles.dock, dockStyle]}>
              <View style={styles.dockChip}>
                <CapturedPhotoFrame uri={photoUri} height={20} />
              </View>
              <Text style={styles.dockLabel}>photo ready below</Text>
            </Animated.View>
          )}
        </View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.paper, paddingHorizontal: spacing.lg, justifyContent: "space-between" },
  viewfinderWrap: {
    flex: 1,
    justifyContent: "center",
  },
  viewfinder: {
    alignSelf: "center",
    width: "84%",
    aspectRatio: 1,
    backgroundColor: colors.ink,
    borderWidth: 1,
    borderColor: colors.paperDim,
    overflow: "hidden",
  },
  flipButton: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.ink,
    opacity: 0.7,
  },
  flipButtonLabel: { ...type.caption, color: colors.paper, textTransform: "lowercase" },
  fallingThumb: { position: "absolute", alignSelf: "center", top: "30%", width: "70%" },
  footer: { paddingBottom: spacing.xxl, alignItems: "center" },
  instruction: { ...type.eyebrow, color: colors.ink, marginBottom: spacing.sm, textTransform: "lowercase" },
  dock: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  dockChip: { width: 20, height: 20 },
  dockLabel: { ...type.caption, color: colors.muted },
  permissionWrap: { alignItems: "center", justifyContent: "center", gap: spacing.md },
  permissionTitle: { ...type.heading, color: colors.ink },
  permissionBody: { ...type.body, color: colors.muted, textAlign: "center" },
  permissionButton: { borderWidth: 1, borderColor: colors.ink, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, marginTop: spacing.sm },
  permissionButtonLabel: { ...type.eyebrow, color: colors.ink, textTransform: "lowercase" },
});
