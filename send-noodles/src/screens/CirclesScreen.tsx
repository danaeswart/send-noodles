import { useEffect, useRef, useState } from "react";
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
  // "scrolled up" out from under the user). Clearing it in revealCircle
  // lets it rejoin the list once the user asks to see it.
  const [hiddenCircleId, setHiddenCircleId] = useState<string | null>(null);
  const circles = useMyCircles(userId).filter((circle) => circle.id !== hiddenCircleId);

  const pages: PageItem[] = [...circles.map((circle): PageItem => ({ kind: "circle", circle })), { kind: "create" }];

  // Scrolling to a given circle's page has two callers with different
  // feel: landing back here after CircleDetail should snap instantly (no
  // animation) to wherever that circle now sits, while "view circle" /
  // "join circle" on the create panel should visibly scroll up to reveal
  // the card that was just created/joined. Both share the same
  // find-index-and-scroll effect since the target circle may not be in
  // `pages` yet the moment the action fires — e.g. a just-joined circle
  // only appears once Firestore's subscription reports it — so this
  // re-runs whenever `pages` changes until the scroll actually lands.
  const flatListRef = useRef<FlatList<PageItem>>(null);
  const [pendingScroll, setPendingScroll] = useState<{ circleId: string; animated: boolean } | null>(null);

  useEffect(() => {
    if (!pendingScroll) return;
    const index = pages.findIndex((page) => page.kind === "circle" && page.circle.id === pendingScroll.circleId);
    if (index === -1) return;
    flatListRef.current?.scrollToIndex({ index, animated: pendingScroll.animated });
    setPendingScroll(null);
  }, [pendingScroll, pages]);

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
    setPendingScroll({ circleId, animated: false });
    navigation.navigate("CircleDetail", { circleId });
  };

  // "view circle" after creating one, and "join circle" after entering a
  // code, don't jump straight into CircleDetail — they reveal the
  // circle's own card in this deck (scrolling up to it) so the user sees
  // it join their list, and lands on CircleDetail only if they then tap
  // that card themselves.
  const revealCircle = (circleId: string) => {
    setHiddenCircleId(null);
    setPendingScroll({ circleId, animated: true });
  };

  const renderItem: ListRenderItem<PageItem> = ({ item, index }) => {
    if (item.kind === "create") {
      return (
        <CreateJoinCirclePanel
          userId={userId}
          pageHeight={pageHeight}
          onCircleCreated={setHiddenCircleId}
          onCircleReady={revealCircle}
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
        ref={flatListRef}
        data={pages}
        keyExtractor={(item) => (item.kind === "circle" ? item.circle.id : "__create__")}
        renderItem={renderItem}
        getItemLayout={(_, index) => ({ length: pageHeight, offset: pageHeight * index, index })}
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
