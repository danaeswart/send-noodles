import { useMemo } from "react";
import { Dimensions, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import PolaroidFrame from "../components/snap/PolaroidFrame";
import { colors, spacing, type } from "../constants/theme";
import { useAuthUser } from "../hooks/useAuthUser";
import { useMemories } from "../hooks/useMemories";
import type { GallerySnap } from "../../firebase/snaps";
import { RootStackParamList } from "../navigation/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Every snap the user has ever sent, across every circle — opens onto
// whichever one was tapped from the Memories grid (or a personal
// circle's "all snaps"), and swipes horizontally through the rest, same
// polaroid-plus-caption chrome as CircleSnapDetailScreen. "add to wall"
// hands off to ChooseFrame, which is where a snap actually gets placed
// on the Gallery Wall — shown per-slide since whether a snap is already
// on the wall varies snap to snap.
export default function MemoryDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, "MemoryDetail">>();
  const { user } = useAuthUser();
  const memories = useMemories(user?.uid ?? null);

  const initialIndex = useMemo(
    () => Math.max(0, memories.findIndex((m) => m.id === route.params.snapId)),
    [memories, route.params.snapId]
  );

  const renderItem = ({ item }: { item: GallerySnap }) => (
    <View style={styles.slide}>
      <PolaroidFrame footer={item.caption ? <Text style={styles.caption}>{item.caption}</Text> : undefined}>
        <Image source={{ uri: item.imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      </PolaroidFrame>

      {item.onWall ? (
        <Text style={styles.onWallText}>already on your wall</Text>
      ) : (
        <Pressable style={styles.addButton} onPress={() => navigation.navigate("ChooseFrame", { snapId: item.id })}>
          <Text style={styles.addButtonText}>add to wall</Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <View style={styles.page}>
      <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.closeButton}>
        <Text style={styles.closeText}>✕</Text>
      </Pressable>

      {memories.length > 0 && (
        <FlatList
          data={memories}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index })}
        />
      )}

      <Text style={styles.hint}>swipe to view all your snaps</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.paper, paddingTop: spacing.xxl },
  closeButton: { position: "absolute", top: spacing.xxl, right: spacing.lg, zIndex: 10, padding: spacing.xs },
  closeText: { color: colors.ink, fontSize: 22 },
  slide: { width: SCREEN_WIDTH, alignItems: "center", justifyContent: "center" },
  caption: { ...type.serifDisplay, fontSize: 17, color: colors.ink, textAlign: "center" },
  addButton: {
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
  hint: { ...type.eyebrow, color: colors.muted, textAlign: "center", paddingVertical: spacing.xl },
});
