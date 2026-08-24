import { useEffect, useState } from "react";
import { ImageSourcePropType, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { randomIllustration } from "../../constants/illustrations";

type Props = {
  source?: ImageSourcePropType;
  size?: number;
  drift?: number; // vertical float distance in px, each direction
  duration?: number; // one-way duration in ms
  delay?: number; // stagger so shapes don't move in lockstep
  spin?: number; // max tilt in degrees, each direction
  style?: ViewStyle;
};

// Gently bobbing/tilting illustration art. Picks a random image from
// assets/illustrations/ (see src/constants/illustrations.ts) unless a
// specific source is passed in, so Login/SignUp get a different mix of
// art each time the screen mounts.
export default function FloatingIllustration({
  source,
  size = 96,
  drift = 12,
  duration = 2400,
  delay = 0,
  spin = 6,
  style,
}: Props) {
  const [imageSource] = useState<ImageSourcePropType>(() => source ?? randomIllustration());
  const float = useSharedValue(0);
  const tilt = useSharedValue(0);

  useEffect(() => {
    float.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-drift, { duration, easing: Easing.inOut(Easing.sin) }),
          withTiming(drift, { duration, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
    tilt.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(spin, { duration: duration * 1.3, easing: Easing.inOut(Easing.sin) }),
          withTiming(-spin, { duration: duration * 1.3, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
  }, [delay, drift, duration, spin]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: float.value }, { rotate: `${tilt.value}deg` }],
  }));

  return (
    <Animated.Image
      pointerEvents="none"
      source={imageSource}
      resizeMode="contain"
      style={[{ width: size, height: size }, animatedStyle, style]}
    />
  );
}
