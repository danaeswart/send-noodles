import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { colors } from "../constants/theme";

type Props = {
  activeIndex: number;
  scrollPosition: { value: number };
  topInset: number;
};

const PAGE_TITLES = ["Gallery", "Circles", "Challenges", "Snap", "Profile"];
const DOT_SIZE = 8;
const DOT_SPACING = 16;
const DOT_STEP = DOT_SIZE + DOT_SPACING;
const DOT_CONTAINER_WIDTH = DOT_STEP * PAGE_TITLES.length - DOT_SPACING;

export default function TopSwipeNavigator({ activeIndex, scrollPosition, topInset }: Props) {
  const navProgress = useSharedValue(0);

  useEffect(() => {
    navProgress.value = withSequence(
      withTiming(1, { duration: 200 }),
      withDelay(1200, withTiming(0, { duration: 200 }))
    );
  }, [activeIndex, navProgress]);

  const shellStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(navProgress.value, [0, 1], [-18, 0]),
      },
    ],
    opacity: navProgress.value,
  }));

  const activeDotX = useDerivedValue(() => {
    const position = Math.min(Math.max(scrollPosition.value, 0), PAGE_TITLES.length - 1);
    return position * DOT_STEP;
  });

  const activeDotStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: activeDotX.value }],
  }));

  return (
    <View style={[styles.container, { top: topInset }]} pointerEvents="none">
      <Animated.View style={[styles.dotShell, shellStyle]}>
        <View style={styles.dotRow}>
          {PAGE_TITLES.map((_, index) => (
            <View key={index} style={[styles.dot, { left: index * DOT_STEP }]} />
          ))}
          <Animated.View style={[styles.activeDot, activeDotStyle]} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 20,
  },
  dotShell: {
    width: DOT_CONTAINER_WIDTH + 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.98)",
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
  },
  dotRow: {
    position: "relative",
    width: DOT_CONTAINER_WIDTH,
    height: DOT_SIZE,
  },
  dot: {
    position: "absolute",
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.line,
  },
  activeDot: {
    position: "absolute",
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.ink,
    top: 0,
  },
});
