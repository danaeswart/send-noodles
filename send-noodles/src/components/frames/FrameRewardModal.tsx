import { Image, ImageSourcePropType, Modal, Pressable, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, spacing, type } from "../../constants/theme";

type Props = {
  visible: boolean;
  onDismiss: () => void;
  frameSource: ImageSourcePropType;
  heading: string;
  message: string;
  // Optional extra line under the message — used by the unlock
  // celebration to point the user at where to actually go see the frame
  // in use (the profile detail view doesn't need this, since the user is
  // already there).
  footerNote?: string;
};

// Full-screen takeover for showing off one reward frame — used both for
// the "new frame unlocked!" celebration (see useFrameUnlockQueue, mounted
// in RootNavigator) and the profile page's per-frame detail view
// (FrameSwatches), just with a different heading/message. Same
// tap-anywhere-to-dismiss gesture as the account-deleted overlay in
// ProfileSettingsPage.
export default function FrameRewardModal({ visible, onDismiss, frameSource, heading, message, footerNote }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent onRequestClose={onDismiss}>
      <Pressable
        style={[styles.overlay, { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl }]}
        onPress={onDismiss}
      >
        <Text style={styles.heading}>{heading}</Text>
        <Image source={frameSource} style={styles.frame} resizeMode="contain" />
        <Text style={styles.message}>{message}</Text>
        {footerNote && <Text style={styles.footerNote}>{footerNote}</Text>}
        <Text style={styles.hint}>tap anywhere to dismiss</Text>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  heading: {
    ...type.serifDisplay,
    fontSize: 34,
    lineHeight: 38,
    color: colors.ink,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  frame: { width: 220, height: 220, marginBottom: spacing.xl },
  message: { ...type.body, color: colors.ink, textAlign: "center" },
  footerNote: { ...type.caption, color: colors.accent, textAlign: "center", marginTop: spacing.md },
  hint: {
    ...type.eyebrow,
    color: colors.muted,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: spacing.xxl,
    textAlign: "center",
  },
});
