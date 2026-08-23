import { useEffect, useState } from "react";

import { subscribeToCircleSnaps } from "../../firebase/snaps";
import type { SnapDoc, WithId } from "../../firebase/types";

// Every snap ever sent to a circle, newest first — backs the "view all
// snaps" gallery and its full-screen swipeable detail view.
export function useCircleSnaps(circleId: string | null) {
  const [snaps, setSnaps] = useState<WithId<SnapDoc>[]>([]);

  useEffect(() => {
    if (!circleId) {
      setSnaps([]);
      return;
    }
    return subscribeToCircleSnaps(circleId, setSnaps);
  }, [circleId]);

  return snaps;
}
