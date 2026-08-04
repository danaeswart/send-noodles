import { useEffect, useState } from "react";
import { Text, StyleSheet } from "react-native";
import { colors, type } from "../../constants/theme";

type Props = {
  endsAt: string;
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

// Plain setInterval, deliberately not Reanimated-driven — this needs to
// track real wall-clock time against endsAt, not frame time, so it stays
// accurate even if the app is backgrounded and resumed.
export default function CountdownTimer({ endsAt }: Props) {
  const [remaining, setRemaining] = useState(() => new Date(endsAt).getTime() - Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(new Date(endsAt).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  return <Text style={styles.timer}>{formatRemaining(remaining)}</Text>;
}

const styles = StyleSheet.create({
  timer: {
    ...type.serifDisplay,
    fontSize: 26,
    color: colors.ink,
  },
});
