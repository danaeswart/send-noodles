import { useEffect, useRef, useState } from "react";

import { subscribeToUserProfile } from "../../firebase/users";
import type { FrameUnlock } from "../../firebase/types";

// Watches the signed-in user's own profile and queues up any reward frame
// that shows up in frameUnlocks since the last snapshot this hook saw —
// the mechanism behind the full-screen "new frame unlocked!" celebration
// (FrameRewardModal, mounted from RootNavigator). Neither recordSnapSent
// nor awardChallengeRewards (firebase/users.ts, firebase/challenges.ts)
// need to know this UI exists - they just append to frameUnlocks, and
// this hook reacts to the diff on the owner's own real-time listener.
// That also makes it work for a challenge-completion frame, even though
// the write granting it can come from a teammate's client racing to the
// transaction first.
//
// The very first snapshot after mount/sign-in only sets the baseline, so
// frames the user already had don't re-trigger the popup - an unlock
// granted while the app was closed is picked up silently instead (no
// popup), same as any other profile change they missed while away.
export function useFrameUnlockQueue(userId: string | null) {
  const [queue, setQueue] = useState<FrameUnlock[]>([]);
  const seenIdsRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    seenIdsRef.current = null;
    setQueue([]);
    if (!userId) return;

    return subscribeToUserProfile(userId, (profile) => {
      const frameUnlocks = profile?.frameUnlocks ?? [];

      if (seenIdsRef.current === null) {
        seenIdsRef.current = new Set(frameUnlocks.map((f) => f.frameId));
        return;
      }

      const seenIds = seenIdsRef.current;
      const fresh = frameUnlocks.filter((f) => !seenIds.has(f.frameId));
      if (fresh.length === 0) return;

      fresh.forEach((f) => seenIds.add(f.frameId));
      setQueue((prev) => [...prev, ...fresh]);
    });
  }, [userId]);

  const dismissTop = () => setQueue((prev) => prev.slice(1));

  return { current: queue[0] ?? null, dismissTop };
}
