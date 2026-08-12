import { useEffect, useState } from "react";
import type { Timestamp } from "firebase/firestore";

export type CountdownTarget = string | Timestamp | null | undefined;

function targetMillis(endsAt: CountdownTarget): number | null {
  if (!endsAt) return null;
  return typeof endsAt === "string" ? new Date(endsAt).getTime() : endsAt.toMillis();
}

// Plain setInterval, deliberately not Reanimated-driven — this tracks
// real wall-clock time against endsAt, not frame time, so it stays
// accurate even if the app is backgrounded and resumed. Accepts either
// an ISO timestamp (mock/legacy data) or a Firestore Timestamp
// (challenge.timeline.endsAt) so screens can pass either straight
// through.
export function useCountdown(endsAt: CountdownTarget) {
  const [remainingMs, setRemainingMs] = useState(() => {
    const target = targetMillis(endsAt);
    return target === null ? null : target - Date.now();
  });

  useEffect(() => {
    const target = targetMillis(endsAt);
    if (target === null) {
      setRemainingMs(null);
      return;
    }
    setRemainingMs(target - Date.now());
    const id = setInterval(() => {
      setRemainingMs(target - Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  return {
    remainingMs,
    isExpired: remainingMs !== null && remainingMs <= 0,
  };
}
