import { useEffect, useRef } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import FramedPhoto from "./FramedPhoto";
import { WallPhoto } from "../../data/mockGallery";
import { screenDeltaToLocal } from "../../utils/wallRotation";

const LONG_PRESS_MS = 350;
const WOBBLE_DEG = 1.6;
const MIN_SCALE = 0.55;
const MAX_SCALE = 2.2;

export type WallPhotoPatch = Partial<Pick<WallPhoto, "offset" | "crossFrac" | "size">>;

type Props = {
  photo: WallPhoto;
  screenWidth: number;
  editing: boolean;
  onEnterEdit: () => void;
  onCommit: (id: string, patch: WallPhotoPatch) => void;
};

export default function WallFrame({ photo, screenWidth, editing, onEnterEdit, onCommit }: Props) {
  // Captured once at mount and never updated from props again. The
  // committed position/size after a drag or pinch is reported back to
  // the parent purely for bookkeeping — this frame keeps rendering off
  // its own translateX/Y/scale, which just keep accumulating instead of
  // resetting to 0/1. Resetting them in sync with a parent state update
  // is what caused the old snap-back-then-snap-forward flicker: the
  // reset lands on the UI thread immediately, but the parent's new
  // left/top prop only lands a render later, so there was a brief frame
  // rendered at the stale base position in between.
  const base = useRef(photo).current;

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const wobble = useSharedValue(0);

  // A slow, subtle jiggle — the "you're in edit mode" cue — with a
  // per-frame offset so the whole wall doesn't wobble in lockstep.
  useEffect(() => {
    if (editing) {
      const duration = 260 + ((base.id.charCodeAt(base.id.length - 1) % 4) * 35);
      wobble.value = withRepeat(
        withSequence(
          withTiming(WOBBLE_DEG, { duration, easing: Easing.inOut(Easing.quad) }),
          withTiming(-WOBBLE_DEG, { duration: duration * 2, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration, easing: Easing.inOut(Easing.quad) })
        ),
        -1
      );
    } else {
      cancelAnimation(wobble);
      wobble.value = withTiming(0, { duration: 120 });
    }
  }, [editing, base.id, wobble]);

  const commitDrag = () => {
    onCommit(base.id, {
      offset: base.offset + translateX.value,
      crossFrac: (base.crossFrac * screenWidth + translateY.value) / screenWidth,
    });
  };

  const commitScale = () => {
    onCommit(base.id, { size: base.size * scale.value });
  };

  // Dragging activates instantly once the wall is already in edit mode;
  // otherwise it only kicks in after a long-press-and-hold, which is
  // also what puts the whole wall into edit mode in the first place.
  let pan = Gesture.Pan()
    .onStart(() => {
      if (!editing) runOnJS(onEnterEdit)();
    })
    .onChange((e) => {
      const { dx, dy } = screenDeltaToLocal(e.changeX, e.changeY);
      translateX.value += dx;
      translateY.value += dy;
    })
    .onEnd(() => {
      runOnJS(commitDrag)();
    });
  if (!editing) {
    pan = pan.activateAfterLongPress(LONG_PRESS_MS);
  }

  const pinch = Gesture.Pinch()
    .enabled(editing)
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((e) => {
      scale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, savedScale.value * e.scale));
    })
    .onEnd(() => {
      runOnJS(commitScale)();
    });

  const gesture = Gesture.Simultaneous(pan, pinch);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${wobble.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          { position: "absolute", left: base.offset, top: base.crossFrac * screenWidth },
          animatedStyle,
        ]}
      >
        <FramedPhoto frame={base.frame} size={base.size} />
      </Animated.View>
    </GestureDetector>
  );
}
