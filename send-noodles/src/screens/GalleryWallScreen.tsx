import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import FramedPhoto from "../components/gallery/FramedPhoto";
import { mockWallPhotos, WALL_SCROLL_LENGTH } from "../data/mockGallery";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// The whole wall is authored in "landscape" coordinates — as if the
// phone were already turned on its side — then rotated to fit the
// upright screen. +90 (clockwise) means: physically turning the phone
// so its top edge goes to your left brings the wall upright.
const ROTATE_DEG = 90;

// A box authored at (w0 x h0) and rotated 90deg has a swapped (h0 x w0)
// footprint. This offset re-centers it so that footprint lands exactly
// on a parent box of size (h0 x w0), with no gap or clipping.
function rotatedOffset(w0: number, h0: number) {
  return { left: (h0 - w0) / 2, top: (w0 - h0) / 2 };
}

// Fixed chrome (title, memories tag, swipe hint) covers exactly one
// screen and never scrolls — only the photos underneath do.
const chromeOffset = rotatedOffset(SCREEN_HEIGHT, SCREEN_WIDTH);

// The scrollable canvas is one long strip, WALL_SCROLL_LENGTH deep, that
// becomes the vertical scroll length once rotated.
const canvasOffset = rotatedOffset(WALL_SCROLL_LENGTH, SCREEN_WIDTH);

export default function GalleryWallScreen() {
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
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
              transform: [{ rotate: `${ROTATE_DEG}deg` }],
            },
          ]}
        >
          {mockWallPhotos.map((photo) => (
            <FramedPhoto
              key={photo.id}
              frame={photo.frame}
              size={photo.size}
              style={{
                position: "absolute",
                left: photo.offset,
                top: photo.crossFrac * SCREEN_WIDTH,
              }}
            />
          ))}
        </View>
      </ScrollView>

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
              transform: [{ rotate: `${ROTATE_DEG}deg` }],
            },
          ]}
        >
          <Text style={styles.wallTitle}>the wall</Text>

          <View style={styles.memoryBox}>
            <View style={styles.memoryLabel} />
            <Text style={styles.memoryText}>Memories</Text>
          </View>

          <View style={styles.bottomBar}>
            <Text style={styles.bottomBarText}>swipe to see more →</Text>
          </View>
        </View>
      </View>
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

  chromeLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    elevation: 10,
  },

  wallTitle: {
    position: "absolute",
    left: 24,
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
    zIndex: 5,
    elevation: 5,
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
