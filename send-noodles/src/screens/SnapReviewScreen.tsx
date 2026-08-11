import { useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from "react-native-reanimated";

import { colors } from "../constants/theme";
import { mockChallenges } from "../data/mockChallenges";
import CapturePage from "../components/snap/CapturePage";
import SnapSendPage from "../components/snap/SnapSendPage";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Combined capture + review flow as one continuous vertical surface,
// same interaction language as HomeChallenges/ProfileScreen — but with
// a deliberate twist: swipe DOWN on the capture page never changes
// page, it only captures (or re-captures, discarding any existing
// shot). Swipe UP is the only way to move to the review page, and only
// once a photo exists. From the review page, swipe UP posts, swipe
// DOWN cancels and bounces back to the capture page.
//
// TODO: challengePrompt still comes from the first mock challenge
// instead of the actual challenge passed via navigation params.
export default function SnapReviewScreen() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [caption, setCaption] = useState("");

  const translateY = useSharedValue(0);
  const hasPhoto = photoUri !== null;

  const goToPage = (next: 0 | 1) => {
    translateY.value = withTiming(next === 0 ? 0 : -SCREEN_HEIGHT, {
      duration: 450,
      easing: Easing.out(Easing.cubic),
    });
  };

  const handleCapture = (uri: string) => {
    setPhotoUri(uri);
  };

  const handlePost = () => {
    // TODO: upload photo + caption to Firebase Storage/Firestore here.
    setPhotoUri(null);
    setCaption("");
    goToPage(0);
  };

  const handleCancel = () => {
    setPhotoUri(null);
    setCaption("");
    goToPage(0);
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.stack, containerStyle]}>
        <View style={styles.pageSlot}>
          <CapturePage
            hasPhoto={hasPhoto}
            photoUri={photoUri}
            onCapture={handleCapture}
            onRequestReview={() => goToPage(1)}
          />
        </View>
        <View style={styles.pageSlot}>
          <SnapSendPage
            challengePrompt={mockChallenges[0].prompt}
            photoUri={photoUri}
            caption={caption}
            onChangeCaption={setCaption}
            onPost={handlePost}
            onCancel={handleCancel}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, overflow: "hidden", backgroundColor: colors.ink },
  stack: { height: SCREEN_HEIGHT * 2 },
  pageSlot: { height: SCREEN_HEIGHT },
});
