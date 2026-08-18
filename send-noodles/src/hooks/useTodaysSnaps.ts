import { useEffect, useState } from "react";

import { subscribeToTodaysSnaps } from "../../firebase/snaps";
import type { SnapDoc, WithId } from "../../firebase/types";

export function useTodaysSnaps(circleId: string | null) {
  const [snaps, setSnaps] = useState<WithId<SnapDoc>[]>([]);

  useEffect(() => {
    if (!circleId) {
      setSnaps([]);
      return;
    }
    return subscribeToTodaysSnaps(circleId, setSnaps);
  }, [circleId]);

  return snaps;
}
