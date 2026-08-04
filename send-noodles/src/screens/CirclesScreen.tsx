import { useState } from "react";
import { Dimensions, FlatList, ListRenderItem, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import AvatarCluster from "../components/challenges/AvatarCluster";
import { colors, spacing, type } from "../constants/theme";
import { mockCircles, Circle } from "../data/mockCircles";
import { RootStackParamList } from "../navigation/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Circle>);

export default function CirclesScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollY = useSharedValue(0);
  const navigation = useNavigation<NavigationProp>();

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const onMomentumScrollEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.y / SCREEN_HEIGHT);
    setActiveIndex(index);
  };

  const renderCircle: ListRenderItem<Circle> = ({ item, index }) => (
    <Pressable
      style={styles.pagePressable}
      onPress={() => navigation.navigate("CircleDetail", { circleId: item.id })}
    >
      <View style={styles.page}>
        <View style={[styles.topPanel, { backgroundColor: item.color }]}> 
          <View style={styles.pageHeader}>
            <Text style={styles.circleLabel}>CIRCLE</Text>
            <View style={styles.dotRow}>
              {mockCircles.map((circle, dotIndex) => (
                <View
                  key={circle.id}
                  style={[
                    styles.indicatorDot,
                    dotIndex === index && styles.indicatorDotActive,
                  ]}
                />
              ))}
            </View>
          </View>

          <Text style={styles.circleName}>{item.name}</Text>

          <View style={styles.statsRow}>
            <Text style={styles.statsText}>{item.members} members</Text>
            <Text style={styles.statsText}>{item.snaps} snaps</Text>
          </View>
        </View>

        <View style={styles.contentPanel}>
          <View style={styles.challengePanel}>
            <Text style={styles.challengeLabel}>TODAY'S CHALLENGE</Text>
            <Text style={styles.challengePrompt}>{item.challengePrompt}</Text>

            <View style={styles.scoreRow}>
              <Text style={styles.scoreYou}>{item.score.you}</Text>
              <Text style={styles.scoreDash}>-</Text>
              <Text style={styles.scoreThem}>{item.score.them}</Text>
              <Text style={styles.scoreSubtitle}>YOU · THEM</Text>
            </View>

            <View style={styles.challengeFooter}>
              <Text style={styles.weekText}>WEEK {item.week} OF {item.weeks}</Text>
              <Text style={styles.teamText}>{item.teamName}</Text>
            </View>
          </View>

          <View style={styles.metaFooter}>
            <AvatarCluster
              participants={item.participants}
              overflowCount={item.participantOverflowCount}
            />
            <Text style={styles.openText}>tap anywhere to open</Text>
          </View>

          <View style={styles.hintWrap}>
            <Text style={styles.hintText}>
              {index === mockCircles.length - 1
                ? "that's all your circles for today"
                : "swipe up to view other circle challenges"}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <AnimatedFlatList
        data={mockCircles}
        keyExtractor={(item) => item.id}
        renderItem={renderCircle}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SCREEN_HEIGHT}
        bounces={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumScrollEnd}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  pagePressable: {
    width: "100%",
  },
  page: {
    width: "100%",
    height: SCREEN_HEIGHT,
    backgroundColor: colors.paper,
  },
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  circleLabel: {
    ...type.eyebrow,
    color: colors.paper,
    letterSpacing: 2,
  },
  dotRow: {
    flexDirection: "row",
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.35)",
    marginLeft: spacing.xs,
  },
  indicatorDotActive: {
    backgroundColor: colors.paper,
  },
  circleName: {
    ...type.display,
    color: colors.paper,
    fontSize: 44,
    lineHeight: 48,
    fontWeight: "900",
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  statsText: {
    ...type.caption,
    color: colors.paper,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: spacing.xl,
  },
  topPanel: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  contentPanel: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  challengePanel: {
    padding: spacing.lg,
    borderRadius: spacing.xl,
    backgroundColor: colors.paper,
    flex: 1,
  },
  challengeLabel: {
    ...type.eyebrow,
    color: colors.muted,
    letterSpacing: 2,
  },
  challengePrompt: {
    ...type.serifDisplay,
    fontSize: 34,
    lineHeight: 40,
    color: colors.ink,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    flexWrap: "wrap",
  },
  scoreYou: {
    ...type.display,
    color: colors.alert,
    fontSize: 54,
    lineHeight: 52,
  },
  scoreDash: {
    ...type.display,
    color: colors.muted,
    fontSize: 34,
    marginHorizontal: spacing.sm,
  },
  scoreThem: {
    ...type.heading,
    color: colors.muted,
    fontSize: 34,
  },
  scoreSubtitle: {
    ...type.caption,
    color: colors.muted,
    marginLeft: spacing.sm,
    marginTop: spacing.xs,
  },
  challengeFooter: {
    marginTop: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  weekText: {
    ...type.caption,
    color: colors.muted,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  teamText: {
    ...type.body,
    color: colors.muted,
    fontWeight: "700",
  },
  metaFooter: {
    marginTop: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  openText: {
    ...type.caption,
    color: colors.ink,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  hintWrap: {
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  hintText: {
    ...type.caption,
    color: colors.paper,
  },
});
