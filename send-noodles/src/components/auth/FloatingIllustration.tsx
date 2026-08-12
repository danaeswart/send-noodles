import { useEffect } from "react";
import { StyleSheet, Text, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { spacing, type } from "../../constants/theme";

type Props = {
  size?: number;
  color?: string;
  drift?: number; // vertical float distance in px, each direction
  duration?: number; // one-way duration in ms
  delay?: number; // stagger so shapes don't move in lockstep
  spin?: number; // max tilt in degrees, each direction
  style?: ViewStyle;
};

// Decorative stand-in for a future illustration asset. Renders as a
// soft colour block that gently bobs and tilts in place, so the empty
// background reads as "alive" before any real artwork exists. Once
// illustrations land, swap the <Text> label here for an <Image> — the
// floating wrapper and animation stay the same.
export default function FloatingIllustration({
  size = 96,
  color = "#3F6E66",
  drift = 12,
  duration = 2400,
  delay = 0,
  spin = 6,
  style,
}: Props) {
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
    <Animated.View
      pointerEvents="none"
      style={[styles.wrap, { width: size, height: size, backgroundColor: color }, animatedStyle, style]}
    >
      <Text style={styles.label}>illustration</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.9,
  },
  label: { ...type.caption, color: "rgba(255,255,255,0.6)", fontSize: 10 },
});
