import { Dimensions, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { colors, spacing, type } from "../constants/theme";
import { useCircleSnaps } from "../hooks/useCircleSnaps";
import type { SnapDoc, WithId } from "../../firebase/types";
import { RootStackParamList } from "../navigation/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const COLUMNS = 3;
const GRID_GAP = spacing.sm;
const CELL_SIZE = (SCREEN_WIDTH - spacing.lg * 2 - GRID_GAP * (COLUMNS - 1)) / COLUMNS;

// Every snap ever sent to this circle, in a 3-column grid — same layout
// as the personal Memories screen. Tapping one opens the full-screen,
// swipeable CircleSnapDetail view.
export default function CircleSnapsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, "CircleSnaps">>();
  const { circleId, circleName } = route.params;
  const snaps = useCircleSnaps(circleId);

  const renderItem = ({ item, index }: { item: WithId<SnapDoc>; index: number }) => (
    <Pressable
      onPress={() => navigation.navigate("CircleSnapDetail", { circleId, snapId: item.id })}
      style={[styles.cell, index % COLUMNS !== COLUMNS - 1 && { marginRight: GRID_GAP }]}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.cellImage} resizeMode="cover" />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerEyebrow}>{circleName ?? "circle"}</Text>
          <View style={styles.headerAccentLine} />
        </View>
      </View>

      <Text style={styles.title}>snaps</Text>

      {snaps.length === 0 ? (
        <Text style={styles.empty}>no snaps sent to this circle yet</Text>
      ) : (
        <FlatList
          data={snaps}
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
});
