import { Text, StyleSheet } from "react-native";
import { colors, type } from "../../constants/theme";
import { useCountdown, type CountdownTarget } from "../../hooks/useCountdown";

type Props = {
  endsAt: CountdownTarget;
};

function formatRemaining(ms: number) {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function CountdownTimer({ endsAt }: Props) {
  const { remainingMs } = useCountdown(endsAt);
  return <Text style={styles.timer}>{formatRemaining(remainingMs ?? 0)}</Text>;
}

const styles = StyleSheet.create({
  timer: {
    ...type.serifDisplay,
    fontSize: 26,
    color: colors.ink,
  },
});
