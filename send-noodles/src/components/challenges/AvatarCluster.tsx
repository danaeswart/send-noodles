import { Image, View, Text, StyleSheet } from "react-native";
import { colors, type } from "../../constants/theme";
import { avatarForMember } from "../../utils/participants";
import type { UserProfile, WithId } from "../../../firebase/types";

type Props = {
  memberIds: string[];
  profiles: WithId<UserProfile>[];
  max?: number;
};

// Plain avatar images side by side next to the circle name (up to
// `max`, then a "+N" overflow count), resolving each member's chosen
// avatar face via avatarForMember (falls back to the default face
// while their profile hasn't loaded yet).
export default function AvatarCluster({ memberIds, profiles, max = 4 }: Props) {
  const visibleIds = memberIds.slice(0, max);
  const overflowCount = Math.max(0, memberIds.length - max);

  return (
    <View style={styles.row}>
      {visibleIds.map((memberId, i) => {
        const { source } = avatarForMember(memberId, profiles);
        return (
          <Image
            key={memberId}
            source={source}
            style={[styles.avatar, i > 0 && styles.spacing]}
            resizeMode="cover"
          />
        );
      })}
      {overflowCount > 0 && <Text style={styles.overflow}>+{overflowCount}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 48, height: 48 },
  spacing: { marginLeft: 10 },
  overflow: { ...type.caption, fontSize: 15, color: colors.alert, marginLeft: 10 },
});
