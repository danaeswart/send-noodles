import { Image, StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors, type } from "../../constants/theme";

type Props = {
  source: number;
  initials: string;
  size?: number;
  style?: ViewStyle;
};

// A member's plain avatar photo — no border, no circular clip — with
// their initials in light grey underneath.
export default function MemberFace({ source, initials, size = 48, style }: Props) {
  return (
    <View style={[styles.wrap, style]}>
      <Image source={source} style={{ width: size, height: size }} resizeMode="cover" />
      <Text style={styles.initials}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center" },
  initials: { ...type.caption, fontSize: 10, color: colors.muted, marginTop: 4, letterSpacing: 1 },
});
