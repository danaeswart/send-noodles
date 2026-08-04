import { Text } from "react-native";
import PanelShell from "../components/PanelShell";
import { type, colors } from "../constants/theme";

// Panel 0 of 5. Gallery grid, corner tray, and drag-and-drop placement
// land in the body slot.
export default function GalleryWallScreen() {
  return (
    <PanelShell eyebrow="Your Wall" title="Gallery Wall" index={0}>
      <Text style={{ ...type.body, color: colors.muted }}>
        Placed snaps grid and the un-placed snaps tray will render here.
      </Text>
    </PanelShell>
  );
}
