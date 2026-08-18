import { useEffect, useState } from "react";

import { subscribeToCircle } from "../../firebase/challenges";
import type { CircleDoc, WithId } from "../../firebase/types";

export function useCircle(circleId: string | null): WithId<CircleDoc> | null {
  const [circle, setCircle] = useState<WithId<CircleDoc> | null>(null);

  useEffect(() => {
    if (!circleId) {
      setCircle(null);
      return;
    }
    return subscribeToCircle(circleId, setCircle);
  }, [circleId]);

  return circle;
}
