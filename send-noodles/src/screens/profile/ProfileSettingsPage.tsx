import { useState } from "react";
import { ScrollView, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { colors, spacing, type } from "../../constants/theme";
import { mockProfile } from "../../data/mockProfile";
import SettingsFieldRow from "../../components/profile/SettingsFieldRow";
import ToggleRow from "../../components/profile/ToggleRow";
import ActionRow from "../../components/profile/ActionRow";
import { RootStackParamList } from "../../navigation/types";
import { useAuthUser } from "../../hooks/useAuthUser";
import { useUserProfile } from "../../hooks/useUserProfile";
import { seedDevData, seedPrompts } from "../../../firebase/seed";
import { logOut } from "../../../firebase/auth";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Bottom half of the profile screen. Scrollable within its own page
// (the vertical *paging* happens one level up in ProfileScreen — this
// inner ScrollView just handles overflow once settings content is
// taller than one screen).
export default function ProfileSettingsPage() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthUser();
  const { profile } = useUserProfile(user?.uid ?? null);
  const [preferences, setPreferences] = useState(mockProfile.settings.preferences);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedError, setSeedError] = useState<string | null>(null);
  const [isSeedingPrompts, setIsSeedingPrompts] = useState(false);
  const [promptSeedResult, setPromptSeedResult] = useState<string | null>(null);

  const togglePreference = (id: string) => {
    setPreferences((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)));
  };

  const handleSeedDevData = async () => {
    if (!user || isSeeding) return;
    setIsSeeding(true);
    setSeedError(null);
    try {
      const { circleId } = await seedDevData(user.uid);
      navigation.navigate("CircleDetail", { circleId });
    } catch (err) {
      setSeedError(err instanceof Error ? err.message : "Couldn't seed dev data.");
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSeedPrompts = async () => {
    if (isSeedingPrompts) return;
    setIsSeedingPrompts(true);
    setPromptSeedResult(null);
    try {
      const { created, skipped } = await seedPrompts();
      setPromptSeedResult(`done — ${created} added, ${skipped} already there`);
    } catch (err) {
      setPromptSeedResult(err instanceof Error ? err.message : "Couldn't seed prompts.");
    } finally {
      setIsSeedingPrompts(false);
    }
  };

  const handleLogOut = () => {
    void logOut();
  };

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={{ paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xxl }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>settings</Text>

      <Text style={styles.sectionLabel}>Account</Text>
      <SettingsFieldRow label="Display Name" value={profile?.displayName ?? "—"} />
      <SettingsFieldRow label="Email" value={user?.email ?? profile?.email ?? "—"} />
      <SettingsFieldRow label="Password" value="••••••••" />

      <Text style={[styles.sectionLabel, styles.sectionSpacing]}>Preferences</Text>
      {preferences.map((pref) => (
        <ToggleRow
          key={pref.id}
          label={pref.label}
          description={pref.description}
          value={pref.enabled}
          onValueChange={() => togglePreference(pref.id)}
        />
      ))}

      <Text style={[styles.sectionLabel, styles.sectionSpacing]}>Account Actions</Text>
      <ActionRow label="log out" onPress={handleLogOut} />
      <ActionRow label="delete account" variant="danger" onPress={() => {}} />

      {__DEV__ && (
        <>
          <Text style={[styles.sectionLabel, styles.sectionSpacing]}>Dev</Text>
          <ActionRow
            label={isSeeding ? "seeding…" : "seed dev data"}
            onPress={handleSeedDevData}
          />
          {seedError && <Text style={styles.seedError}>{seedError}</Text>}
          <ActionRow
            label={isSeedingPrompts ? "seeding prompts…" : "seed prompt bank"}
            onPress={handleSeedPrompts}
          />
          {promptSeedResult && <Text style={styles.seedResult}>{promptSeedResult}</Text>}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.paper, paddingHorizontal: spacing.lg },
  heading: { ...type.serifDisplay, fontSize: 34, color: colors.ink, marginBottom: spacing.lg },
  sectionLabel: { ...type.eyebrow, color: colors.muted, marginBottom: spacing.md },
  sectionSpacing: { marginTop: spacing.xl },
  seedError: { ...type.caption, color: colors.alert, marginTop: spacing.sm },
  seedResult: { ...type.caption, color: colors.muted, marginTop: spacing.sm },
});
