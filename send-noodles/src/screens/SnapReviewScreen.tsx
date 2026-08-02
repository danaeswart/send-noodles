import { Text } from "react-native";
import PushedShell from "../components/PushedShell";
import { type, colors } from "../constants/theme";

// Pushed modally after the swipe-down camera capture gesture (not built
// yet). Photo preview, description field, and circle-select land here.
export default function SnapReviewScreen() {
  return (
    <PushedShell eyebrow="Review" title="Snap Review">
      <Text style={{ ...type.body, color: colors.paperDim }}>
        Captured photo preview, description field, and circle-select
        will render here.
      </Text>
    </PushedShell>
  );
}
