import { Dimensions, Image, ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import MemberFaceRow from "../components/circles/MemberFaceRow";
import { colors, spacing, type } from "../constants/theme";
import { RootStackParamList } from "../navigation/types";
import { useAuthUser } from "../hooks/useAuthUser";
import { useCircle } from "../hooks/useCircle";
import { useMemories } from "../hooks/useMemories";
import { useUserProfiles } from "../hooks/useUserProfiles";
import { PERSONAL_CIRCLE_CHALLENGE_TEXT } from "../constants/personalCircleChallenge";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SNAP_GAP = spacing.sm;
const SNAP_ITEM_SIZE = (SCREEN_WIDTH - spacing.lg * 2 - SNAP_GAP * 2) / 3;

// The detail view for every user's auto-created, solo "Me, Myself & I"
// circle (see createPersonalCircle) — deliberately a separate screen
// from CircleDetailScreen rather than a bunch of isPersonal branches
// bolted onto it: there's no join code, no wager/duration, and no
// invite/battle flow. What it keeps from a normal circle: the header
// chrome and the member-face treatment (just the one face — this
// user's own avatar/initials, via the same MemberFaceRow every circle
// uses). "all snaps" is deliberately every snap this user has EVER
// sent, to any circle — not just this one — via useMemories, the same
// data source Memories/MemoryDetail already use, so tapping through
// reuses that existing swipeable polaroid detail view rather than a
// second, circle-scoped one.
export default function PersonalCircleScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "PersonalCircle">>();
  const circleId = route.params.circleId;

  const { user } = useAuthUser();
  const userId = user?.uid ?? null;

  const circle = useCircle(circleId);
  const ownProfile = useUserProfiles(userId ? [userId] : []);
  const allSnaps = useMemories(userId);

  if (!circle) {
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
          <Text style={styles.messageTitle}>circle not found</Text>
        </ScrollView>
      </View>
    );
  }

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

        {userId && (
          <View style={styles.membersRow}>
            <MemberFaceRow memberIds={[userId]} profiles={ownProfile} size={40} />
          </View>
        )}

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>personal circle</Text>
        <Text style={styles.messageText}>This is your personal circle. No one can join this circle. It's just for you.</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>today's personal challenge</Text>
        <Text style={styles.challengeText}>{PERSONAL_CIRCLE_CHALLENGE_TEXT}</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>ALL SNAPS - like ever</Text>
        <Pressable onPress={() => navigation.navigate("Memories")}>
          <View style={styles.snapGrid}>
            {[...Array(6)].map((_, index) => {
              const snap = allSnaps[index];
              return (
                <View key={snap?.id ?? index} style={styles.snapItem}>
                  {snap && <Image source={{ uri: snap.imageUrl }} style={styles.snapItem} resizeMode="cover" />}
                </View>
              );
            })}
          </View>
          <Text style={styles.viewAllSnaps}>view all snaps →</Text>
        </Pressable>
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
  circleTitle: {
    ...type.display,
    color: colors.ink,
    fontSize: 48,
    lineHeight: 54,
    fontWeight: "900",
    marginBottom: spacing.lg,
  },
  messageTitle: { ...type.serifDisplay, color: colors.ink, fontSize: 34, lineHeight: 42, marginBottom: spacing.lg },
  membersRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.lg },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: spacing.lg },
  sectionLabel: { ...type.eyebrow, color: colors.muted, letterSpacing: 2, marginBottom: spacing.sm },
  messageText: { ...type.body, color: colors.muted, lineHeight: 20 },
  challengeText: { ...type.serifDisplay, fontSize: 26, lineHeight: 32, color: colors.ink },
  snapGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.lg },
  snapItem: { width: SNAP_ITEM_SIZE, height: SNAP_ITEM_SIZE, backgroundColor: colors.line, borderRadius: spacing.sm },
  viewAllSnaps: { ...type.body, color: colors.ink, fontStyle: "italic", marginTop: spacing.sm },
});
