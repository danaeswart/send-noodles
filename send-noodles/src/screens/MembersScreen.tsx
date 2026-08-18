import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";

import Avatar from "../components/profile/Avatar";
import { faceSourceForId, DEFAULT_AVATAR_SOURCE } from "../constants/avatarFaces";
import { colors, spacing, type } from "../constants/theme";
import { useAuthUser } from "../hooks/useAuthUser";
import { useCircle } from "../hooks/useCircle";
import { useUserProfiles } from "../hooks/useUserProfiles";
import { removeMember } from "../../firebase/circles";
import { RootStackParamList } from "../navigation/types";

export default function MembersScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "Members">>();
  const circleId = route.params.circleId;

  const { user } = useAuthUser();
  const userId = user?.uid ?? null;

  const circle = useCircle(circleId);
  const profiles = useUserProfiles(circle?.members ?? []);
  const [memberActionError, setMemberActionError] = useState<string | null>(null);

  const isCreator = !!circle && circle.creatorId === userId;

  const handleRemoveMember = (memberId: string) => {
    Alert.alert("Remove member?", "They'll need a new invite code to rejoin the circle.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          if (!userId) return;
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

        <Text style={styles.title}>members</Text>

        {circle?.members.map((memberId) => {
          const profile = profiles.find((p) => p.id === memberId);
          const source = faceSourceForId(profile?.avatarId) ?? DEFAULT_AVATAR_SOURCE;
          return (
            <View key={memberId} style={styles.memberRow}>
              <View style={styles.memberInfo}>
                <Avatar source={source} size={48} />
                <Text style={styles.memberName}>{profile?.displayName ?? "…"}</Text>
              </View>
              {isCreator && memberId !== circle.creatorId && (
                <Pressable onPress={() => handleRemoveMember(memberId)} hitSlop={8}>
                  <Text style={styles.removeText}>remove</Text>
                </Pressable>
              )}
            </View>
          );
        })}
        {memberActionError && <Text style={styles.errorText}>{memberActionError}</Text>}
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
  title: { ...type.display, color: colors.ink, fontSize: 34, fontWeight: "900", marginBottom: spacing.lg },
  memberRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg },
  memberInfo: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  memberName: { ...type.serifDisplay, fontSize: 20, color: colors.ink },
  removeText: { ...type.caption, color: colors.alert, textTransform: "uppercase", letterSpacing: 1 },
  errorText: { ...type.caption, color: colors.alert, marginTop: spacing.sm },
});
