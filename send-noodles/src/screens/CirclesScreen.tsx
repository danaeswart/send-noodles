import { useState } from "react";
import { Dimensions, FlatList, LayoutChangeEvent, ListRenderItem, StyleSheet, View } from "react-native";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import CircleCard from "../components/circles/CircleCard";
import CreateJoinCirclePanel from "../components/circles/CreateJoinCirclePanel";
import { colors } from "../constants/theme";
import { useAuthUser } from "../hooks/useAuthUser";
import { useMyCircles } from "../hooks/useMyCircles";
import type { CircleDoc, WithId } from "../../firebase/types";
import { RootStackParamList } from "../navigation/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type PageItem = { kind: "circle"; circle: WithId<CircleDoc> } | { kind: "create" };

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<PageItem>);

// No per-circle theming exists yet, so pages cycle through a small fixed
// palette by position — deterministic (not random) so a circle's color
// doesn't change across re-renders.
const CIRCLE_COLORS = [colors.accent, colors.alert, "#C9B79C"];

export default function CirclesScreen() {
  const [, setActiveIndex] = useState(0);
  // Measured from the container's actual onLayout rather than assumed
  // from Dimensions.get("window") — nested inside the horizontal
  // PagerView deck, the FlatList's real rendered height can differ
  // slightly from raw window dimensions (status bar/notch handling), and
  // that drift compounds page over page until the last page ends up just
  // out of scroll range. Falls back to Dimensions until the first layout
  // fires (effectively immediate) so the initial render still has a
  // sensible page size.
  const [pageHeight, setPageHeight] = useState(() => Dimensions.get("window").height);
  const onContainerLayout = (e: LayoutChangeEvent) => {
    const height = e.nativeEvent.layout.height;
    if (height > 0 && height !== pageHeight) setPageHeight(height);
  };
  const scrollY = useSharedValue(0);
  const navigation = useNavigation<NavigationProp>();

  const { user } = useAuthUser();
  const userId = user?.uid ?? null;

  // A freshly-created circle is filtered back out of the live list while
  // its "code ready" panel is showing — otherwise the moment Firestore's
  // subscription reports it, it gets inserted before the create page,
  // shifting that page to a new index and making the fixed-pixel scroll
  // offset land on the new circle's page instead (looks like the deck
  // "scrolled up" out from under the user). Clearing it in goToCircle
  // lets it rejoin the list once they've navigated away.
  const [hiddenCircleId, setHiddenCircleId] = useState<string | null>(null);
  const circles = useMyCircles(userId).filter((circle) => circle.id !== hiddenCircleId);

  const pages: PageItem[] = [...circles.map((circle): PageItem => ({ kind: "circle", circle })), { kind: "create" }];

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const onMomentumScrollEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.y / pageHeight);
    setActiveIndex(index);
  };

  const goToCircle = (circleId: string) => {
    setHiddenCircleId(null);
    navigation.navigate("CircleDetail", { circleId });
  };

  const renderItem: ListRenderItem<PageItem> = ({ item, index }) => {
    if (item.kind === "create") {
      return (
        <CreateJoinCirclePanel
          userId={userId}
          pageHeight={pageHeight}
          onCircleCreated={setHiddenCircleId}
          onCircleReady={goToCircle}
        />
      );
    }

    const { circle } = item;
    const isLastCircle = index === circles.length - 1;
    const color = CIRCLE_COLORS[index % CIRCLE_COLORS.length];

    return (
      <CircleCard
        circle={circle}
        color={color}
        isLastCircle={isLastCircle}
        pageHeight={pageHeight}
        onPress={() => goToCircle(circle.id)}
      />
    );
  };

  return (
    <View style={styles.container} onLayout={onContainerLayout}>
      <AnimatedFlatList
        data={pages}
        keyExtractor={(item) => (item.kind === "circle" ? item.circle.id : "__create__")}
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={pageHeight}
        bounces={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumScrollEnd}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
});
