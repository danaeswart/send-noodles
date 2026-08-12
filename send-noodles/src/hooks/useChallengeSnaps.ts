import { useEffect, useState } from "react";

import { subscribeToChallengeSnaps } from "../../firebase/snaps";
import type { SnapDoc, WithId } from "../../firebase/types";

export function useChallengeSnaps(circleId: string | null, challengeId: string | null) {
  const [snaps, setSnaps] = useState<WithId<SnapDoc>[]>([]);

  useEffect(() => {
    if (!circleId || !challengeId) {
      setSnaps([]);
      return;
    }
    return subscribeToChallengeSnaps(circleId, challengeId, setSnaps);
  }, [circleId, challengeId]);

  return snaps;
}
