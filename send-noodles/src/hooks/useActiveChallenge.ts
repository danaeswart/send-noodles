import { useCallback, useEffect, useState } from "react";

import { pullNextDailyChallenge, startTimeSensitiveChallenge, subscribeToChallenge, subscribeToCircle } from "../../firebase/challenges";
import type { ChallengeDoc, CircleDoc, WithId } from "../../firebase/types";

// Tracks a circle's single activeChallengeId and keeps its challenge doc
// live alongside it. Exposes the two client-triggered transitions the
// brief calls for on the Spark (no Cloud Functions) plan: pulling the
// next daily prompt once the previous challenge is done, and starting a
// time-sensitive challenge's countdown once its wager is locked.
export function useActiveChallenge(circleId: string | null, currentUserId: string | null) {
  const [circle, setCircle] = useState<WithId<CircleDoc> | null>(null);
  const [challenge, setChallenge] = useState<WithId<ChallengeDoc> | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!circleId) {
      setCircle(null);
      return;
    }
    return subscribeToCircle(circleId, setCircle);
  }, [circleId]);

  useEffect(() => {
    if (!circleId || !circle?.activeChallengeId) {
      setChallenge(null);
      return;
    }
    return subscribeToChallenge(circleId, circle.activeChallengeId, setChallenge);
  }, [circleId, circle?.activeChallengeId]);

  const canPullNext = !!circleId && (!circle?.activeChallengeId || challenge?.status === "completed");

  const pullNextChallenge = useCallback(async () => {
    if (!circleId || !currentUserId) return;
    setActionError(null);
    try {
      await pullNextDailyChallenge(circleId, currentUserId);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Couldn't pull the next challenge.");
    }
  }, [circleId, currentUserId]);

  const startTimer = useCallback(async () => {
    if (!circleId || !challenge) return;
    setActionError(null);
    try {
      await startTimeSensitiveChallenge(circleId, challenge.id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Couldn't start the challenge.");
    }
  }, [circleId, challenge]);

  return { circle, challenge, canPullNext, pullNextChallenge, startTimer, actionError };
}
