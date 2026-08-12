import { useEffect, useMemo, useState } from "react";

import { subscribeToScoringEvents } from "../../firebase/challenges";
import type { ScoringEventDoc, WithId } from "../../firebase/types";

// Live team totals for a challenge — deliberately does NOT sum by
// querying snaps. Every scoring event is its own doc, and the total is
// just the running sum of a real-time query over that collection, per
// the brief (keeps this on the free Spark plan, no Cloud Functions
// needed to keep a denormalized total in sync).
export function useScoreboard(circleId: string | null, challengeId: string | null) {
  const [events, setEvents] = useState<WithId<ScoringEventDoc>[]>([]);

  useEffect(() => {
    if (!circleId || !challengeId) {
      setEvents([]);
      return;
    }
    return subscribeToScoringEvents(circleId, challengeId, setEvents);
  }, [circleId, challengeId]);

  const totals = useMemo(() => {
    const byTeam: Record<string, number> = {};
    for (const event of events) {
      byTeam[event.teamId] = (byTeam[event.teamId] ?? 0) + event.pointsAwarded;
    }
    return byTeam;
  }, [events]);

  const submittedUserIds = useMemo(() => new Set(events.map((event) => event.userId)), [events]);

  return { events, totals, submittedUserIds };
}
