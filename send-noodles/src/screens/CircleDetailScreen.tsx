import { useEffect, useState } from "react";
import { Alert, Image, ScrollView, Share, StyleSheet, Text, View, Pressable } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AvatarCluster from "../components/challenges/AvatarCluster";
import { colors, spacing, type } from "../constants/theme";
import { RootStackParamList } from "../navigation/types";
import { useAuthUser } from "../hooks/useAuthUser";
import { useActiveChallenge } from "../hooks/useActiveChallenge";
import { useChallengeAgreement } from "../hooks/useChallengeAgreement";
import { useScoreboard } from "../hooks/useScoreboard";
import { useChallengeSnaps } from "../hooks/useChallengeSnaps";
import { checkAndCompleteChallengeIfDone } from "../../firebase/challenges";
import { removeMember } from "../../firebase/circles";
import { toParticipants } from "../utils/participants";

export default function CircleDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "CircleDetail">>();
  const circleId = route.params?.circleId ?? null;

  const { user } = useAuthUser();
  const userId = user?.uid ?? null;

  const { circle, canProposeChallenge, startTimer, actionError } = useActiveChallenge(circleId, userId);
  const challengeId = circle?.activeChallengeId ?? null;
  const { challenge, myAgreement, canEdit, agree, decline } = useChallengeAgreement(circleId, challengeId, userId);
  const { totals, submittedUserIds } = useScoreboard(circleId, challengeId);
  const snaps = useChallengeSnaps(circleId, challengeId);
  const [memberActionError, setMemberActionError] = useState<string | null>(null);

  // Opportunistic "completed" transition — there's no Cloud Function to
  // do this the instant it becomes true on the Spark plan, so whichever
  // member's client is looking (via this same scoreboard listener)
  // flips it once the condition is actually met.
  useEffect(() => {
    if (!circleId || !challengeId || !challenge) return;
    void checkAndCompleteChallengeIfDone(circleId, challengeId, challenge, submittedUserIds.size);
  }, [circleId, challengeId, challenge, submittedUserIds]);

  if (!circleId || !circle) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backText}>←</Text>
            </Pressable>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerEyebrow}>circles</Text>
              <View style={styles.headerAccentLine} />
            </View>
          </View>
          <Text style={styles.challengeTitle}>circle not found</Text>
        </ScrollView>
      </View>
    );
  }

  const teamEntries = Object.entries(challenge?.teams ?? {});
  const [teamAId, teamAMembers] = teamEntries[0] ?? ["team_1", []];
  const [teamBId, teamBMembers] = teamEntries[1] ?? ["team_2", []];
  const teamAScore = totals[teamAId] ?? 0;
  const teamBScore = totals[teamBId] ?? 0;
  const teamALeading = teamAScore > teamBScore;
  const teamBLeading = teamBScore > teamAScore;

  const canStartTimer = challenge?.status === "locked" && challenge.promptType === "time_sensitive";
  const ctaLabel = canProposeChallenge
    ? "+ create challenge"
    : canStartTimer
      ? "▶ start challenge"
      : challenge?.status === "setup"
        ? "tap 'the prize' to agree to the wager"
        : "challenge in progress";

  const handleCtaPress = () => {
    if (canProposeChallenge) navigation.navigate("ChallengeSetup", { circleId });
    else if (canStartTimer) void startTimer();
  };

  const handleWagerPress = () => {
    if (!canEdit) return;
    if (myAgreement === "agreed") void decline();
    else void agree();
  };

  const isCreator = circle.creatorId === userId;

  const handleShareCode = () => {
    void Share.share({ message: `Join my circle "${circle.name}" on Send Noodles — use code ${circle.joinCode}` });
  };

  const handleRemoveMember = (memberId: string) => {
    Alert.alert("Remove member?", "They'll need a new invite code to rejoin the circle.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          if (!circleId || !userId) return;
          setMemberActionError(null);
          removeMember(circleId, userId, memberId).catch((err) => {
            setMemberActionError(err instanceof Error ? err.message : "Couldn't remove that member.");
          });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerEyebrow}>circles</Text>
            <View style={styles.headerAccentLine} />
          </View>
        </View>

        <Text style={styles.circleTitle}>{circle.name}</Text>

        <View style={styles.avatarRow}>
          <AvatarCluster participants={toParticipants(circle.members.slice(0, 4))} overflowCount={Math.max(0, circle.members.length - 4)} />
          <Text style={styles.memberCount}>{circle.members.length} members</Text>
        </View>

        <View style={styles.divider} />

        {isCreator && (
          <>
            <Text style={styles.sectionLabel}>circle code</Text>
            <View style={styles.codeRow}>
              <Text style={styles.codeText}>{circle.joinCode}</Text>
              <Pressable onPress={handleShareCode} hitSlop={8}>
                <Text style={styles.shareText}>share →</Text>
              </Pressable>
            </View>
            <View style={styles.divider} />
          </>
        )}

        <Text style={styles.sectionLabel}>members</Text>
        {circle.members.map((memberId) => (
          <View key={memberId} style={styles.memberRow}>
            <Text style={styles.memberName}>{memberId === userId ? "you" : memberId.slice(0, 6)}</Text>
            {isCreator && memberId !== circle.creatorId && (
              <Pressable onPress={() => handleRemoveMember(memberId)} hitSlop={8}>
                <Text style={styles.removeText}>remove</Text>
              </Pressable>
            )}
          </View>
        ))}
        {memberActionError && <Text style={styles.errorText}>{memberActionError}</Text>}

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>current challenge</Text>
        <Text style={styles.challengeTitle}>{challenge?.promptText ?? "no active challenge yet"}</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>duration</Text>
            <Text style={styles.statValue}>
              {challenge?.timeline.durationHours ? `${challenge.timeline.durationHours}h` : "not set"}
            </Text>
          </View>
          <Pressable style={styles.statCard} onPress={handleWagerPress} disabled={!canEdit}>
            <Text style={styles.statLabel}>the prize</Text>
            <Text style={styles.statValueSecondary}>
              {challenge?.wager || "no wager yet"}
              {myAgreement === "agreed" ? "  ✓ you agreed" : canEdit ? "  · tap to agree" : ""}
            </Text>
          </Pressable>
        </View>

        {challenge && (
          <>
            <View style={styles.divider} />

            <View style={styles.battleHeaderRow}>
              <Text style={styles.sectionLabel}>the battle</Text>
              <Text style={styles.leadingLabel}>leading</Text>
            </View>

            <View style={styles.battleRow}>
              <View style={styles.battleBlock}>
                <Text style={[styles.teamLabel, teamALeading && styles.leadingTeam]}>{teamAId.replace("_", " ")}</Text>
                <Text style={[styles.battleScore, teamALeading && styles.leadingScore]}>{teamAScore}</Text>
                <View style={styles.teamSubRow}>
                  <AvatarCluster participants={toParticipants(teamAMembers)} overflowCount={0} />
                  <Text style={[styles.teamCaption, teamALeading && styles.leadingTeam]}>{teamAId.replace("_", " ")}</Text>
                </View>
              </View>
              <View style={styles.battleBlock}>
                <Text style={[styles.teamLabel, teamBLeading && styles.leadingTeam]}>{teamBId.replace("_", " ")}</Text>
                <Text style={[styles.battleScore, teamBLeading && styles.leadingScore]}>{teamBScore}</Text>
                <View style={styles.teamSubRow}>
                  <AvatarCluster participants={toParticipants(teamBMembers)} overflowCount={0} />
                  <Text style={[styles.teamCaption, teamBLeading && styles.leadingTeam]}>{teamBId.replace("_", " ")}</Text>
                </View>
              </View>
            </View>

            <View style={styles.lineChartPlaceholder}>
              <Text style={styles.chartLabel}>chart placeholder</Text>
            </View>
          </>
        )}

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>today's snaps</Text>
        <View style={styles.snapGrid}>
          {[...Array(4)].map((_, index) => {
            const snap = snaps[index];
            return (
              <View key={snap?.id ?? index} style={styles.snapItem}>
                {snap && <Image source={{ uri: snap.imageUrl }} style={styles.snapItem} resizeMode="cover" />}
              </View>
            );
          })}
        </View>
        <Text style={styles.viewAllSnaps}>view all snaps →</Text>

        <View style={styles.divider} />

        <Pressable onPress={handleCtaPress} disabled={!canProposeChallenge && !canStartTimer}>
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </Pressable>
        {actionError && <Text style={styles.errorText}>{actionError}</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.xxl, paddingBottom: spacing.xxl },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.lg },
  backButton: { marginRight: spacing.md },
  backText: { color: colors.ink, fontSize: 24 },
  headerTitleWrap: { flexDirection: "row", alignItems: "center" },
  headerEyebrow: { ...type.eyebrow, color: colors.muted, letterSpacing: 2 },
  headerAccentLine: { width: 24, height: 2, backgroundColor: colors.accent, marginLeft: spacing.sm },
  circleTitle: { ...type.display, color: colors.ink, fontSize: 48, lineHeight: 54, fontWeight: "900", marginBottom: spacing.lg },
  avatarRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.lg },
  memberCount: { ...type.caption, color: colors.muted, marginLeft: spacing.sm },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: spacing.lg },
  sectionLabel: { ...type.eyebrow, color: colors.muted, letterSpacing: 2, marginBottom: spacing.sm },
  codeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  codeText: { ...type.display, color: colors.ink, fontSize: 32, letterSpacing: 4 },
  shareText: { ...type.caption, color: colors.accent, textTransform: "uppercase", letterSpacing: 1 },
  memberRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: spacing.xs },
  memberName: { ...type.body, color: colors.ink },
  removeText: { ...type.caption, color: colors.alert, textTransform: "uppercase", letterSpacing: 1 },
  challengeTitle: { ...type.serifDisplay, color: colors.ink, fontSize: 34, lineHeight: 42, marginBottom: spacing.lg },
  statsGrid: { flexDirection: "row", justifyContent: "space-between", gap: spacing.lg },
  statCard: { flex: 1, gap: spacing.xs },
  statLabel: { ...type.caption, color: colors.muted, textTransform: "uppercase", letterSpacing: 1 },
  statValue: { ...type.heading, color: colors.ink, fontSize: 28, marginTop: spacing.xs },
  statValueSecondary: { ...type.body, color: colors.muted, marginTop: spacing.xs },
  battleHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  leadingLabel: { ...type.caption, color: colors.accent, letterSpacing: 2 },
  battleRow: { flexDirection: "row", justifyContent: "space-between", gap: spacing.lg },
  battleBlock: { flex: 1 },
  teamLabel: { ...type.body, color: colors.ink, fontWeight: "700", textTransform: "lowercase" },
  leadingTeam: { color: colors.accent },
  battleScore: { ...type.display, color: colors.ink, fontSize: 40 },
  leadingScore: { color: colors.accent },
  teamSubRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.sm },
  teamCaption: { ...type.caption, color: colors.muted, textTransform: "lowercase" },
  lineChartPlaceholder: { height: 140, borderRadius: spacing.xl, backgroundColor: colors.paperDim, marginTop: spacing.lg, justifyContent: "center", alignItems: "center" },
  chartLabel: { ...type.caption, color: colors.muted },
  snapGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: spacing.lg, gap: spacing.sm },
  snapItem: { width: "48%", aspectRatio: 1, backgroundColor: colors.line, borderRadius: spacing.sm, marginBottom: spacing.sm },
  viewAllSnaps: { ...type.body, color: colors.ink, fontStyle: "italic", marginTop: spacing.sm },
  ctaText: { ...type.display, color: colors.accent, marginTop: spacing.xl, fontSize: 32, lineHeight: 36 },
  errorText: { ...type.caption, color: colors.alert, marginTop: spacing.sm },
});
