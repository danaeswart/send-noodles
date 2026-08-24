import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { colors, spacing, type } from "../../constants/theme";
import ProgressDots from "./ProgressDots";

type Props = {
  title: string;
  body: string;
  stepIndex: number;
  stepCount: number;
  isLastStep: boolean;
  onNext: () => void;
  onSkip: () => void;
};

// The tour's one recurring piece of chrome: a plain white card, same
// rounded-corner/shadow language as the app's other cards (PolaroidFrame,
// FrameRewardModal), explaining whichever panel is currently on screen.
// A dim scrim sits behind it so it reads as a genuine pop-up over the
// real page rather than a banner — the real page stays visible (and, on
// the panels that already carry their own "swipe up for more" style
// hints, still readable) underneath.
export default function PopupCard({ title, body, stepIndex, stepCount, isLastStep, onNext, onSkip }: Props) {
  const insets = useSafeAreaInsets();
  const entrance = useSharedValue(0);

  useEffect(() => {
    entrance.value = 0;
    entrance.value = withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) });
  }, [stepIndex, entrance]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: entrance.value,
    transform: [{ translateY: (1 - entrance.value) * 14 }, { scale: 0.97 + entrance.value * 0.03 }],
  }));

  const scrimStyle = useAnimatedStyle(() => ({ opacity: entrance.value * 0.4 }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[styles.scrim, scrimStyle]} pointerEvents="none" />

      <View style={styles.centerWrap} pointerEvents="box-none">
        <Animated.View style={[styles.card, cardStyle]}>
          <ProgressDots total={stepCount} index={stepIndex} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>

          <Pressable style={styles.nextButton} onPress={onNext} hitSlop={8}>
            <Text style={styles.nextButtonText}>{isLastStep ? "Start exploring" : "Next"}</Text>
          </Pressable>

          <Text style={styles.tip}>Tip: check the bottom of each page for how to get around.</Text>
        </Animated.View>
      </View>

      <Pressable onPress={onSkip} hitSlop={10} style={[styles.skipButton, { top: insets.top + spacing.sm }]}>
        <Text style={styles.skipText}>skip</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.ink },
  centerWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl },
  card: {
    width: "100%",
    backgroundColor: colors.paper,
    borderRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: colors.ink,
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  title: { ...type.serifDisplay, fontSize: 24, lineHeight: 28, color: colors.ink, textAlign: "center", marginTop: spacing.md },
  body: { ...type.body, fontSize: 15, lineHeight: 21, color: colors.ink, textAlign: "center", marginTop: spacing.sm },
  nextButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: 999,
  },
  nextButtonText: { ...type.eyebrow, color: colors.paper, letterSpacing: 1.5 },
  tip: { ...type.caption, color: colors.muted, textAlign: "center", marginTop: spacing.md, lineHeight: 16 },
  skipButton: {
    position: "absolute",
    right: spacing.lg,
    backgroundColor: "rgba(20,20,20,0.55)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  skipText: { ...type.caption, color: colors.paper, letterSpacing: 1, textTransform: "uppercase" },
});
