import { useEffect, useRef, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { colors, spacing, type } from "../../constants/theme";
import PolaroidFrame from "./PolaroidFrame";
import useShakeDetector from "../../hooks/useShakeDetector";

const SWIPE_THRESHOLD = 60;

type Props = {
  hasPhoto: boolean;
  photoUri: string | null;
  onCapture: (uri: string) => void;
  onRequestReview: () => void;
};

// Top page of the capture/send flow — a live camera viewfinder styled as
// a polaroid. Swipe DOWN always captures (or re-captures, discarding
// whatever photo was already there) and never changes page — that's
// deliberate, it lets someone retake as many times as they want without
// leaving this screen. A fresh capture comes back face-down: the polaroid
// shows blank white until the phone is physically shaken, at which point
// it reveals the shot with a haptic buzz and, a beat later, moves on to
// the send page on its own — no swipe required to get there.
export default function CapturePage({ hasPhoto, photoUri, onCapture, onRequestReview }: Props) {
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const revealProgress = useSharedValue(0);
  const revealTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pulse = useSharedValue(1);

  useEffect(() => {
    setIsRevealed(false);
    revealProgress.value = 0;
    if (revealTimeout.current) clearTimeout(revealTimeout.current);
  }, [photoUri]);

  useEffect(() => {
    if (hasPhoto && !isRevealed) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 550, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 550, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
      );
    } else {
      pulse.value = withTiming(1, { duration: 150 });
    }
  }, [hasPhoto, isRevealed]);

  const reveal = () => {
    if (isRevealed) return;
    setIsRevealed(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    revealProgress.value = withTiming(1, { duration: 500 });
    revealTimeout.current = setTimeout(onRequestReview, 700);
  };

  useShakeDetector(reveal, hasPhoto && !isRevealed);

  const coverStyle = useAnimatedStyle(() => ({ opacity: 1 - revealProgress.value }));
  const photoStyle = useAnimatedStyle(() => ({ opacity: revealProgress.value }));
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

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

  const instruction = hasPhoto ? "shake to reveal photo" : "swipe down to capture";

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.page}>
        <View style={styles.cardWrap}>
          <View style={styles.cardGroup}>
            <PolaroidFrame width="100%">
              <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing={facing}
                onCameraReady={() => setIsCameraReady(true)}
              />
              {!hasPhoto && <View style={styles.dimScrim} pointerEvents="none" />}

              {hasPhoto && (
                <>
                  <Animated.View style={[styles.blankCover, coverStyle]} pointerEvents="none" />
                  {photoUri && (
                    <Animated.Image
                      source={{ uri: photoUri }}
                      style={[StyleSheet.absoluteFill, photoStyle]}
                      resizeMode="cover"
                    />
                  )}
                </>
              )}
            </PolaroidFrame>

            {!hasPhoto && (
              <View style={styles.flipButtonWrap} pointerEvents="box-none">
                <Pressable style={styles.flipButton} onPress={flipCamera} hitSlop={12}>
                  <Text style={styles.flipButtonLabel}>⇄ flip cam</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <Animated.Text style={[styles.instruction, hasPhoto && styles.instructionShake, hasPhoto && pulseStyle]}>
            {instruction}
          </Animated.Text>
        </View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.paper, paddingHorizontal: spacing.lg, justifyContent: "space-between" },
  cardWrap: { flex: 1, justifyContent: "center" },
  cardGroup: { alignSelf: "center", width: "84%" },
  dimScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.ink, opacity: 0.5 },
  blankCover: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.paper },
  flipButtonWrap: { position: "absolute", top: -18, left: 0, right: 0, alignItems: "center" },
  flipButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: "#D9A62E",
  },
  flipButtonLabel: { ...type.caption, color: colors.ink, textTransform: "uppercase", fontWeight: "700" },
  footer: { paddingBottom: spacing.xxl, alignItems: "center" },
  instruction: { ...type.eyebrow, color: colors.ink, textTransform: "lowercase" },
  instructionShake: { fontSize: 18, fontWeight: "800", color: colors.alert, letterSpacing: 0.4 },
  permissionWrap: { alignItems: "center", justifyContent: "center", gap: spacing.md },
  permissionTitle: { ...type.heading, color: colors.ink },
  permissionBody: { ...type.body, color: colors.muted, textAlign: "center" },
  permissionButton: { borderWidth: 1, borderColor: colors.ink, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, marginTop: spacing.sm },
  permissionButtonLabel: { ...type.eyebrow, color: colors.ink, textTransform: "lowercase" },
});
