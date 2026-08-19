import { Dimensions, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { colors, spacing, type } from "../constants/theme";
import { useAuthUser } from "../hooks/useAuthUser";
import { useMemories } from "../hooks/useMemories";
import type { GallerySnap } from "../../firebase/snaps";
import { RootStackParamList } from "../navigation/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const COLUMNS = 3;
const GRID_GAP = spacing.sm;
const CELL_SIZE = (SCREEN_WIDTH - spacing.lg * 2 - GRID_GAP * (COLUMNS - 1)) / COLUMNS;

// Every snap the user has ever sent, in a 3-column grid — tapping one
// opens it full-size (MemoryDetail), from where it can be added to the
// Gallery Wall with a chosen frame.
export default function MemoriesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthUser();
  const memories = useMemories(user?.uid ?? null);

  const renderItem = ({ item, index }: { item: GallerySnap; index: number }) => (
    <Pressable
      onPress={() => navigation.navigate("MemoryDetail", { snapId: item.id })}
      style={[styles.cell, index % COLUMNS !== COLUMNS - 1 && { marginRight: GRID_GAP }]}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.cellImage} resizeMode="cover" />
      {item.onWall && (
        <View style={styles.onWallBadge}>
          <Text style={styles.onWallBadgeText}>on wall</Text>
        </View>
      )}
    </Pressable>
  );

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

      <Text style={styles.title}>memories</Text>

      {memories.length === 0 ? (
        <Text style={styles.empty}>send your first snap to start your memories</Text>
      ) : (
        <FlatList
          data={memories}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={COLUMNS}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper, paddingTop: spacing.xxl },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.lg, paddingHorizontal: spacing.lg },
  backButton: { marginRight: spacing.md },
  backText: { color: colors.ink, fontSize: 24 },
  headerTitleWrap: { flexDirection: "row", alignItems: "center" },
  headerEyebrow: { ...type.eyebrow, color: colors.muted, letterSpacing: 2 },
  headerAccentLine: { width: 24, height: 2, backgroundColor: colors.accent, marginLeft: spacing.sm },
  title: {
    ...type.display,
    color: colors.ink,
    fontSize: 34,
    fontWeight: "900",
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  empty: { ...type.body, color: colors.muted, paddingHorizontal: spacing.lg },
  gridContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  gridRow: { marginBottom: GRID_GAP },
  cell: { width: CELL_SIZE, height: CELL_SIZE, backgroundColor: colors.paperDim },
  cellImage: { width: "100%", height: "100%" },
  onWallBadge: {
    position: "absolute",
    left: 4,
    bottom: 4,
    backgroundColor: colors.ink,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  onWallBadgeText: { ...type.caption, color: colors.paper, fontSize: 9, textTransform: "uppercase", letterSpacing: 0.5 },
});
