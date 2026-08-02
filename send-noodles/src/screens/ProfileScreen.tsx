import { Text } from "react-native";
import PanelShell from "../components/PanelShell";
import { type, colors } from "../constants/theme";

// Right-hand hub panel. Personal stats, unlocked frames, and friends
// management land in the body slot.
export default function ProfileScreen() {
  return (
    <PanelShell eyebrow="Account" title="Profile" index={2}>
      <Text style={{ ...type.body, color: colors.muted }}>
        Stats, unlocked frames, and friend management will render here.
      </Text>
    </PanelShell>
  );
}
