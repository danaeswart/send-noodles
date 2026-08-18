import { StyleSheet, Text, View } from "react-native";

import MemberFace from "./MemberFace";
import { colors, spacing, type } from "../../constants/theme";
import { avatarForMember } from "../../utils/participants";
import type { UserProfile, WithId } from "../../../firebase/types";

type Props = {
  memberIds: string[];
  profiles: WithId<UserProfile>[];
  max?: number;
  size?: number;
};

export default function MemberFaceRow({ memberIds, profiles, max, size = 48 }: Props) {
  const visibleIds = max ? memberIds.slice(0, max) : memberIds;
  const overflowCount = max ? Math.max(0, memberIds.length - max) : 0;

  return (
    <View style={styles.row}>
      {visibleIds.map((memberId, i) => {
        const { source, initials } = avatarForMember(memberId, profiles);
        return (
          <MemberFace
            key={memberId}
            source={source}
            initials={initials}
            size={size}
            style={i > 0 ? styles.spacing : undefined}
          />
        );
      })}
      {overflowCount > 0 && <Text style={styles.overflow}>+{overflowCount}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", flexWrap: "wrap" },
  spacing: { marginLeft: spacing.sm },
  overflow: { ...type.caption, color: colors.muted, marginLeft: spacing.sm, marginTop: spacing.xs },
});
