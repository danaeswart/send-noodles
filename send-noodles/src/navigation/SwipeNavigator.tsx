import { useState } from "react";
import PagerView from "react-native-pager-view";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import TeamsLobbyScreen from "../screens/TeamsLobbyScreen";
import GalleryWallScreen from "../screens/GalleryWallScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SquareMark from "../components/SquareMark";
import { colors } from "../constants/theme";

// The app's primary navigation model: three panels, one horizontal swipe
// container, no tab bar, no buttons. The square indicator at the bottom
// replaces a typical dot carousel with the deck's own grid-square motif.
export default function SwipeNavigator() {
  const [activeIndex, setActiveIndex] = useState(1); // starts on Gallery Wall
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <PagerView
        style={styles.pagerView}
        initialPage={1}
        orientation="horizontal"
        onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
      >
        <TeamsLobbyScreen key="lobby" />
        <GalleryWallScreen key="gallery" />
        <ProfileScreen key="profile" />
      </PagerView>

      <View style={[styles.indicator, { bottom: insets.bottom + 16 }]} pointerEvents="none">
        <SquareMark activeIndex={activeIndex} size={7} variant="onPaper" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pagerView: { flex: 1 },
  indicator: { position: "absolute", alignSelf: "center" },
});
