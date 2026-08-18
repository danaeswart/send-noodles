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
  const translateY = useSharedValue(220);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (!active) {
      translateY.value = 220;
      opacity.value = 0;
      rotate.value = 0;
      return;
    }
    opacity.value = withDelay(delay, withTiming(1, { duration: 150 }));
    translateY.value = withDelay(
      delay,
      withSequence(
        withTiming(-160 - Math.random() * 60, { duration: 420, easing: Easing.out(Easing.cubic) }),
        withTiming(40, { duration: 500, easing: Easing.in(Easing.cubic) }),
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
      <NoodleIcon size={30} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.ink, paddingHorizontal: spacing.lg, paddingTop: spacing.xxl * 1.5 },
  headline: { ...type.serifDisplay, fontSize: 40, lineHeight: 44, color: colors.paper },
  confettiWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 280,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  piece: { position: "absolute", bottom: 40, alignSelf: "center" },
});
