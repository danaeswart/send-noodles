import { useCallback, useEffect, useState } from "react";

import { startTimeSensitiveChallenge, subscribeToChallenge, subscribeToCircle } from "../../firebase/challenges";
import type { ChallengeDoc, CircleDoc, WithId } from "../../firebase/types";

// Tracks a circle's single activeChallengeId and keeps its challenge doc
// live alongside it. Exposes the client-triggered transition the brief
// calls for on the Spark (no Cloud Functions) plan: starting a
// time-sensitive challenge's countdown once its wager is locked.
// Proposing a new challenge itself happens on a separate screen
// (ChallengeSetupScreen) since it needs user-entered terms — this hook
// just tells the caller whether that's currently allowed.
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

  const canProposeChallenge = !!circleId && (!circle?.activeChallengeId || challenge?.status === "completed");

  const startTimer = useCallback(async () => {
    if (!circleId || !challenge) return;
    setActionError(null);
    try {
      await startTimeSensitiveChallenge(circleId, challenge.id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Couldn't start the challenge.");
    }
  }, [circleId, challenge]);

  return { circle, challenge, canProposeChallenge, startTimer, actionError };
}
