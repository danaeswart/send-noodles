import { useState } from "react";
import { Dimensions, FlatList, ListRenderItem, StyleSheet, View } from "react-native";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";

import { colors } from "../constants/theme";
import { mockChallenges, Challenge } from "../data/mockChallenges";
import ChallengeCard from "../components/challenges/ChallengeCard";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Challenge>);

// Middle screen of the 5-page app — the daily challenge feed.
// TikTok-style vertical paging: one swipe snaps to the next/previous
// challenge rather than free scrolling. Data currently comes from
// mockChallenges; swap for a live Firestore query keyed on the user's
// circle memberships once the backend exists — ChallengeCard's props
// contract stays identical either way, so that swap should be additive
// rather than a rewrite.
export default function HomeChallenges() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const onMomentumScrollEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.y / SCREEN_HEIGHT);
    setActiveIndex(index);
  };

  const renderItem: ListRenderItem<Challenge> = ({ item, index }) => (
    <ChallengeCard
      challenge={item}
      index={index}
      isActive={index === activeIndex}
      isLast={index === mockChallenges.length - 1}
      scrollY={scrollY}
    />
  );

  return (
    <View style={styles.container}>
      <AnimatedFlatList
        data={mockChallenges}
        keyExtractor={(item) => item.id}
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
});
