import { useEffect, useRef, useState } from "react";
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
import { useOnboarding } from "../onboarding/OnboardingContext";

const SNAP_PAGE_INDEX = 3;

// The app's primary navigation model: 5 panels, one horizontal swipe
// container, no tab bar, no buttons.
// Order: Gallery Wall — Circles — Home Challenges — Snap — Profile,
// with Home Challenges as the default landing panel (index 2).
//
// HomeChallenges manages its own vertical TikTok-style paging inside
// this horizontal deck — the two gesture directions don't conflict
// since PagerView only claims horizontal pans.
//
// Pressing and holding a challenge card on Home animates the pager
// straight to the Snap panel and carries along which circle was held,
// via preselectedCircleId, so SnapReviewScreen's circle dropdown opens
// already set to it — the two screens are pager siblings, not stack
// screens, so this state has to live up here rather than being passed
// as a navigation param.
export default function SwipeNavigator() {
  const [activeIndex, setActiveIndex] = useState(2);
  const [preselectedCircleId, setPreselectedCircleId] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const scrollPosition = useSharedValue(2);
  const pagerRef = useRef<PagerView>(null);
  const onboarding = useOnboarding();

  const handleLongPressCapture = (circleId: string) => {
    setPreselectedCircleId(circleId);
    pagerRef.current?.setPage(SNAP_PAGE_INDEX);
  };

  // The tour drives its own panel changes (see OnboardingContext.start /
  // advance) rather than relying on the user swiping — every step
  // transition, including the very first one, arrives here as a jump
  // request. Still an animated pager.setPage transition, not a hard cut.
  useEffect(() => {
    if (onboarding.panelJumpRequest === null) return;
    pagerRef.current?.setPage(onboarding.panelJumpRequest);
    onboarding.clearPanelJumpRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboarding.panelJumpRequest]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={2}
        orientation="horizontal"
        // Locked to the tour's own "Next" button while it's running, so
        // the popup and the panel it's describing can't drift out of
        // sync with a stray swipe.
        scrollEnabled={!onboarding.active}
        onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        onPageScroll={(e) => {
          scrollPosition.value = e.nativeEvent.position + e.nativeEvent.offset;
        }}
      >
        <GalleryWallScreen key="gallery" />
        <CirclesScreen key="circles" />
        <HomeChallenges key="home" onLongPressCapture={handleLongPressCapture} />
        <SnapReviewScreen
          key="snap"
          preselectedCircleId={preselectedCircleId}
          onConsumePreselectedCircle={() => setPreselectedCircleId(null)}
        />
        <ProfileScreen key="profile" />
      </PagerView>

      <TopSwipeNavigator activeIndex={activeIndex} scrollPosition={scrollPosition} topInset={insets.top} />
    </View>
  );
}

const styles = StyleSheet.create({
  pagerView: { flex: 1 },
});
