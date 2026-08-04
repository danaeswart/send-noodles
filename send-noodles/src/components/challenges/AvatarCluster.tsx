import { View, Text, StyleSheet } from "react-native";
import { colors, type } from "../../constants/theme";
import type { ChallengeParticipant } from "../../data/mockChallenges";

type Props = {
  participants: ChallengeParticipant[];
  overflowCount: number;
};

// Overlapping initials circles, matching the small avatar stack next to
// the circle name in the design. Swap the initials fill for real profile
// photos once avatar uploads exist — layout stays the same.
export default function AvatarCluster({ participants, overflowCount }: Props) {
  return (
    <View style={styles.row}>
      {participants.map((p, i) => (
        <View key={p.id} style={[styles.avatar, i > 0 && styles.overlap]}>
          <Text style={styles.initials}>{p.initials.slice(0, 2)}</Text>
        </View>
      ))}
      {overflowCount > 0 && <Text style={styles.overflow}>+{overflowCount}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.ink,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
  },
  overlap: { marginLeft: -10 },
  initials: { ...type.caption, fontSize: 9, color: colors.ink },
  overflow: { ...type.caption, color: colors.alert, marginLeft: 6 },
});
