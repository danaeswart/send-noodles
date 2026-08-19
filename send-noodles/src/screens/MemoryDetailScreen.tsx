import { Dimensions, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { colors, spacing, type } from "../constants/theme";
import { useAuthUser } from "../hooks/useAuthUser";
import { useMemories } from "../hooks/useMemories";
import { RootStackParamList } from "../navigation/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_SIZE = SCREEN_WIDTH - spacing.lg * 2;

// One snap, full-size — the X returns to the Memories grid. "add to
// wall" hands off to ChooseFrame, which is where the snap actually
// gets placed on the Gallery Wall.
export default function MemoryDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, "MemoryDetail">>();
  const { user } = useAuthUser();
  const memories = useMemories(user?.uid ?? null);
  const snap = memories.find((m) => m.id === route.params.snapId);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View />
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>

      {snap && (
        <>
          <View style={styles.imageWrap}>
            <Image source={{ uri: snap.imageUrl }} style={styles.image} resizeMode="cover" />
          </View>

          {snap.onWall ? (
            <Text style={styles.onWallText}>already on your wall</Text>
          ) : (
            <Pressable
              style={styles.addButton}
              onPress={() => navigation.navigate("ChooseFrame", { snapId: snap.id })}
            >
              <Text style={styles.addButtonText}>add to wall</Text>
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ink, paddingTop: spacing.xxl, paddingHorizontal: spacing.lg },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xl },
  closeButton: { padding: spacing.xs },
  closeText: { color: colors.paper, fontSize: 20 },
  imageWrap: { alignSelf: "center" },
  image: { width: IMAGE_SIZE, height: IMAGE_SIZE, backgroundColor: colors.paperDim },
  addButton: {
    alignSelf: "center",
    marginTop: spacing.xl,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  addButtonText: { ...type.eyebrow, color: colors.paper, letterSpacing: 2 },
  onWallText: {
    ...type.caption,
    color: colors.muted,
    textAlign: "center",
    marginTop: spacing.xl,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
