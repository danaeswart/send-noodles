import { useState } from "react";
import { Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { colors, spacing, type } from "../constants/theme";
import { useAuthUser } from "../hooks/useAuthUser";
import { useMemories } from "../hooks/useMemories";
import { useUserProfile } from "../hooks/useUserProfile";
import { FRAME_REWARDS, frameRewardForId, type RewardFrameId } from "../constants/frames";
import FramedPhoto from "../components/gallery/FramedPhoto";
import { addSnapToWall } from "../../firebase/snaps";
import { RootStackParamList } from "../navigation/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PREVIEW_SIZE = SCREEN_WIDTH - spacing.lg * 2;
const SWATCH_SIZE = 64;

// Second half of the "add to wall" flow: pick one of the user's
// unlocked frames, see it previewed live on the actual photo (frame
// art stacked directly on top of the image, same as FramedPhoto does
// on the wall itself), then confirm.
export default function ChooseFrameScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, "ChooseFrame">>();
  const { user } = useAuthUser();
  const memories = useMemories(user?.uid ?? null);
  const { profile } = useUserProfile(user?.uid ?? null);
  const snap = memories.find((m) => m.id === route.params.snapId);

  const unlockedFrameIds = (profile?.frameUnlocks ?? [])
    .map((unlock) => unlock.frameId)
    .filter((id): id is RewardFrameId => !!frameRewardForId(id));

  const [selectedFrame, setSelectedFrame] = useState<RewardFrameId | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!snap || !selectedFrame || isSaving) return;
    setIsSaving(true);
    setError(null);
    try {
      await addSnapToWall(snap.ref, selectedFrame);
      navigation.popToTop();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add that to your wall.");
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerEyebrow}>gallery wall</Text>
          <View style={styles.headerAccentLine} />
        </View>
      </View>

      <Text style={styles.title}>choose a frame</Text>

      {snap && (
        <View style={styles.previewWrap}>
          {selectedFrame ? (
            <FramedPhoto frame={selectedFrame} photo={{ uri: snap.imageUrl }} size={PREVIEW_SIZE} />
          ) : (
            <Image source={{ uri: snap.imageUrl }} style={styles.plainPreview} resizeMode="cover" />
          )}
        </View>
      )}

      {unlockedFrameIds.length === 0 ? (
        <Text style={styles.empty}>send more snaps to unlock a frame</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.swatchRow}>
          {unlockedFrameIds.map((id) => {
            const frame = FRAME_REWARDS[id];
            const selected = selectedFrame === id;
            return (
              <Pressable key={id} onPress={() => setSelectedFrame(id)} style={styles.swatchWrap}>
                <Image
                  source={frame.source}
                  style={[styles.swatch, selected && styles.swatchSelected]}
                  resizeMode="cover"
                />
                <Text style={styles.swatchLabel}>{frame.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      {selectedFrame && (
        <Pressable style={styles.confirmButton} onPress={handleConfirm} disabled={isSaving}>
          <Text style={styles.confirmButtonText}>{isSaving ? "adding…" : "add to wall"}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper, paddingTop: spacing.xxl, paddingHorizontal: spacing.lg },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.lg },
  backButton: { marginRight: spacing.md },
  backText: { color: colors.ink, fontSize: 24 },
  headerTitleWrap: { flexDirection: "row", alignItems: "center" },
  headerEyebrow: { ...type.eyebrow, color: colors.muted, letterSpacing: 2 },
  headerAccentLine: { width: 24, height: 2, backgroundColor: colors.accent, marginLeft: spacing.sm },
  title: { ...type.display, color: colors.ink, fontSize: 30, fontWeight: "900", marginBottom: spacing.lg },
  previewWrap: { alignSelf: "center", marginBottom: spacing.xl },
  plainPreview: { width: PREVIEW_SIZE, height: PREVIEW_SIZE, backgroundColor: colors.paperDim },
  empty: { ...type.body, color: colors.muted },
  swatchRow: { gap: spacing.md, paddingVertical: spacing.xs },
  swatchWrap: { alignItems: "center", gap: spacing.xs },
  swatch: { width: SWATCH_SIZE, height: SWATCH_SIZE, borderWidth: 2, borderColor: "transparent" },
  swatchSelected: { borderColor: colors.accent },
  swatchLabel: { ...type.caption, color: colors.muted, fontSize: 10, textTransform: "lowercase" },
  errorText: { ...type.caption, color: colors.alert, marginTop: spacing.md },
  confirmButton: {
    alignSelf: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  confirmButtonText: { ...type.eyebrow, color: colors.paper, letterSpacing: 2 },
});
