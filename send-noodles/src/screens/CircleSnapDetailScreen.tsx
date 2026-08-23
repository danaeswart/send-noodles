import { useMemo } from "react";
import { Dimensions, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import PolaroidFrame from "../components/snap/PolaroidFrame";
import { colors, spacing, type } from "../constants/theme";
import { useCircleSnaps } from "../hooks/useCircleSnaps";
import type { SnapDoc, WithId } from "../../firebase/types";
import { RootStackParamList } from "../navigation/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// One circle snap, full-screen, in the same polaroid chrome used on the
// send flow — with its caption underneath, if it has one. Opens onto
// whichever snap was tapped from CircleSnapsScreen, and swipes
// horizontally through every other snap sent to the circle.
export default function CircleSnapDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, "CircleSnapDetail">>();
  const { circleId, snapId } = route.params;
  const snaps = useCircleSnaps(circleId);

  const initialIndex = useMemo(() => Math.max(0, snaps.findIndex((s) => s.id === snapId)), [snaps, snapId]);

  const renderItem = ({ item }: { item: WithId<SnapDoc> }) => (
    <View style={styles.slide}>
      <PolaroidFrame footer={item.caption ? <Text style={styles.caption}>{item.caption}</Text> : undefined}>
        <Image source={{ uri: item.imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      </PolaroidFrame>
    </View>
  );

  return (
    <View style={styles.page}>
      <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.closeButton}>
        <Text style={styles.closeText}>✕</Text>
      </Pressable>

      {snaps.length > 0 && (
        <FlatList
          data={snaps}
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

      <Text style={styles.hint}>swipe to view all snaps</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.paper, paddingTop: spacing.xxl },
  closeButton: { position: "absolute", top: spacing.xxl, right: spacing.lg, zIndex: 10, padding: spacing.xs },
  closeText: { color: colors.ink, fontSize: 22 },
  slide: { width: SCREEN_WIDTH, alignItems: "center", justifyContent: "center" },
  caption: { ...type.serifDisplay, fontSize: 17, color: colors.ink, textAlign: "center" },
  hint: { ...type.eyebrow, color: colors.muted, textAlign: "center", paddingVertical: spacing.xl },
});
