import { Text } from "react-native";
import PanelShell from "../components/PanelShell";
import { type, colors } from "../constants/theme";

// Panel 1 of 5. Overview of the user's circles/groups and today's
// challenge per circle. Tapping a circle pushes CircleDetailScreen on
// top of the deck (see RootNavigator).
export default function CirclesScreen() {
  return (
    <PanelShell eyebrow="Your Groups" title="Circles" index={1}>
      <Text style={{ ...type.body, color: colors.muted }}>
        List of circles, each with today's challenge preview. Tapping
        one will push into Circle Detail.
      </Text>
    </PanelShell>
  );
}
