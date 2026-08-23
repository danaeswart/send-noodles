import { useEffect, useState } from "react";
import { Alert, Dimensions, Image, ScrollView, Share, StyleSheet, Text, View, Pressable } from "react-native";
import { Timestamp } from "firebase/firestore";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import MemberFaceRow from "../components/circles/MemberFaceRow";
import PointsChart from "../components/circles/PointsChart";
import { colors, spacing, type } from "../constants/theme";
import { RootStackParamList } from "../navigation/types";
import { useAuthUser } from "../hooks/useAuthUser";
import { useActiveChallenge } from "../hooks/useActiveChallenge";
import { useChallengeAgreement } from "../hooks/useChallengeAgreement";
import { useScoreboard } from "../hooks/useScoreboard";
import { useTicker } from "../hooks/useTicker";
import { useTodaysSnaps } from "../hooks/useTodaysSnaps";
import { useUserProfiles } from "../hooks/useUserProfiles";
import { awardChallengeRewards, checkAndCompleteChallengeIfDone } from "../../firebase/challenges";
import { leaveCircle } from "../../firebase/circles";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SNAP_GAP = spacing.sm;
const SNAP_ITEM_SIZE = (SCREEN_WIDTH - spacing.lg * 2 - SNAP_GAP * 2) / 3;

