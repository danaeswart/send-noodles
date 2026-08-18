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
import { faceSourceForId } from "../../constants/avatarFaces";
import Avatar from "../../components/profile/Avatar";
import StatsRow from "../../components/profile/StatsRow";
import FrameSwatches from "../../components/profile/FrameSwatches";
import AvatarStyleRow from "../../components/profile/AvatarStyleRow";
import { useAuthUser } from "../../hooks/useAuthUser";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useMyCircles } from "../../hooks/useMyCircles";
import { setAvatarId } from "../../../firebase/users";

type Props = {
  isActive: boolean;
};

// Top half of the profile screen. Fade-up entrance replays whenever this
// page becomes active, matching the pattern established in ChallengeCard.
export default function ProfileStatsPage({ isActive }: Props) {
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);

  const { user } = useAuthUser();
  const userId = user?.uid ?? null;
  const { profile } = useUserProfile(userId);
  const circles = useMyCircles(userId);

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

  const handleSelectAvatar = (avatarId: string) => {
    if (userId) void setAvatarId(userId, avatarId);
  };

  return (
    <View style={[styles.page, { paddingTop: insets.top + spacing.xl }]}>
      <Animated.View style={[styles.identity, fadeStyle]}>
        <Avatar source={faceSourceForId(profile?.avatarId)} />
        <View style={styles.identityText}>
          <Text style={styles.username}>{profile?.displayName ?? user?.email ?? "…"}</Text>
          <View style={styles.streakRow}>
            <View style={styles.streakDot} />
            <Text style={styles.streakText}>{profile?.stats.streak ?? 0} day streak</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View style={fadeStyle}>
        <StatsRow
          challengesCompleted={profile?.stats.challengesCompleted ?? 0}
          snaps={profile?.stats.totalSnaps ?? 0}
          circles={circles.length}
        />
      </Animated.View>

      <Animated.View style={fadeStyle}>
        <FrameSwatches frameIds={profile?.unlockedFrames ?? []} />
      </Animated.View>

      <Animated.View style={fadeStyle}>
        <Text style={[styles.sectionLabel, styles.sectionSpacing]}>Avatar Style</Text>
        <AvatarStyleRow selectedId={profile?.avatarId ?? null} onSelect={handleSelectAvatar} />
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
  sectionLabel: { ...type.eyebrow, color: colors.muted, marginBottom: spacing.sm },
  sectionSpacing: { marginTop: spacing.lg },
  hintWrap: { flex: 1, justifyContent: "flex-end", alignItems: "center", paddingBottom: spacing.xl },
  hint: { ...type.caption, color: colors.muted },
});
