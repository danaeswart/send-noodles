import { Text } from "react-native";
import PushedShell from "../components/PushedShell";
import { type, colors } from "../constants/theme";

// Pushed when a circle is tapped from the Lobby (gesture-based tap,
// not built yet). Participants list and past challenges land here.
export default function CircleDetailScreen() {
  return (
    <PushedShell eyebrow="Circle" title="Circle Detail">
      <Text style={{ ...type.body, color: colors.paperDim }}>
        Participants list and past images/challenges for this circle
        will render here.
      </Text>
    </PushedShell>
  );
}
