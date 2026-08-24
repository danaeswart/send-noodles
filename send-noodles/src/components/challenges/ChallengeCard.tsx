import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import { useEffect } from "react";

import { colors, spacing, type } from "../../constants/theme";
import type { HomeChallengeCard } from "../../types/homeChallenge";
import { useUserProfiles } from "../../hooks/useUserProfiles";
import { nextMidnightISOString } from "../../utils/dailyCountdown";
import AvatarCluster from "./AvatarCluster";
import CountdownTimer from "./CountdownTimer";
import IllustrationSlot from "./IllustrationSlot";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const LONG_PRESS_MS = 500;

type Props = {
  card: HomeChallengeCard;
  index: number;
  isActive: boolean;
  isLast: boolean;
  scrollY: SharedValue<number>;
  onLongPressCapture: (circleId: string) => void;
};

// One full-screen slide in the vertical challenge feed.
//
// Two animation layers:
// 1. `cardStyle` — a scroll-driven parallax on the whole card (reads
//    scrollY directly, no separate animation loop) that gives the
//    "flip up" depth as one challenge replaces another.
// 2. `progress` — a per-element staggered fade-up that plays whenever
//    this card becomes the active one, not just on first mount, so
//    swiping back to a previous challenge still feels alive.
export default function ChallengeCard({ card, index, isActive, isLast, scrollY, onLongPressCapture }: Props) {
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);
  const profiles = useUserProfiles(card.memberIds);
  const hasChallenge = card.challenge !== null;

  useEffect(() => {
    if (isActive) {
      progress.value = 0;
      progress.value = withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) });
    }
  }, [isActive]);

  const cardStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_HEIGHT,
      index * SCREEN_HEIGHT,
      (index + 1) * SCREEN_HEIGHT,
    ];
    const translateY = interpolate(
      scrollY.value,
      inputRange,
      [SCREEN_HEIGHT * 0.18, 0, -SCREEN_HEIGHT * 0.18],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(scrollY.value, inputRange, [0.35, 1, 0.35], Extrapolation.CLAMP);
    return { transform: [{ translateY }], opacity };
  });

  const stagger = (start: number) =>
    useAnimatedStyle(() => {
      const end = start + 0.45;
      return {
        opacity: interpolate(progress.value, [start, end], [0, 1], Extrapolation.CLAMP),
        transform: [
          {
            translateY: interpolate(progress.value, [start, end], [16, 0], Extrapolation.CLAMP),
          },
        ],
      };
    });

  const illustrationAnim = stagger(0);
  const eyebrowAnim = stagger(0.15);
  const headlineAnim = stagger(0.25);
  const timerAnim = stagger(0.4);
  const circleAnim = stagger(0.5);
  const captureAnim = stagger(0.6);

  return (
    <Animated.View style={[styles.card, { paddingTop: insets.top + spacing.lg }, cardStyle]}>
      <Pressable
        style={styles.pressableFill}
        onLongPress={() => onLongPressCapture(card.circleId)}
        delayLongPress={LONG_PRESS_MS}
      >
        <Animated.View
          style={[styles.illustrationContainer, illustrationAnim, !hasChallenge && styles.illustrationContainerBig]}
        >
          <IllustrationSlot source={card.illustrationSource} big={!hasChallenge} />
        </Animated.View>

        {hasChallenge ? (
          <>
            <Animated.View style={[styles.section, eyebrowAnim]}>
              <Text style={styles.eyebrow}>Today's Challenge</Text>
            </Animated.View>

            <Animated.View style={headlineAnim}>
              <Text style={styles.headline}>{card.challenge!.promptText}</Text>
            </Animated.View>

            <Animated.View style={[styles.timerRow, timerAnim]}>
              <Text style={styles.endsInLabel}>Ends in</Text>
              <CountdownTimer endsAt={nextMidnightISOString()} />
            </Animated.View>
          </>
        ) : (
          <Animated.View style={[styles.section, eyebrowAnim]}>
            <Text style={styles.eyebrow}>Today's Challenge</Text>
            <Text style={styles.noChallengeText}>No active challenges</Text>
          </Animated.View>
        )}

        <Animated.View style={[styles.circleRow, circleAnim]}>
          <View>
            <Text style={styles.eyebrow}>Circle</Text>
            <Text style={styles.circleName}>{card.circleName}</Text>
          </View>
          <AvatarCluster memberIds={card.memberIds} profiles={profiles} />
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View style={captureAnim}>
          <Text style={styles.captureLabel}>Press and hold to capture</Text>
        </Animated.View>

        <View style={styles.hintWrap}>
          <Text style={styles.hint}>
            {isLast ? "that's all your challenges for today" : "swipe up to view other circle challenges"}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: SCREEN_HEIGHT,
    backgroundColor: colors.paper,
    paddingHorizontal: spacing.lg,
  },
  pressableFill: { flex: 1 },
  section: { marginTop: spacing.xl },
  eyebrow: { ...type.eyebrow, color: colors.muted },
  headline: {
    ...type.serifDisplay,
    fontSize: 34,
    lineHeight: 38,
    color: colors.ink,
    marginTop: spacing.sm,
  },
  noChallengeText: {
    ...type.serifDisplay,
    fontSize: 22,
    color: colors.muted,
    marginTop: spacing.sm,
  },
  timerRow: { flexDirection: "row", alignItems: "baseline", marginTop: spacing.lg, gap: spacing.sm },
  endsInLabel: { ...type.eyebrow, color: colors.alert },
  circleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: spacing.xl,
  },
  circleName: { ...type.serifDisplay, fontSize: 20, color: colors.accent, marginTop: spacing.xs },
  divider: { height: 1, backgroundColor: colors.line, marginTop: spacing.lg },
  captureLabel: {
    ...type.caption,
    textAlign: "center",
    letterSpacing: 1,
    color: colors.ink,
    marginTop: spacing.lg,
  },
  illustrationContainer: {
    height: SCREEN_HEIGHT * 0.38,
    justifyContent: "center",
    alignItems: "flex-end",
    // Not clipped — IllustrationSlot's image is deliberately wider than
    // this container and pulled past its right edge so it bleeds off
    // the physical screen, rather than being cut off neatly at the
    // container bound.
    overflow: "visible",
  },
  illustrationContainerBig: {
    height: SCREEN_HEIGHT * 0.5,
  },
  hintWrap: { flex: 1, justifyContent: "flex-end", alignItems: "center", paddingBottom: spacing.xxl },
  hint: { ...type.caption, color: colors.muted },
});
