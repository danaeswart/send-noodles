import { useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { colors, spacing, type } from "../../constants/theme";

type SelectableCircle = { id: string; name: string };

type Props = {
  circles: SelectableCircle[];
  selectedId: string | null;
  onChange: (circleId: string) => void;
};

// Tapping the header expands an inline list of the user's other
// circles; picking one selects it and collapses the list again.
export default function CircleSelector({ circles, selectedId, onChange }: Props) {
  const [expanded, setExpanded] = useState(false);
  const selected = circles.find((c) => c.id === selectedId);
  const others = circles.filter((c) => c.id !== selectedId);

  const select = (circleId: string) => {
    onChange(circleId);
    setExpanded(false);
  };

  return (
    <Animated.View layout={LinearTransition.duration(220)} style={styles.wrap}>
      <Pressable onPress={() => setExpanded((e) => !e)} style={styles.header}>
        <Text style={styles.label}>Circle</Text>
        <Text style={styles.separator}>{"  |  "}</Text>
        <Text style={styles.circleName}>{selected?.name ?? "no circles yet"}</Text>
        <Text style={styles.chevron}>{expanded ? " ⌃" : " ⌄"}</Text>
      </Pressable>
      <View style={styles.underline} />

      {expanded && others.length > 0 && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          layout={LinearTransition.duration(220)}
          style={styles.list}
        >
          {others.map((c, i) => (
            <View key={c.id}>
              {i > 0 && <View style={styles.divider} />}
              <Pressable onPress={() => select(c.id)} style={styles.option}>
                <Text style={styles.optionText}>{c.name}</Text>
              </Pressable>
            </View>
          ))}
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: "flex-start", width: "100%" },
  header: { flexDirection: "row", alignItems: "center" },
  label: { ...type.eyebrow, color: colors.muted },
  separator: { color: colors.line },
  circleName: { ...type.serifDisplay, fontSize: 16, color: colors.alert },
  chevron: { color: colors.alert, fontSize: 14 },
  underline: { height: 2, backgroundColor: colors.alert, marginTop: spacing.xs, width: "100%" },
  list: { marginTop: spacing.sm },
  option: { paddingVertical: spacing.sm },
  optionText: { ...type.body, color: colors.ink },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.line },
});
