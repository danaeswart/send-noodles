import { useState } from "react";
import PagerView from "react-native-pager-view";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSharedValue } from "react-native-reanimated";

import GalleryWallScreen from "../screens/GalleryWallScreen";
import CirclesScreen from "../screens/CirclesScreen";
import HomeChallenges from "../screens/HomeChallenges";
import SnapReviewScreen from "../screens/SnapReviewScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SquareMark from "../components/SquareMark";
import TopSwipeNavigator from "../components/TopSwipeNavigator";
import { colors } from "../constants/theme";

// The app's primary navigation model: 5 panels, one horizontal swipe
// container, no tab bar, no buttons.
// Order: Gallery Wall — Circles — Home Challenges — Snap — Profile,
// with Home Challenges as the default landing panel (index 2).
//
// HomeChallenges manages its own vertical TikTok-style paging inside
// this horizontal deck — the two gesture directions don't conflict
// since PagerView only claims horizontal pans.
export default function SwipeNavigator() {
  const [activeIndex, setActiveIndex] = useState(2);
  const insets = useSafeAreaInsets();
  const scrollPosition = useSharedValue(2);

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <PagerView
        style={styles.pagerView}
        initialPage={2}
        orientation="horizontal"
        onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        onPageScroll={(e) => {
          scrollPosition.value = e.nativeEvent.position + e.nativeEvent.offset;
        }}
      >
        <GalleryWallScreen key="gallery" />
        <CirclesScreen key="circles" />
        <HomeChallenges key="home" />
        <SnapReviewScreen key="snap" />
        <ProfileScreen key="profile" />
      </PagerView>

      <TopSwipeNavigator activeIndex={activeIndex} scrollPosition={scrollPosition} topInset={insets.top} />
    </View>
  );
}

const styles = StyleSheet.create({
  pagerView: { flex: 1 },
});
