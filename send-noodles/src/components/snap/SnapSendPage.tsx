import { useEffect } from "react";
import { Dimensions, Image, Keyboard, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  LinearTransition,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { colors, spacing, type } from "../../constants/theme";
import PolaroidFrame from "./PolaroidFrame";
import CircleSelector from "./CircleSelector";
import CaptionInput from "./CaptionInput";
import NoodleIcon from "./NoodleIcon";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const CANCEL_THRESHOLD = 60;
const SEND_THRESHOLD = SCREEN_HEIGHT * 0.3;
// Overdamped relative to its stiffness on purpose — settles smoothly
// back to rest instead of oscillating, a floaty drift rather than a snap.
const FLOATY_SPRING = { damping: 22, stiffness: 90, mass: 0.9 };

type SelectableCircle = { id: string; name: string };

type Props = {
  photoUri: string | null;
  caption: string;
  onChangeCaption: (text: string) => void;
  onPost: () => void;
  onCancel: () => void;
  circles: SelectableCircle[];
  selectedCircleId: string | null;
  onSelectCircle: (circleId: string) => void;
  active: boolean;
};

// Bottom page of the capture/send flow. The circle picker and the
// polaroid land here already in place — CapturePage hands off to this
// page automatically once the shake-reveal finishes — and swoop in
// (circle from the top, caption + noodle from the bottom) each time the
// page becomes active. Sending isn't a whole-page swipe: the user grabs
// the noodle icon itself and drags it, free in any direction, while the
// circle picker trails behind at reduced speed like it's being bumped
// out of the way. Once the drag crosses the halfway point of the screen
// the send commits and everything keeps sailing off the top even if the
// finger lifts early; letting go before halfway springs it all back.
// Swiping down anywhere else still cancels and discards the photo,
// bouncing back up to the capture page.
export default function SnapSendPage({
  photoUri,
  caption,
  onChangeCaption,
  onPost,
  onCancel,
  circles,
  selectedCircleId,
  onSelectCircle,
  active,
}: Props) {
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const committed = useSharedValue(0);
  const keyboardShift = useSharedValue(0);
  const circleEntry = useSharedValue(0);
  const bottomEntry = useSharedValue(0);

  useEffect(() => {
    dragX.value = 0;
    dragY.value = 0;
    committed.value = 0;
  }, [photoUri]);

  useEffect(() => {
    if (active) {
      circleEntry.value = withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) });
      bottomEntry.value = withDelay(120, withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }));
    } else {
      circleEntry.value = 0;
      bottomEntry.value = 0;
    }
  }, [active]);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, () => {
      keyboardShift.value = withTiming(-90, { duration: 250 });
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      keyboardShift.value = withTiming(0, { duration: 250 });
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardShift]);

  // Downward-only: activeOffsetYStart is pushed far out of reach so an
  // upward drag never activates this page-level gesture and steals the
  // touch from the noodle's own pan below.
  const cancelPan = Gesture.Pan()
    .activeOffsetY([-100000, 15])
    .failOffsetX([-15, 15])
    .onEnd((e) => {
      if (e.translationY > CANCEL_THRESHOLD) {
        runOnJS(onCancel)();
      }
    });

  const sendPan = Gesture.Pan()
    .onUpdate((e) => {
      if (committed.value === 1) return;
      dragX.value = e.translationX;
      const nextY = Math.min(0, e.translationY);
      dragY.value = nextY;
      if (nextY < -SEND_THRESHOLD) {
        committed.value = 1;
        dragX.value = withTiming(0, { duration: 380 });
        dragY.value = withTiming(-SCREEN_HEIGHT, { duration: 380 }, (finished) => {
          if (finished) runOnJS(onPost)();
        });
      }
    })
    .onEnd(() => {
      if (committed.value === 1) return;
      dragX.value = withSpring(0, FLOATY_SPRING);
      dragY.value = withSpring(0, FLOATY_SPRING);
    });

  const keyboardStyle = useAnimatedStyle(() => ({ transform: [{ translateY: keyboardShift.value }] }));

  const circleStyle = useAnimatedStyle(() => ({
    opacity: circleEntry.value,
    transform: [{ translateY: dragY.value * 0.7 + (1 - circleEntry.value) * -50 }],
  }));

  const polaroidStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: dragY.value }],
    opacity: interpolate(dragY.value, [-SCREEN_HEIGHT * 0.9, 0], [0, 1], Extrapolation.CLAMP),
  }));

  const captionStyle = useAnimatedStyle(() => ({
    opacity: bottomEntry.value,
    transform: [{ translateY: dragY.value + (1 - bottomEntry.value) * 50 }],
  }));

  const noodleStyle = useAnimatedStyle(() => ({
    opacity: bottomEntry.value,
    transform: [
      { translateX: dragX.value },
      { translateY: dragY.value + (1 - bottomEntry.value) * 50 },
    ],
  }));

  return (
    <GestureDetector gesture={cancelPan}>
      <View style={styles.page}>
        <Animated.View style={[styles.content, keyboardStyle]}>
          <Pressable onPress={() => Keyboard.dismiss()} style={styles.dismissArea}>
            <Animated.View style={circleStyle}>
              <CircleSelector circles={circles} selectedId={selectedCircleId} onChange={onSelectCircle} />
            </Animated.View>

            <Animated.View layout={LinearTransition.duration(220)} style={[styles.photoWrap, polaroidStyle]}>
              <PolaroidFrame>
                {photoUri && (
                  <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                )}
              </PolaroidFrame>
            </Animated.View>

            <Animated.View layout={LinearTransition.duration(220)} style={[styles.captionWrap, captionStyle]}>
              <CaptionInput value={caption} onChangeText={onChangeCaption} />
            </Animated.View>
          </Pressable>

          <GestureDetector gesture={sendPan}>
            <Animated.View style={[styles.noodleWrap, noodleStyle]}>
              <NoodleIcon size={68} />
            </Animated.View>
          </GestureDetector>

          <Animated.View style={[styles.hintWrap, captionStyle]}>
            <Text style={styles.hintStrong}>drag the noodle up to send</Text>
            <Text style={styles.hintMuted}>swipe down to cancel</Text>
          </Animated.View>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.paper, paddingHorizontal: spacing.lg, paddingTop: spacing.xxl + spacing.lg },
  content: { flex: 1 },
  dismissArea: {},
  photoWrap: { marginTop: spacing.md },
  captionWrap: { marginTop: spacing.lg },
  noodleWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  hintWrap: { alignItems: "center", paddingBottom: spacing.xxl },
  hintStrong: { ...type.eyebrow, color: colors.ink, marginBottom: spacing.xs },
  hintMuted: { ...type.caption, color: colors.muted },
});