export default function CircleDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "CircleDetail">>();
  const circleId = route.params?.circleId ?? null;

  const { user } = useAuthUser();
  const userId = user?.uid ?? null;

  const { circle, startTimer, actionError } = useActiveChallenge(circleId, userId);
  const challengeId = circle?.activeChallengeId ?? null;
  const {
    challenge,
    myAgreement,
    agree,
    decline,
    actionError: agreementError,
  } = useChallengeAgreement(circleId, challengeId, userId);
  const { events, totals } = useScoreboard(circleId, challengeId);
  const snaps = useTodaysSnaps(circleId);
  const memberProfiles = useUserProfiles(circle?.members ?? []);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  // Ticks every minute so the "time left" stat below actually counts
  // down live instead of freezing at whatever it read on mount — called
  // unconditionally here (not after the early return below) since hooks
  // can't be conditional.
  const now = useTicker(60000);

  // Opportunistic "completed" transition — there's no Cloud Function to
  // do this the instant it becomes true on the Spark plan, so whichever
  // member's client is looking flips it once the deadline has actually
  // passed. Re-runs on every new scoring event (not just when the
  // challenge doc itself changes) so a snap landing right after the
  // deadline is still a chance to catch it, not just the client that
  // happened to have the screen open at the exact moment it expired.
  useEffect(() => {
    if (!circleId || !challengeId || !challenge) return;
    if (challenge.status === "active") {
      void checkAndCompleteChallengeIfDone(circleId, challengeId, challenge);
    } else if (challenge.status === "completed" && !challenge.rewardsGranted) {
      void awardChallengeRewards(circleId, challengeId);
    }
  }, [circleId, challengeId, challenge, events]);

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

  // The challenge's actual end, however it got there: a time-sensitive
  // prompt already carries an absolute endsAt (set by
  // startTimeSensitiveChallenge from the prompt's own timeLimitSeconds),
  // while a daily prompt only ever gets startedAt — its end is
  // startedAt + the duration the proposer picked (in days, stored as
  // hours; see ChallengeSetupScreen), computed here the same way
  // checkAndCompleteChallengeIfDone does server-side. Null while the
  // challenge hasn't started yet (setup/locked), since there's nothing
  // to count down from.
  const effectiveEndsAt =
    challenge?.timeline.endsAt ??
    (challenge?.timeline.startedAt && challenge?.timeline.durationHours
      ? Timestamp.fromMillis(
          challenge.timeline.startedAt.toMillis() + challenge.timeline.durationHours * 60 * 60 * 1000
        )
      : null);

  // Recomputed every tick of `now` (see useTicker above), rounded to the
  // nearest hour per the brief — floored at 1h rather than showing "0h
  // left" for the last stretch before it actually crosses over to
  // "time's up".
  const durationLabel = (() => {
    if (!challenge) return "not set";
    if (challenge.status === "completed") return "ended";
    if (!effectiveEndsAt) {
      return challenge.timeline.durationHours ? `${challenge.timeline.durationHours}h` : "not set";
    }
    const remainingMs = effectiveEndsAt.toMillis() - now;
    if (remainingMs <= 0) return "time's up";
    const remainingHours = Math.max(1, Math.round(remainingMs / (60 * 60 * 1000)));
    return `${remainingHours}h left`;
  })();

  const canStartTimer = challenge?.status === "locked" && challenge.promptType === "time_sensitive";
  // Derived from `challenge` (kept in sync with circle.activeChallengeId
  // via challengeId above) rather than useActiveChallenge's own
  // internal subscription — that one can briefly still be pointing at
  // the previous, already-completed challenge for a beat while its own
  // listener catches up to a freshly created one, which would flash
  // the "create challenge" button back on even though a new challenge
  // already exists.
  const hasActiveChallenge = !!challenge && challenge.status !== "completed";
  // While the *group* is still deciding (nobody's played yet), hide the
  // prompt/battle/teams and simplify the page to just the essentials —
  // snaps still always show regardless, since sending to the circle
  // never depends on challenge status.
  const isPendingInvite = challenge?.status === "setup";
  // Shown whenever the group is still deciding (isPendingInvite — lets
  // anyone, including the proposer, join/switch their answer up until
  // it locks) OR this specific viewer still hasn't answered even though
  // the group has already moved on — the case for someone who joined
  // the circle after the challenge locked/went active (see
  // joinCircleByCode): they still get to opt in, just onto a challenge
  // that's already running for everyone else.
  const canRespondToInvite = !!challenge && challenge.status !== "completed" && (isPendingInvite || myAgreement === "pending");
  const ctaLabel = hasActiveChallenge ? "▶ start challenge" : "+ create challenge";

  const handleCtaPress = () => {
    if (!hasActiveChallenge) navigation.navigate("ChallengeSetup", { circleId });
    else if (canStartTimer) void startTimer();
  };

  const isCreator = circle.creatorId === userId;

  const handleShareCode = () => {
    void Share.share({ message: `Join my circle "${circle.name}" on Send Noodles — use code ${circle.joinCode}` });
  };

  const handleLeaveCircle = () => {
    Alert.alert("Leave this circle?", "You'll need a new invite code to rejoin.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: () => {
          if (!userId) return;
          setLeaveError(null);
          leaveCircle(circleId, userId)
            .then(() => navigation.navigate("Main"))
            .catch((err) => {
              setLeaveError(err instanceof Error ? err.message : "Couldn't leave the circle.");
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

        <View style={styles.membersRow}>
          <MemberFaceRow memberIds={circle.members} profiles={memberProfiles} max={5} size={40} />
          <Pressable style={styles.membersButton} onPress={() => navigation.navigate("Members", { circleId })}>
            <Text style={styles.memberCount}>{circle.members.length} members</Text>
            <Text style={styles.membersArrow}>→</Text>
          </Pressable>
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

        {isPendingInvite ? (
          <Text style={styles.sectionLabel}>challenge invite</Text>
        ) : (
          <>
            <Text style={styles.sectionLabel}>current challenge</Text>
            <Text style={styles.challengeTitle}>{challenge?.promptText ?? "no active challenge yet"}</Text>
          </>
        )}

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{effectiveEndsAt ? "time left" : "duration"}</Text>
            <Text style={styles.statValue}>{durationLabel}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>the prize</Text>
            <Text style={styles.statValueSecondary}>{challenge?.wager || "no wager yet"}</Text>
          </View>
        </View>

        {canRespondToInvite && (
          <>
            <View style={styles.inviteButtonRow}>
              <Pressable
                style={[styles.inviteButton, myAgreement === "agreed" && styles.inviteButtonSelected]}
                onPress={() => void agree()}
              >
                <Text style={[styles.inviteButtonText, myAgreement === "agreed" && styles.inviteButtonTextSelected]}>
                  {myAgreement === "agreed" ? "✓ joined" : "join challenge"}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.inviteButton, myAgreement === "declined" && styles.inviteButtonSelected]}
                onPress={() => void decline()}
              >
                <Text
                  style={[styles.inviteButtonText, myAgreement === "declined" && styles.inviteButtonTextSelected]}
                >
                  {myAgreement === "declined" ? "✓ declined" : "decline"}
                </Text>
              </Pressable>
            </View>
            {myAgreement !== "pending" && (
              <Text style={styles.inviteStatusText}>
                {myAgreement === "agreed"
                  ? "you're in and on a team — waiting on everyone else to respond. tap decline to change your mind."
                  : "you're sitting this one out — your snaps still send to the circle, they just won't score. tap join challenge to change your mind."}
              </Text>
            )}
          </>
        )}
        {canRespondToInvite && agreementError && <Text style={styles.errorText}>{agreementError}</Text>}

        {challenge && !isPendingInvite && (
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
                  <MemberFaceRow memberIds={teamAMembers} profiles={memberProfiles} size={40} />
                </View>
              </View>
              <View style={styles.battleBlock}>
                <Text style={[styles.teamLabel, teamBLeading && styles.leadingTeam]}>{teamBId.replace("_", " ")}</Text>
                <Text style={[styles.battleScore, teamBLeading && styles.leadingScore]}>{teamBScore}</Text>
                <View style={styles.teamSubRow}>
                  <MemberFaceRow memberIds={teamBMembers} profiles={memberProfiles} size={40} />
                </View>
              </View>
            </View>

            <PointsChart events={events} teamAId={teamAId} teamBId={teamBId} />
          </>
        )}

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>today's snaps preview</Text>
        <Pressable onPress={() => navigation.navigate("CircleSnaps", { circleId, circleName: circle.name })}>
          <View style={styles.snapGrid}>
            {[...Array(6)].map((_, index) => {
              const snap = snaps[index];
              return (
                <View key={snap?.id ?? index} style={styles.snapItem}>
                  {snap && <Image source={{ uri: snap.imageUrl }} style={styles.snapItem} resizeMode="cover" />}
                </View>
              );
            })}
          </View>
          <Text style={styles.viewAllSnaps}>view all snaps →</Text>
        </Pressable>

        {/* Never shown alongside the invite buttons above: a member who
            still needs to join/decline this challenge (e.g. they joined
            the circle after a time-sensitive challenge already locked)
            would otherwise see "start challenge" sitting right next to
            "join challenge" — redundant, and not their call to make
            until they've actually answered the invite themselves. */}
        {(!hasActiveChallenge || canStartTimer) && !canRespondToInvite && (
          <>
            <View style={styles.divider} />

            <Pressable onPress={handleCtaPress}>
              <Text style={styles.ctaText}>{ctaLabel}</Text>
            </Pressable>
            {actionError && <Text style={styles.errorText}>{actionError}</Text>}
          </>
        )}

        <Pressable style={styles.leaveButton} onPress={handleLeaveCircle} hitSlop={8}>
          <Text style={styles.leaveButtonText}>leave circle</Text>
        </Pressable>
        {leaveError && <Text style={styles.errorText}>{leaveError}</Text>}
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
  membersRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg },
  membersButton: { flexDirection: "row", alignItems: "center" },
  memberCount: { ...type.caption, color: colors.muted },
  membersArrow: { ...type.body, color: colors.ink, marginLeft: spacing.sm },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: spacing.lg },
  sectionLabel: { ...type.eyebrow, color: colors.muted, letterSpacing: 2, marginBottom: spacing.sm },
  codeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  codeText: { ...type.display, color: colors.ink, fontSize: 32, letterSpacing: 4 },
  shareText: { ...type.caption, color: colors.accent, textTransform: "uppercase", letterSpacing: 1 },
  challengeTitle: { ...type.serifDisplay, color: colors.ink, fontSize: 34, lineHeight: 42, marginBottom: spacing.lg },
  statsGrid: { flexDirection: "row", justifyContent: "space-between", gap: spacing.lg },
  statCard: { flex: 1, gap: spacing.xs },
  statLabel: { ...type.caption, color: colors.muted, textTransform: "uppercase", letterSpacing: 1 },
  statValue: { ...type.heading, color: colors.ink, fontSize: 28, marginTop: spacing.xs },
  statValueSecondary: { ...type.body, color: colors.muted, marginTop: spacing.xs },
  inviteButtonRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.lg },
  inviteButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.ink,
    alignItems: "center",
  },
  inviteButtonText: { ...type.eyebrow, color: colors.ink, letterSpacing: 1 },
  inviteButtonSelected: { backgroundColor: colors.ink },
  inviteButtonTextSelected: { color: colors.paper },
  inviteStatusText: { ...type.caption, color: colors.muted, marginTop: spacing.sm, lineHeight: 18 },
  battleHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  leadingLabel: { ...type.caption, color: colors.accent, letterSpacing: 2 },
  battleRow: { flexDirection: "row", justifyContent: "space-between", gap: spacing.lg, marginBottom: spacing.lg },
  battleBlock: { flex: 1 },
  teamLabel: { ...type.body, color: colors.ink, fontWeight: "700", textTransform: "lowercase" },
  leadingTeam: { color: colors.accent },
  battleScore: { ...type.display, color: colors.ink, fontSize: 40 },
  leadingScore: { color: colors.accent },
  teamSubRow: { flexDirection: "row", alignItems: "center", marginTop: spacing.sm },
  snapGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.lg },
  snapItem: { width: SNAP_ITEM_SIZE, height: SNAP_ITEM_SIZE, backgroundColor: colors.line, borderRadius: spacing.sm },
  viewAllSnaps: { ...type.body, color: colors.ink, fontStyle: "italic", marginTop: spacing.sm },
  ctaText: { ...type.display, color: colors.accent, marginTop: spacing.xl, fontSize: 32, lineHeight: 36 },
  leaveButton: { alignSelf: "center", marginTop: spacing.xxl },
  leaveButtonText: { ...type.caption, color: colors.alert, textTransform: "uppercase", letterSpacing: 1 },
  errorText: { ...type.caption, color: colors.alert, marginTop: spacing.sm },
});
