import { Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Polyline } from "react-native-svg";

const LEGEND_SWATCH_WIDTH = 16;

import { colors, spacing, type } from "../../constants/theme";
import type { ScoringEventDoc, WithId } from "../../../firebase/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHART_WIDTH = SCREEN_WIDTH - spacing.lg * 2;
const CHART_HEIGHT = 140;
const CHART_PADDING = 8;

type Props = {
  events: WithId<ScoringEventDoc>[];
  teamAId: string;
  teamBId: string;
};

// Cumulative running total for one team across every scoring event, in
// order — a flat line where the team didn't score, rising where it did.
// Prefixed with a synthetic 0 so there's always a visible line from
// the start even with only one event so far.
function cumulativeSeries(events: WithId<ScoringEventDoc>[], teamId: string): number[] {
  let running = 0;
  const series = events.map((event) => {
    if (event.teamId === teamId) running += event.pointsAwarded;
    return running;
  });
  return [0, ...series];
}

// The app's existing accent/alert colors sit in the CVD-safe "floor"
// band rather than comfortably passing (they're brand colors, not
// swappable for this one chart) — so identity here isn't color-alone:
// team A is a solid line, team B a dashed one, both also named in the
// legend below.
export default function PointsChart({ events, teamAId, teamBId }: Props) {
  if (events.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>no points yet</Text>
      </View>
    );
  }

  const seriesA = cumulativeSeries(events, teamAId);
  const seriesB = cumulativeSeries(events, teamBId);
  const maxY = Math.max(1, ...seriesA, ...seriesB);
  const plotWidth = CHART_WIDTH - CHART_PADDING * 2;
  const plotHeight = CHART_HEIGHT - CHART_PADDING * 2;
  const stepX = seriesA.length > 1 ? plotWidth / (seriesA.length - 1) : 0;

  const toPoints = (series: number[]) =>
    series.map((y, i) => `${CHART_PADDING + i * stepX},${CHART_PADDING + plotHeight - (y / maxY) * plotHeight}`).join(" ");

  const lastX = CHART_PADDING + (seriesA.length - 1) * stepX;
  const lastYA = CHART_PADDING + plotHeight - (seriesA[seriesA.length - 1] / maxY) * plotHeight;
  const lastYB = CHART_PADDING + plotHeight - (seriesB[seriesB.length - 1] / maxY) * plotHeight;

  return (
    <View>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        <Line
          x1={CHART_PADDING}
          y1={CHART_PADDING + plotHeight}
          x2={CHART_WIDTH - CHART_PADDING}
          y2={CHART_PADDING + plotHeight}
          stroke={colors.line}
          strokeWidth={1}
        />
        <Polyline
          points={toPoints(seriesA)}
          fill="none"
          stroke={colors.accent}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Polyline
          points={toPoints(seriesB)}
          fill="none"
          stroke={colors.alert}
          strokeWidth={2}
          strokeDasharray="6,4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx={lastX} cy={lastYA} r={4} fill={colors.accent} />
        <Circle cx={lastX} cy={lastYB} r={4} fill={colors.alert} />
      </Svg>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <Svg width={LEGEND_SWATCH_WIDTH} height={2}>
            <Line x1={0} y1={1} x2={LEGEND_SWATCH_WIDTH} y2={1} stroke={colors.accent} strokeWidth={2} />
          </Svg>
          <Text style={styles.legendLabel}>{teamAId.replace("_", " ")}</Text>
        </View>
        <View style={styles.legendItem}>
          <Svg width={LEGEND_SWATCH_WIDTH} height={2}>
            <Line
              x1={0}
              y1={1}
              x2={LEGEND_SWATCH_WIDTH}
              y2={1}
              stroke={colors.alert}
              strokeWidth={2}
              strokeDasharray="4,3"
            />
          </Svg>
          <Text style={styles.legendLabel}>{teamBId.replace("_", " ")}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    height: CHART_HEIGHT,
    borderRadius: spacing.xl,
    backgroundColor: colors.paperDim,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: { ...type.caption, color: colors.muted },
  legendRow: { flexDirection: "row", marginTop: spacing.sm, gap: spacing.lg },
  legendItem: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  legendLabel: { ...type.caption, color: colors.muted, textTransform: "lowercase" },
});
