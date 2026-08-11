import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AvatarCluster from "../components/challenges/AvatarCluster";
import { colors, spacing, type } from "../constants/theme";
import { mockCircles } from "../data/mockCircles";

export default function CircleDetailScreen() {
  const navigation = useNavigation();
  const circle = mockCircles[0];

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
          <AvatarCluster participants={circle.participants} overflowCount={circle.participantOverflowCount} />
          <Text style={styles.memberCount}>{circle.members} members</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>current challenge</Text>
        <Text style={styles.challengeTitle}>{circle.challengePrompt}</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>duration</Text>
            <Text style={styles.statValue}>{circle.weeks} weeks</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>the prize</Text>
            <Text style={styles.statValueSecondary}>loser buys a round of drinks</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.battleHeaderRow}>
          <Text style={styles.sectionLabel}>the battle</Text>
          <Text style={styles.leadingLabel}>leading</Text>
        </View>

        <View style={styles.battleRow}>
          <View style={styles.battleBlock}>
            <Text style={styles.teamLabel}>team chaos</Text>
            <Text style={styles.battleScore}>55</Text>
            <View style={styles.teamSubRow}>
              <AvatarCluster participants={circle.participants} overflowCount={circle.participantOverflowCount} />
              <Text style={styles.teamCaption}>team chaos</Text>
            </View>
          </View>
          <View style={styles.battleBlock}>
            <Text style={[styles.teamLabel, styles.leadingTeam]}>team noodle</Text>
            <Text style={[styles.battleScore, styles.leadingScore]}>61</Text>
            <View style={styles.teamSubRow}>
              <AvatarCluster participants={circle.participants.slice(0, 2)} overflowCount={1} />
              <Text style={[styles.teamCaption, styles.leadingTeam]}>team noodle</Text>
            </View>
          </View>
        </View>

        <View style={styles.lineChartPlaceholder}>
          <Text style={styles.chartLabel}>chart placeholder</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>today's snaps</Text>
        <View style={styles.snapGrid}>
          {[...Array(4)].map((_, index) => (
            <View key={index} style={styles.snapItem} />
          ))}
        </View>
        <Text style={styles.viewAllSnaps}>view all snaps →</Text>

        <View style={styles.divider} />

        <Text style={styles.ctaText}>+ create challenge</Text>
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
});
