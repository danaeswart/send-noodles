import { useEffect, useState } from "react";

import { subscribeToMyCircles } from "../../firebase/challenges";
import type { CircleDoc, WithId } from "../../firebase/types";

export function useMyCircles(userId: string | null) {
  const [circles, setCircles] = useState<WithId<CircleDoc>[]>([]);

  useEffect(() => {
    if (!userId) {
      setCircles([]);
      return;
    }
    return subscribeToMyCircles(userId, setCircles);
  }, [userId]);

  return circles;
}
