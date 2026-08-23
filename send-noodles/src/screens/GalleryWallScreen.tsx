import { useCallback, useState } from "react";
import { Alert, Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import Animated, { useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from "react-native-reanimated";

import WallFrame, { WallPhotoPatch } from "../components/gallery/WallFrame";
import { WALL_SCROLL_LENGTH } from "../data/wallLayout";
import { WALL_ROTATE_DEG } from "../utils/wallRotation";
import { useAuthUser } from "../hooks/useAuthUser";
import { useGalleryWall } from "../hooks/useGalleryWall";
import { RootStackParamList } from "../navigation/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// A box authored at (w0 x h0) and rotated 90deg has a swapped (h0 x w0)
// footprint. This offset re-centers it so that footprint lands exactly
// on a parent box of size (h0 x w0), with no gap or clipping.
function rotatedOffset(w0: number, h0: number) {
  return { left: (h0 - w0) / 2, top: (w0 - h0) / 2 };
}

// Fixed chrome (title, swipe hint) covers exactly one screen and never
// scrolls.
const chromeOffset = rotatedOffset(SCREEN_HEIGHT, SCREEN_WIDTH);

// The scrollable canvas is one long strip, WALL_SCROLL_LENGTH deep, that
// becomes the vertical scroll length once rotated.
const canvasOffset = rotatedOffset(WALL_SCROLL_LENGTH, SCREEN_WIDTH);

export default function GalleryWallScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthUser();
  const { wallPhotos, updatePosition, removeFromWall } = useGalleryWall(user?.uid ?? null);
  const [isEditing, setIsEditing] = useState(false);
  const scrollY = useSharedValue(0);

  const handleEnterEdit = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsEditing(true);
  }, []);

  const handleCommit = useCallback(
    (id: string, patch: WallPhotoPatch) => {
      void updatePosition(id, patch);
    },
    [updatePosition]
  );

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert(
        "Remove from wall?",
        "This photo will stay in your Memories, just not on the wall.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Remove", style: "destructive", onPress: () => void removeFromWall(id) },
        ]
      );
    },
    [removeFromWall]
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // The Memories tag needs to both scroll with the wall *and* render
  // above the fixed title/hint chrome — those can't both be true if it
  // lives inside the ScrollView (whatever's in there paints below the
  // fixed chrome layer, regardless of its own zIndex). Instead it's its
  // own top-most overlay, manually kept in sync with scroll position.
  const memoryScrollStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -scrollY.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        style={styles.scrollView}
        scrollEnabled={!isEditing}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ width: SCREEN_WIDTH, height: WALL_SCROLL_LENGTH }}
      >
        <View
          style={[
            styles.rotatedCanvas,
            {
              width: WALL_SCROLL_LENGTH,
              height: SCREEN_WIDTH,
              left: canvasOffset.left,
              top: canvasOffset.top,
              transform: [{ rotate: `${WALL_ROTATE_DEG}deg` }],
            },
          ]}
        >
          {isEditing && (
            <Pressable
              style={styles.editDismissLayer}
              onPress={() => setIsEditing(false)}
            />
          )}

          {wallPhotos.map((photo) => (
            <WallFrame
              key={photo.id}
              photo={photo}
              screenWidth={SCREEN_WIDTH}
              editing={isEditing}
              onEnterEdit={handleEnterEdit}
              onCommit={handleCommit}
              onDelete={handleDelete}
            />
          ))}
        </View>
      </Animated.ScrollView>

      <View style={styles.chromeLayer} pointerEvents="box-none">
        <View
          pointerEvents="box-none"
          style={[
            styles.rotatedCanvas,
            {
              width: SCREEN_HEIGHT,
              height: SCREEN_WIDTH,
              left: chromeOffset.left,
              top: chromeOffset.top,
              transform: [{ rotate: `${WALL_ROTATE_DEG}deg` }],
            },
          ]}
        >
          <Text style={[styles.wallTitle, { left: insets.top + 20 }]}>the wall</Text>

          <View style={styles.bottomBar}>
            <Text style={styles.bottomBarText}>swipe to see more →</Text>
          </View>
        </View>
      </View>

      <Animated.View style={[styles.chromeLayer, styles.memoryLayer, memoryScrollStyle]} pointerEvents="box-none">
        <View
          pointerEvents="box-none"
          style={[
            styles.rotatedCanvas,
            {
              width: SCREEN_HEIGHT,
              height: SCREEN_WIDTH,
              left: chromeOffset.left,
              top: chromeOffset.top,
              transform: [{ rotate: `${WALL_ROTATE_DEG}deg` }],
            },
          ]}
        >
          <Pressable style={styles.memoryBox} onPress={() => navigation.navigate("Memories")}>
            <View style={styles.memoryLabel} />
            <Text style={styles.memoryText}>Memories</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F0E8",
    overflow: "hidden",
  },

  // ScrollView needs its own bounded viewport size (flex: 1) — without
  // it, it sizes itself to its (very tall) content and there's nothing
  // left to scroll within.
  scrollView: {
    flex: 1,
  },

  // Shared by both the fixed chrome and the scrollable photo canvas —
  // an absolutely-positioned box, pre-rotation, that gets rotated in
  // place using its matching `rotatedOffset()` centering values.
  rotatedCanvas: {
    position: "absolute",
  },

  // Sits behind the frames (rendered first) so their own gestures still
  // win, but catches a tap anywhere else on the wall to exit edit mode.
  editDismissLayer: {
    position: "absolute",
    left: 0,
    top: 0,
    width: WALL_SCROLL_LENGTH,
    height: SCREEN_WIDTH,
  },

  chromeLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    elevation: 10,
  },

  // Painted after (so on top of) chromeLayer, and manually translated
  // to track scroll position — see memoryScrollStyle above.
  memoryLayer: {
    zIndex: 20,
    elevation: 20,
  },

  wallTitle: {
    // `left` here is the rotated canvas's along-scroll axis, which is
    // what actually lands near the screen's top edge once rotated —
    // overridden inline with the safe-area inset so this clears the
    // status bar/notch instead of sitting under it.
    position: "absolute",
    top: 22,
    fontSize: 26,
    fontStyle: "italic",
    color: "#7E7465",
  },

  memoryBox: {
    position: "absolute",
    left: 70,
    top: SCREEN_WIDTH - 90,
    width: 110,
    height: 66,
    backgroundColor: "#B09157",
    justifyContent: "center",
    alignItems: "center",
  },

  memoryLabel: {
    width: 34,
    height: 11,
    backgroundColor: "#F8F4E9",
    marginBottom: 7,
  },

  memoryText: {
    fontSize: 13,
    color: "#2A251D",
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 46,
    backgroundColor: "#DCCFA6",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  bottomBarText: {
    alignSelf: "flex-end",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#6B6247",
  },
});
