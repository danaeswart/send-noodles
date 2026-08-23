import { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from "react-native-reanimated";

import { colors, spacing, type } from "../../constants/theme";
import NoodleIcon from "./NoodleIcon";

const DISPLAY_DURATION_MS = 2200;

const PIECES: { delay: number; xOffset: number; rotateDir: 1 | -1 }[] = [
  { delay: 0, xOffset: -70, rotateDir: -1 },
  { delay: 80, xOffset: -30, rotateDir: 1 },
  { delay: 160, xOffset: 10, rotateDir: -1 },
  { delay: 40, xOffset: 55, rotateDir: 1 },
  { delay: 200, xOffset: 90, rotateDir: -1 },
  { delay: 120, xOffset: -100, rotateDir: 1 },
];

type Props = {
  active: boolean;
  onDone: () => void;
};

// Final beat of the send flow: a haptic buzz, a "noodle sent!" headline,
// and a handful of noodle icons tossed up from the bottom like confetti
// before settling. Once the toss finishes it hands control back so the
// parent can scroll back to the capture page automatically.
export default function NoodleSentPage({ active, onDone }: Props) {
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!active) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const timer = setTimeout(() => onDoneRef.current(), DISPLAY_DURATION_MS);
    return () => clearTimeout(timer);
  }, [active]);

  return (
    <View style={styles.page}>
      <Text style={styles.headline}>noodle{"\n"}sent!</Text>
      <View style={styles.confettiWrap} pointerEvents="none">
        {PIECES.map((piece, i) => (
          <ConfettiPiece key={i} active={active} {...piece} />
        ))}
      </View>
    </View>
  );
}

// How far below its resting spot a piece starts (and, once it falls
// back down, ends up) — comfortably past the bottom edge of the page
// so it's fully clipped by the outer screen's overflow:hidden rather
// than settling in view, the same way the page itself scrolls fully
// off rather than stopping partway.
const OFF_SCREEN_Y = 220;

function ConfettiPiece({
  active,
  delay,
  xOffset,
  rotateDir,
}: {
  active: boolean;
  delay: number;
  xOffset: number;
  rotateDir: 1 | -1;
}) {
  const translateY = useSharedValue(OFF_SCREEN_Y);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (!active) {
      translateY.value = OFF_SCREEN_Y;
      opacity.value = 0;
      rotate.value = 0;
      return;
    }
    opacity.value = withDelay(delay, withTiming(1, { duration: 150 }));
    translateY.value = withDelay(
      delay,
      withSequence(
        withTiming(-280 - Math.random() * 100, { duration: 460, easing: Easing.out(Easing.cubic) }),
        withTiming(OFF_SCREEN_Y, { duration: 500, easing: Easing.in(Easing.cubic) }),
      ),
    );
    rotate.value = withDelay(delay, withTiming(rotateDir * 220, { duration: 900, easing: Easing.out(Easing.cubic) }));
  }, [active]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: xOffset }, { translateY: translateY.value }, { rotate: `${rotate.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.piece, style]}>
      <NoodleIcon size={56} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.paper, paddingHorizontal: spacing.lg, paddingTop: spacing.xxl * 1.5 },
  headline: { ...type.serifDisplay, fontSize: 64, lineHeight: 68, color: colors.ink },
  confettiWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 420,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  piece: { position: "absolute", bottom: 40, alignSelf: "center" },
});
