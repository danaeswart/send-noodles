import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { colors, spacing, type } from "../../constants/theme";
import { mockProfile } from "../../data/mockProfile";
import Avatar from "../../components/profile/Avatar";
import StatsRow from "../../components/profile/StatsRow";
import FrameSwatches from "../../components/profile/FrameSwatches";
import RecentWinsList from "../../components/profile/RecentWinsList";

type Props = {
  isActive: boolean;
};

// Top half of the profile screen. Fade-up entrance replays whenever this
// page becomes active, matching the pattern established in ChallengeCard.
export default function ProfileStatsPage({ isActive }: Props) {
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      progress.value = 0;
      progress.value = withTiming(1, { duration: 550, easing: Easing.out(Easing.cubic) });
    }
  }, [isActive]);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(progress.value, [0, 1], [14, 0], Extrapolation.CLAMP) }],
  }));

  return (
    <View style={[styles.page, { paddingTop: insets.top + spacing.xl }]}>
      <Animated.View style={[styles.identity, fadeStyle]}>
        <Avatar source={mockProfile.avatarSource} />
        <View style={styles.identityText}>
          <Text style={styles.username}>{mockProfile.username}</Text>
          <View style={styles.streakRow}>
            <View style={styles.streakDot} />
            <Text style={styles.streakText}>{mockProfile.streakDays} day streak</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View style={fadeStyle}>
        <StatsRow points={mockProfile.points} snaps={mockProfile.snaps} circles={mockProfile.circles} />
      </Animated.View>

      <Animated.View style={fadeStyle}>
        <FrameSwatches frames={mockProfile.unlockedFrames} />
      </Animated.View>

      <Animated.View style={fadeStyle}>
        <RecentWinsList wins={mockProfile.recentWins} />
      </Animated.View>

      <View style={styles.hintWrap}>
        <Text style={styles.hint}>swipe up to see more settings</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.paper, paddingHorizontal: spacing.lg },
  identity: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  identityText: { justifyContent: "center", marginTop: spacing.sm },
  username: { ...type.serifDisplay, fontSize: 30, color: colors.ink },
  streakRow: { flexDirection: "row", alignItems: "center", marginTop: spacing.sm },
  streakDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#6C63FF", marginRight: spacing.xs },
  streakText: { ...type.caption, color: colors.ink },
  hintWrap: { flex: 1, justifyContent: "flex-end", alignItems: "center", paddingBottom: spacing.xl },
  hint: { ...type.caption, color: colors.muted },
});
