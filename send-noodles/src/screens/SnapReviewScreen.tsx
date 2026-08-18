import { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from "react-native-reanimated";

import { colors, spacing, type } from "../constants/theme";
import CapturePage from "../components/snap/CapturePage";
import SnapSendPage from "../components/snap/SnapSendPage";
import NoodleSentPage from "../components/snap/NoodleSentPage";
import { useAuthUser } from "../hooks/useAuthUser";
import { useMyCircles } from "../hooks/useMyCircles";
import { useActiveChallenge } from "../hooks/useActiveChallenge";
import { submitSnap } from "../../firebase/snaps";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Combined capture + review + send flow as one continuous vertical
// surface, same interaction language as HomeChallenges/ProfileScreen —
// but with a deliberate twist: swipe DOWN on the capture page never
// changes page, it only captures (or re-captures, discarding any
// existing shot). Once the shake-reveal finishes, CapturePage hands off
// to the send page on its own — no swipe needed. From there, dragging
// the noodle icon up posts to Firebase and slides through to a "noodle
// sent!" confirmation, which then scrolls back to the capture page on
// its own. Swipe DOWN anywhere else on the send page cancels and
// discards the photo, bouncing back up to the capture page.
export default function SnapReviewScreen() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<0 | 1 | 2>(0);

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

  const goToPage = (next: 0 | 1 | 2) => {
    translateY.value = withTiming(-SCREEN_HEIGHT * next, {
      duration: 450,
      easing: Easing.out(Easing.cubic),
    });
    setActivePage(next);
  };

  const handleCapture = (uri: string) => {
    setPhotoUri(uri);
  };

  const handlePost = async () => {
    if (!photoUri || isPosting) return;
    if (!userId || !circle) {
      setPostError("Pick a circle to send to first.");
      return;
    }

    // The challenge is just a fun extra — a snap always sends to the
    // circle, and only counts toward a challenge (and scores a point)
    // when one is genuinely active and the sender is on a team for it.
    const challengeIsActive =
      !!challenge &&
      challenge.status === "active" &&
      (challenge.promptType !== "time_sensitive" ||
        !challenge.timeline.endsAt ||
        challenge.timeline.endsAt.toMillis() > Date.now());
    const teamId = challengeIsActive
      ? (Object.entries(challenge!.teams).find(([, members]) => members.includes(userId))?.[0] ?? null)
      : null;

    setIsPosting(true);
    setPostError(null);
    try {
      await submitSnap({
        circleId: circle.id,
        userId,
        photoUri,
        frameId: null,
        challengeId: challengeIsActive ? challenge!.id : null,
        teamId,
      });
      goToPage(2);
    } catch (err) {
      setPostError(err instanceof Error ? err.message : "Couldn't post your snap.");
    } finally {
      setIsPosting(false);
    }
  };

  const handleSentDone = () => {
    setPhotoUri(null);
    setCaption("");
    goToPage(0);
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
            photoUri={photoUri}
            caption={caption}
            onChangeCaption={setCaption}
            onPost={handlePost}
            onCancel={handleCancel}
            circles={circles}
            selectedCircleId={selectedCircleId}
            onSelectCircle={setSelectedCircleId}
            active={activePage === 1}
          />
          {postError && (
            <View style={styles.errorWrap} pointerEvents="none">
              <Text style={styles.errorText}>{postError}</Text>
            </View>
          )}
        </View>
        <View style={styles.pageSlot}>
          <NoodleSentPage active={activePage === 2} onDone={handleSentDone} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, overflow: "hidden", backgroundColor: colors.ink },
  stack: { height: SCREEN_HEIGHT * 3 },
  pageSlot: { height: SCREEN_HEIGHT },
  errorWrap: { position: "absolute", left: spacing.lg, right: spacing.lg, bottom: spacing.xxl, alignItems: "center" },
  errorText: { ...type.caption, color: colors.alert, textAlign: "center" },
});
