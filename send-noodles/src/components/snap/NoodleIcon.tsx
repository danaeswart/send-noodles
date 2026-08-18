import { useMemo } from "react";
import { Image } from "react-native";
import { randomNoodleImage } from "../../constants/noodleImages";

type Props = {
  size?: number;
};

// Renders one of the hand-drawn noodle illustrations from
// assets/noodle images/, picked once per mount so drag handles and
// confetti pieces don't all show the same shape once more are added.
export default function NoodleIcon({ size = 36 }: Props) {
  const source = useMemo(() => randomNoodleImage(), []);
  return <Image source={source} style={{ width: size, height: size }} resizeMode="contain" />;
}
