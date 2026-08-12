import { useCallback, useEffect, useState } from "react";

import {
  maybeLockChallenge,
  proposeWagerAndTimeline,
  setMemberAgreement,
  subscribeToChallenge,
} from "../../firebase/challenges";
import type { ChallengeDoc, WithId } from "../../firebase/types";

// Reusable across any screen that shows a challenge's wager/timeline
// setup UI — currently wired into CircleDetailScreen (the circle
// "lobby"). Keeps the challenge doc live, auto-locks it the moment
// every member has agreed, and exposes the actions the existing wager
// UI needs to call.
export function useChallengeAgreement(circleId: string | null, challengeId: string | null, currentUserId: string | null) {
  const [challenge, setChallenge] = useState<WithId<ChallengeDoc> | null>(null);

  useEffect(() => {
    if (!circleId || !challengeId) {
      setChallenge(null);
      return;
    }
    const unsubscribe = subscribeToChallenge(circleId, challengeId, (next) => {
      setChallenge(next);
      if (next) void maybeLockChallenge(circleId, challengeId, next);
    });
    return unsubscribe;
  }, [circleId, challengeId]);

  const proposeWager = useCallback(
    async (wager: string, durationHours: number) => {
      if (!circleId || !challengeId || !currentUserId || !challenge) return;
      const members = Object.keys(challenge.agreementStatus);
      await proposeWagerAndTimeline(circleId, challengeId, currentUserId, members, wager, durationHours);
    },
    [circleId, challengeId, currentUserId, challenge]
  );

  const agree = useCallback(async () => {
    if (!circleId || !challengeId || !currentUserId) return;
    await setMemberAgreement(circleId, challengeId, currentUserId, "agreed");
  }, [circleId, challengeId, currentUserId]);

  const decline = useCallback(async () => {
    if (!circleId || !challengeId || !currentUserId) return;
    await setMemberAgreement(circleId, challengeId, currentUserId, "declined");
  }, [circleId, challengeId, currentUserId]);

  const myAgreement = currentUserId ? challenge?.agreementStatus[currentUserId]?.status ?? "pending" : "pending";
  const canEdit = challenge?.status === "setup";
  const allAgreed = !!challenge && Object.values(challenge.agreementStatus).every((a) => a.status === "agreed");

  return { challenge, myAgreement, canEdit, allAgreed, proposeWager, agree, decline };
}
