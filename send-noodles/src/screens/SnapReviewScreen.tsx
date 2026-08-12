import { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from "react-native-reanimated";

import { colors, spacing, type } from "../constants/theme";
import CapturePage from "../components/snap/CapturePage";
import SnapSendPage from "../components/snap/SnapSendPage";
import { useAuthUser } from "../hooks/useAuthUser";
import { useMyCircles } from "../hooks/useMyCircles";
import { useActiveChallenge } from "../hooks/useActiveChallenge";
import { submitSnap } from "../../firebase/snaps";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Combined capture + review flow as one continuous vertical surface,
// same interaction language as HomeChallenges/ProfileScreen — but with
// a deliberate twist: swipe DOWN on the capture page never changes
// page, it only captures (or re-captures, discarding any existing
// shot). Swipe UP is the only way to move to the review page, and only
// once a photo exists. From the review page, swipe UP posts, swipe
// DOWN cancels and bounces back to the capture page.
export default function SnapReviewScreen() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const { user } = useAuthUser();
  const userId = user?.uid ?? null;
  const circles = useMyCircles(userId);
  const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null);

  // Default to the first circle once the user's circles load, but only
  // if nothing's selected yet (don't stomp on a manual pick).
  useEffect(() => {
    if (!selectedCircleId && circles.length > 0) {
      setSelectedCircleId(circles[0].id);
    }
  }, [circles, selectedCircleId]);

  const { circle, challenge } = useActiveChallenge(selectedCircleId, userId);

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

  const handlePost = async () => {
    if (!photoUri || isPosting) return;
    if (!userId || !circle || !challenge) {
      setPostError("No active challenge to post to yet.");
      return;
    }

    setIsPosting(true);
    setPostError(null);
    try {
      const teamId =
        Object.entries(challenge.teams).find(([, members]) => members.includes(userId))?.[0] ?? "team_1";
      await submitSnap({
        circleId: circle.id,
        challengeId: challenge.id,
        userId,
        teamId,
        photoUri,
        frameId: null,
      });
      setPhotoUri(null);
      setCaption("");
      goToPage(0);
    } catch (err) {
      setPostError(err instanceof Error ? err.message : "Couldn't post your snap.");
    } finally {
      setIsPosting(false);
    }
  };

  const handleCancel = () => {
    setPhotoUri(null);
    setCaption("");
    setPostError(null);
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
            challengePrompt={challenge?.promptText ?? "no active challenge yet"}
            photoUri={photoUri}
            caption={caption}
            onChangeCaption={setCaption}
            onPost={handlePost}
            onCancel={handleCancel}
            circles={circles}
            selectedCircleId={selectedCircleId}
            onSelectCircle={setSelectedCircleId}
          />
          {postError && (
            <View style={styles.errorWrap} pointerEvents="none">
              <Text style={styles.errorText}>{postError}</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, overflow: "hidden", backgroundColor: colors.ink },
  stack: { height: SCREEN_HEIGHT * 2 },
  pageSlot: { height: SCREEN_HEIGHT },
  errorWrap: { position: "absolute", left: spacing.lg, right: spacing.lg, bottom: spacing.xxl, alignItems: "center" },
  errorText: { ...type.caption, color: colors.alert, textAlign: "center" },
});
