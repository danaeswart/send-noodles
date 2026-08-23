import { useState } from "react";
import { Dimensions, FlatList, ListRenderItem, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";

import { colors, spacing, type } from "../constants/theme";
import { useAuthUser } from "../hooks/useAuthUser";
import { useHomeChallenges } from "../hooks/useHomeChallenges";
import ChallengeCard from "../components/challenges/ChallengeCard";
import type { HomeChallengeCard } from "../types/homeChallenge";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<HomeChallengeCard>);

type Props = {
  onLongPressCapture: (circleId: string) => void;
};

// Middle screen of the 5-page app — the daily challenge feed.
// TikTok-style vertical paging: one swipe snaps to the next/previous
// challenge rather than free scrolling. One card per circle the
// signed-in user belongs to, live from Firestore via useHomeChallenges.
export default function HomeChallenges({ onLongPressCapture }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollY = useSharedValue(0);

  const { user } = useAuthUser();
  const cards = useHomeChallenges(user?.uid ?? null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const onMomentumScrollEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.y / SCREEN_HEIGHT);
    setActiveIndex(index);
  };

  const renderItem: ListRenderItem<HomeChallengeCard> = ({ item, index }) => (
    <ChallengeCard
      card={item}
      index={index}
      isActive={index === activeIndex}
      isLast={index === cards.length - 1}
      scrollY={scrollY}
      onLongPressCapture={onLongPressCapture}
    />
  );

  if (cards.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text style={styles.emptyText}>Join or create a circle to see today's challenges here.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AnimatedFlatList
        data={cards}
        keyExtractor={(item) => item.circleId}
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SCREEN_HEIGHT}
        bounces={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumScrollEnd}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl },
  emptyText: { ...type.body, color: colors.muted, textAlign: "center" },
});
