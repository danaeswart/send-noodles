import { useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, spacing, type } from "../../constants/theme";
import { mockProfile } from "../../data/mockProfile";
import SettingsFieldRow from "../../components/profile/SettingsFieldRow";
import ToggleRow from "../../components/profile/ToggleRow";
import ActionRow from "../../components/profile/ActionRow";
import { useAuthUser } from "../../hooks/useAuthUser";
import { useUserProfile } from "../../hooks/useUserProfile";
import {
  deleteAccountData,
  finalizeAccountDeletion,
  logOut,
  updateAccountPassword,
  updateDisplayName,
  updateEmailAddress,
} from "../../../firebase/auth";

// How long the "your account has been deleted" takeover stays up
// before the Auth account is actually deleted (which signs the user
// out and hands off to the login screen).
const DELETE_SUCCESS_DISPLAY_MS = 2500;

// Bottom half of the profile screen. Scrollable within its own page
// (the vertical *paging* happens one level up in ProfileScreen — this
// inner ScrollView just handles overflow once settings content is
// taller than one screen).
export default function ProfileSettingsPage() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthUser();
  const { profile } = useUserProfile(user?.uid ?? null);
  const [preferences, setPreferences] = useState(mockProfile.settings.preferences);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  // Account fields edit as one group: clicking Edit on any of the three
  // rows below drops all of them into edit mode together, replacing
  // their individual triggers with a single Cancel/Save pair up in the
  // "Account" section header instead of a save button per row.
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [emailDraft, setEmailDraft] = useState("");
  const [passwordDraft, setPasswordDraft] = useState("");

  const togglePreference = (id: string) => {
    setPreferences((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)));
  };

  const handleLogOut = () => {
    void logOut();
  };

  const startEditingAccount = () => {
    setNameDraft(profile?.displayName ?? "");
    setEmailDraft(profile?.email ?? user?.email ?? "");
    // Password always starts blank — editing means typing a fresh one,
    // never seeing (or re-submitting) the current one.
    setPasswordDraft("");
    setAccountError(null);
    setIsEditingAccount(true);
  };

  const cancelEditingAccount = () => {
    setIsEditingAccount(false);
    setAccountError(null);
  };

  const saveAccountEdits = async () => {
    if (!user) return;
    setIsSavingAccount(true);
    setAccountError(null);
    try {
      const trimmedName = nameDraft.trim();
      if (trimmedName && trimmedName !== profile?.displayName) {
        await updateDisplayName(user.uid, trimmedName);
      }
      const trimmedEmail = emailDraft.trim();
      const currentEmail = profile?.email ?? user.email ?? "";
      if (trimmedEmail && trimmedEmail !== currentEmail) {
        await updateEmailAddress(user.uid, trimmedEmail);
      }
      if (passwordDraft) {
        await updateAccountPassword(passwordDraft);
      }
      setIsEditingAccount(false);
    } catch (err) {
      const message =
        err instanceof Error && err.message.includes("requires-recent-login")
          ? "for your security, log out and back in, then try again."
          : err instanceof Error
            ? err.message
            : "couldn't save your changes.";
      setAccountError(message);
    } finally {
      setIsSavingAccount(false);
    }
  };

  const describeDeleteError = (err: unknown): string =>
    err instanceof Error && err.message.includes("requires-recent-login")
      ? "for your security, log out and back in, then try deleting again."
      : err instanceof Error
        ? err.message
        : "couldn't delete your account.";

  const handleDeleteAccount = () => {
    if (isDeleting) return;
    Alert.alert(
      "leaving so soon?",
      "deleting your account wipes it for good — every snap you've ever sent, memories, gallery wall, all of it. no take-backs.",
      [
        { text: "never mind", style: "cancel" },
        {
          text: "delete it all",
          style: "destructive",
          onPress: () => {
            setIsDeleting(true);
            setDeleteError(null);
            deleteAccountData()
              .then(() => {
                setShowDeleteSuccess(true);
                setTimeout(() => {
                  finalizeAccountDeletion()
                    .catch((err) => {
                      // The account's data is already gone at this point
                      // either way — if deleting the Auth account itself
                      // failed (e.g. a stale session), log it for
                      // debugging but still sign out below, so the
                      // "Chow Amigo" message always ends at the login
                      // screen instead of stranding the user back on a
                      // now-empty profile page.
                      console.warn("Couldn't finish deleting the Auth account:", err);
                    })
                    .finally(() => {
                      void logOut();
                    });
                }, DELETE_SUCCESS_DISPLAY_MS);
              })
              .catch((err) => {
                setDeleteError(describeDeleteError(err));
                setIsDeleting(false);
              });
          },
        },
      ]
    );
  };

  return (
    <>
      <ScrollView
        style={styles.page}
        contentContainerStyle={{ paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>settings</Text>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>Account</Text>
          {isEditingAccount && (
            <View style={styles.accountEditActions}>
              <Pressable onPress={cancelEditingAccount} hitSlop={8} disabled={isSavingAccount}>
                <Text style={styles.cancelAction}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={saveAccountEdits}
                hitSlop={8}
                disabled={isSavingAccount}
                style={styles.saveAction}
              >
                {isSavingAccount ? (
                  <ActivityIndicator size="small" color={colors.paper} />
                ) : (
                  <Text style={styles.saveActionText}>Save</Text>
                )}
              </Pressable>
            </View>
          )}
        </View>
        <SettingsFieldRow
          label="Display Name"
          value={profile?.displayName ?? "—"}
          isEditing={isEditingAccount}
          draftValue={nameDraft}
          onChangeDraft={setNameDraft}
          onStartEdit={startEditingAccount}
        />
        <SettingsFieldRow
          label="Email"
          value={profile?.email ?? user?.email ?? "—"}
          isEditing={isEditingAccount}
          draftValue={emailDraft}
          onChangeDraft={setEmailDraft}
          onStartEdit={startEditingAccount}
          keyboardType="email-address"
        />
        <SettingsFieldRow
          label="Password"
          value="••••••••"
          isEditing={isEditingAccount}
          draftValue={passwordDraft}
          onChangeDraft={setPasswordDraft}
          onStartEdit={startEditingAccount}
          secureTextEntry
          placeholder="new password"
        />
        {accountError && <Text style={styles.deleteError}>{accountError}</Text>}

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

        <Text style={[styles.sectionLabel, styles.sectionSpacing]}>No-No Zone</Text>
        <ActionRow label="log out" onPress={handleLogOut} />
        <ActionRow
          label={isDeleting ? "deleting…" : "delete account"}
          variant="danger"
          onPress={handleDeleteAccount}
        />
        {deleteError && <Text style={styles.deleteError}>{deleteError}</Text>}
      </ScrollView>

      <Modal visible={showDeleteSuccess} animationType="fade" statusBarTranslucent>
        <View style={styles.deleteSuccessOverlay}>
          <Text style={styles.deleteSuccessHeadline}>Chow Amigo</Text>
          <Text style={styles.deleteSuccessSubtext}>your account has been deleted</Text>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.paper, paddingHorizontal: spacing.lg },
  heading: { ...type.serifDisplay, fontSize: 34, color: colors.ink, marginBottom: spacing.lg },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionLabel: { ...type.eyebrow, color: colors.muted, marginBottom: spacing.md },
  sectionSpacing: { marginTop: spacing.xl },
  accountEditActions: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  cancelAction: { ...type.caption, letterSpacing: 1, color: colors.muted, textTransform: "uppercase" },
  saveAction: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
  },
  saveActionText: { ...type.caption, fontSize: 13, letterSpacing: 1, color: colors.paper, textTransform: "uppercase" },
  deleteError: { ...type.caption, color: colors.alert, marginTop: spacing.sm },
  deleteSuccessOverlay: {
    flex: 1,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  deleteSuccessHeadline: { ...type.serifDisplay, fontSize: 56, color: colors.ink, textAlign: "center" },
  deleteSuccessSubtext: {
    ...type.body,
    fontSize: 18,
    color: colors.muted,
    textAlign: "center",
    marginTop: spacing.md,
  },
});
