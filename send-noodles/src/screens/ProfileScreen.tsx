import { useState } from "react";
import { Dimensions, FlatList, StyleSheet, View } from "react-native";

import { colors } from "../constants/theme";
import ProfileStatsPage from "./profile/ProfileStatsPage";
import ProfileSettingsPage from "./profile/ProfileSettingsPage";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Panel 4 of 5 in the horizontal swipe deck. Internally uses the same
// TikTok-style vertical paging as HomeChallenges: stats view on top,
// settings view beneath, one swipe snaps between them. Two nested
// gesture directions (outer horizontal deck, inner vertical page) don't
// conflict since PagerView only claims horizontal pans.
const PAGES = ["stats", "settings"] as const;

export default function ProfileScreen() {
  const [activeIndex, setActiveIndex] = useState(0);

  const onMomentumScrollEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.y / SCREEN_HEIGHT);
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={PAGES}
        keyExtractor={(item) => item}
        renderItem={({ item, index }) =>
          item === "stats" ? (
            <View style={{ height: SCREEN_HEIGHT }}>
              <ProfileStatsPage isActive={index === activeIndex} />
            </View>
          ) : (
            <View style={{ height: SCREEN_HEIGHT }}>
              <ProfileSettingsPage />
            </View>
          )
        }
        pagingEnabled
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SCREEN_HEIGHT}
        bounces={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
});
