import { useState } from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";

import { colors, spacing, type } from "../../constants/theme";
import { frameRewardForId } from "../../constants/frames";
import type { FrameUnlock } from "../../../firebase/types";
import FrameRewardModal from "../frames/FrameRewardModal";

type Props = {
  frameUnlocks: FrameUnlock[];
};

function formatUnlockDate(unlockedAt: FrameUnlock["unlockedAt"]) {
  return unlockedAt.toDate().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function FrameSwatches({ frameUnlocks }: Props) {
  const [selected, setSelected] = useState<FrameUnlock | null>(null);
  const selectedReward = selected ? frameRewardForId(selected.frameId) : null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Unlocked Frames</Text>
      {frameUnlocks.length === 0 ? (
        <Text style={styles.empty}>send your first snap to unlock one</Text>
      ) : (
        <View style={styles.row}>
          {frameUnlocks.map((unlock) => {
            const frame = frameRewardForId(unlock.frameId);
            return frame ? (
              <Pressable key={unlock.frameId} onPress={() => setSelected(unlock)}>
                <Image source={frame.source} style={styles.swatch} resizeMode="cover" />
              </Pressable>
            ) : (
              <View key={unlock.frameId} style={[styles.swatch, styles.unknownSwatch]} />
            );
          })}
        </View>
      )}

      {selected && selectedReward && (
        <FrameRewardModal
          visible
          onDismiss={() => setSelected(null)}
          frameSource={selectedReward.source}
          heading={`Unlocked ${formatUnlockDate(selected.unlockedAt)}`}
          message={selected.reason}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.lg },
  label: { ...type.eyebrow, color: colors.muted, marginBottom: spacing.sm },
  empty: { ...type.caption, color: colors.muted },
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  swatch: { width: 28, height: 28, borderWidth: 1, borderColor: colors.ink },
  unknownSwatch: { backgroundColor: colors.paperDim },
});
