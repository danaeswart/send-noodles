import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";

import { colors, spacing, type } from "../../constants/theme";
import CapturedPhotoFrame from "./CapturedPhotoFrame";
import CircleSelector from "./CircleSelector";
import CaptionInput from "./CaptionInput";

const SWIPE_THRESHOLD = 60;

type SelectableCircle = { id: string; name: string };

type Props = {
  challengePrompt: string;
  photoUri: string | null;
  caption: string;
  onChangeCaption: (text: string) => void;
  onPost: () => void;
  onCancel: () => void;
  circles: SelectableCircle[];
  selectedCircleId: string | null;
  onSelectCircle: (circleId: string) => void;
};

// Bottom page of the capture/send flow. Swipe UP posts to the selected
// circle; swipe DOWN cancels and discards the photo, bouncing back up
// to the capture page.
export default function SnapSendPage({
  challengePrompt,
  photoUri,
  caption,
  onChangeCaption,
  onPost,
  onCancel,
  circles,
  selectedCircleId,
  onSelectCircle,
}: Props) {
  const pan = Gesture.Pan()
    .activeOffsetY([-10, 10])
    .failOffsetX([-15, 15])
    .onEnd((e) => {
      if (e.translationY < -SWIPE_THRESHOLD) {
        runOnJS(onPost)();
      } else if (e.translationY > SWIPE_THRESHOLD) {
        runOnJS(onCancel)();
      }
    });

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.page}>
        <Text style={styles.eyebrow}>Today's Challenge</Text>
        <Text style={styles.headline}>{challengePrompt}</Text>

        <View style={styles.circleWrap}>
          <CircleSelector circles={circles} selectedId={selectedCircleId} onChange={onSelectCircle} />
        </View>

        <View style={styles.photoWrap}>
          <CapturedPhotoFrame uri={photoUri ?? undefined} />
        </View>

        <CaptionInput value={caption} onChangeText={onChangeCaption} />

        <View style={styles.hintWrap}>
          <Text style={styles.hintStrong}>Swipe up to post to circle</Text>
          <Text style={styles.hintMuted}>swipe down to cancel</Text>
        </View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.paper, paddingHorizontal: spacing.lg, paddingTop: spacing.xxl },
  eyebrow: { ...type.eyebrow, color: colors.muted },
  headline: { ...type.serifDisplay, fontSize: 30, lineHeight: 34, color: colors.ink, marginTop: spacing.xs },
  circleWrap: { marginTop: spacing.md },
  photoWrap: { marginTop: spacing.lg },
  hintWrap: { flex: 1, justifyContent: "flex-end", alignItems: "center", paddingBottom: spacing.xxl },
  hintStrong: { ...type.eyebrow, color: colors.ink, marginBottom: spacing.xs },
  hintMuted: { ...type.caption, color: colors.muted },
});
