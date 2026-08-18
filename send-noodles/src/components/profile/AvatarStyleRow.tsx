import { Image, Pressable, StyleSheet, View } from "react-native";
import { colors, spacing } from "../../constants/theme";
import { AVATAR_FACES } from "../../constants/avatarFaces";

type Props = {
  selectedId: string | null;
  onSelect: (id: string) => void;
};

// Real illustrated face icons (assets/profile-faces/faceN.png) the user
// picks as their profile avatar — selecting one persists it to their
// Firestore profile (see ProfileStatsPage) and immediately updates the
// big avatar next to their name.
export default function AvatarStyleRow({ selectedId, onSelect }: Props) {
  return (
    <View style={styles.row}>
      {AVATAR_FACES.map((face) => (
        <Pressable key={face.id} onPress={() => onSelect(face.id)} hitSlop={6}>
          <View style={[styles.circle, face.id === selectedId && styles.circleSelected]}>
            <Image source={face.source} style={styles.image} resizeMode="cover" />
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const CIRCLE_SIZE = 60;

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paperDim,
    overflow: "hidden",
  },
  circleSelected: { borderColor: colors.ink, borderWidth: 2 },
  image: { width: "100%", height: "100%" },
});
