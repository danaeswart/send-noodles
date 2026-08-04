import { useState } from "react";
import { ScrollView, Text, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, spacing, type } from "../../constants/theme";
import { mockProfile } from "../../data/mockProfile";
import SettingsFieldRow from "../../components/profile/SettingsFieldRow";
import ToggleRow from "../../components/profile/ToggleRow";
import ActionRow from "../../components/profile/ActionRow";
import AvatarStyleRow from "../../components/profile/AvatarStyleRow";

// Bottom half of the profile screen. Scrollable within its own page
// (the vertical *paging* happens one level up in ProfileScreen — this
// inner ScrollView just handles overflow once settings content is
// taller than one screen).
export default function ProfileSettingsPage() {
  const insets = useSafeAreaInsets();
  const [preferences, setPreferences] = useState(mockProfile.settings.preferences);

  const togglePreference = (id: string) => {
    setPreferences((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)));
  };

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={{ paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xxl }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>settings</Text>

      <Text style={styles.sectionLabel}>Account</Text>
      {mockProfile.settings.account.map((field) => (
        <SettingsFieldRow key={field.id} label={field.label} value={field.value} />
      ))}

      <Text style={[styles.sectionLabel, styles.sectionSpacing]}>Profile</Text>
      <Text style={styles.subLabel}>Avatar Style</Text>
      <View style={styles.avatarRowWrap}>
        <AvatarStyleRow count={mockProfile.settings.avatarStyleCount} />
      </View>
      <SettingsFieldRow
        label={mockProfile.settings.displayName.label}
        value={mockProfile.settings.displayName.value}
      />

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
      <ActionRow label="log out" onPress={() => {}} />
      <ActionRow label="delete account" variant="danger" onPress={() => {}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.paper, paddingHorizontal: spacing.lg },
  heading: { ...type.serifDisplay, fontSize: 34, color: colors.ink, marginBottom: spacing.lg },
  sectionLabel: { ...type.eyebrow, color: colors.muted, marginBottom: spacing.md },
  sectionSpacing: { marginTop: spacing.xl },
  subLabel: { ...type.eyebrow, fontSize: 10, color: colors.muted, marginBottom: spacing.sm },
  avatarRowWrap: { marginBottom: spacing.lg },
});
