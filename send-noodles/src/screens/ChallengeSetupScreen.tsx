import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import AuthButton from "../components/auth/AuthButton";
import AuthTextField from "../components/auth/AuthTextField";
import { colors, spacing, type } from "../constants/theme";
import { RootStackParamList } from "../navigation/types";
import { useAuthUser } from "../hooks/useAuthUser";
import { proposeChallenge } from "../../firebase/challenges";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ChallengeSetupScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, "ChallengeSetup">>();
  const circleId = route.params.circleId;

  const { user } = useAuthUser();
  const userId = user?.uid ?? null;

  const [durationHours, setDurationHours] = useState("24");
  const [wager, setWager] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (isSubmitting || !userId) return;

    const parsedDuration = Number(durationHours);
    if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
      setError("Enter how many hours the circle has.");
      return;
    }
    if (!wager.trim()) {
      setError("Give the challenge a prize.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await proposeChallenge(circleId, userId, wager, parsedDuration);
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create that challenge.");
    } finally {
      setIsSubmitting(false);
    }
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

        <Text style={styles.title}>challenge the circle</Text>
        <Text style={styles.explainer}>
          Send Noodles picks the prompt for you — a random daily or time-sensitive challenge. You set the terms:
          how long everyone's got, and what's on the line.
        </Text>

        <AuthTextField
          label="duration (hours)"
          value={durationHours}
          onChangeText={setDurationHours}
          placeholder="24"
          keyboardType="number-pad"
        />
        <AuthTextField label="the prize" value={wager} onChangeText={setWager} placeholder="loser buys a round of drinks" />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <AuthButton label={isSubmitting ? "sending…" : "challenge circle"} onPress={handleSubmit} />
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
  title: { ...type.serifDisplay, fontSize: 34, lineHeight: 40, color: colors.ink, marginBottom: spacing.sm },
  explainer: { ...type.body, color: colors.muted, marginBottom: spacing.md },
  errorText: { ...type.caption, color: colors.alert, marginTop: spacing.sm },
});
