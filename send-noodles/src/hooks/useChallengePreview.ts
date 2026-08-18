import { useEffect, useState } from "react";

import { subscribeToChallenge } from "../../firebase/challenges";
import type { ChallengeDoc, WithId } from "../../firebase/types";

// Lightweight read of just a challenge's live doc, for places (like a
// circle's swipe-deck card) that want to show its promptText without
// pulling in the full agreement/scoring machinery useActiveChallenge and
// useChallengeAgreement carry.
export function useChallengePreview(circleId: string, challengeId: string | null): WithId<ChallengeDoc> | null {
  const [challenge, setChallenge] = useState<WithId<ChallengeDoc> | null>(null);

  useEffect(() => {
    if (!challengeId) {
      setChallenge(null);
      return;
    }
    return subscribeToChallenge(circleId, challengeId, setChallenge);
  }, [circleId, challengeId]);

  return challenge;
}
