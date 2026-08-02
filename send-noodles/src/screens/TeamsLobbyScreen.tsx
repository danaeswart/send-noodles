import { Text } from "react-native";
import PanelShell from "../components/PanelShell";
import { type, colors } from "../constants/theme";

// Left-hand hub panel. Daily prompt, countdown timer, and team roster
// land in the body slot once real data is wired in.
export default function TeamsLobbyScreen() {
  return (
    <PanelShell eyebrow="Today's Prompt" title="Teams Lobby" index={0}>
      <Text style={{ ...type.body, color: colors.muted }}>
        Daily prompt, countdown timer, and team roster will render here.
      </Text>
    </PanelShell>
  );
}
