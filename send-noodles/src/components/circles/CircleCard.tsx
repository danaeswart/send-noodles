import { Pressable, StyleSheet, Text, View } from "react-native";

import MemberFaceRow from "./MemberFaceRow";
import { colors, spacing, type } from "../../constants/theme";
import { useChallengePreview } from "../../hooks/useChallengePreview";
import { useUserProfiles } from "../../hooks/useUserProfiles";
import type { CircleDoc, WithId } from "../../../firebase/types";

const AVATAR_CAP = 6;

type Props = {
  circle: WithId<CircleDoc>;
  color: string;
  isLastCircle: boolean;
  pageHeight: number;
  onPress: () => void;
};

export default function CircleCard({ circle, color, isLastCircle, pageHeight, onPress }: Props) {
  const challenge = useChallengePreview(circle.id, circle.activeChallengeId);
  const profiles = useUserProfiles(circle.members);

  return (
    <Pressable style={styles.pagePressable} onPress={onPress}>
      <View style={[styles.page, { height: pageHeight }]}>
        <View style={[styles.topPanel, { backgroundColor: color }]}>
          <View style={styles.pageHeader}>
            <Text style={styles.circleLabel}>CIRCLE</Text>
          </View>

          <Text style={styles.circleName}>{circle.name}</Text>

          <View style={styles.statsRow}>
            <Text style={styles.statsText}>{circle.members.length} members</Text>
          </View>
        </View>

        <View style={styles.contentPanel}>
          <View style={styles.challengePanel}>
            <Text style={styles.challengeLabel}>CURRENT CHALLENGE</Text>
            <Text style={styles.challengeStatus}>
              {challenge?.promptText ?? "no active challenge yet — tap to start one"}
            </Text>
          </View>

          <View style={styles.metaFooter}>
            <MemberFaceRow memberIds={circle.members} profiles={profiles} max={AVATAR_CAP} size={56} />
            <Text style={styles.openText}>tap anywhere to open</Text>
          </View>
        </View>

        <View style={styles.pageBottomHint}>
          <Text style={styles.pageBottomHintText}>
            {isLastCircle ? "swipe up to create or join a circle" : "swipe up to view more circles"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pagePressable: {
    width: "100%",
  },
  page: {
    width: "100%",
    backgroundColor: colors.paper,
  },
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  circleLabel: {
    ...type.eyebrow,
    color: colors.paper,
    letterSpacing: 2,
  },
  circleName: {
    ...type.display,
    color: colors.paper,
    fontSize: 44,
    lineHeight: 48,
    fontWeight: "900",
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  statsText: {
    ...type.caption,
    color: colors.paper,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  topPanel: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  contentPanel: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl + spacing.xl,
  },
  challengePanel: {
    padding: spacing.lg,
    borderRadius: spacing.xl,
    backgroundColor: colors.paper,
    flex: 1,
  },
  challengeLabel: {
    ...type.eyebrow,
    color: colors.muted,
    letterSpacing: 2,
  },
  challengeStatus: {
    ...type.serifDisplay,
    fontSize: 30,
    lineHeight: 36,
    color: colors.ink,
    marginTop: spacing.sm,
  },
  metaFooter: {
    marginTop: spacing.lg,
  },
  openText: {
    ...type.caption,
    color: colors.ink,
    fontWeight: "700",
    textTransform: "uppercase",
    textAlign: "center",
    marginTop: spacing.md,
  },
  pageBottomHint: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: spacing.xl,
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    zIndex: 1,
  },
  pageBottomHintText: {
    ...type.caption,
    color: colors.muted,
    textAlign: "center",
    letterSpacing: 1,
  },
});
