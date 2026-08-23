import { useEffect, useMemo, useRef, useState } from "react";

import { subscribeToChallenge } from "../../firebase/challenges";
import type { ChallengeDoc, WithId } from "../../firebase/types";
import { randomIllustration } from "../constants/illustrations";
import type { HomeChallengeCard } from "../types/homeChallenge";
import { useMyCircles } from "./useMyCircles";

// One Home card per circle the signed-in user belongs to, each paired
// with that circle's live active challenge. Every circle needs its own
// Firestore subscription since activeChallengeId points at a different
// challenges/{id} subcollection doc per circle — subscriptions are kept
// keyed on "circleId:activeChallengeId" so swapping to a new challenge
// (or losing one) resubscribes cleanly instead of leaking listeners.
export function useHomeChallenges(userId: string | null): HomeChallengeCard[] {
  const circles = useMyCircles(userId);
  const [challenges, setChallenges] = useState<Record<string, WithId<ChallengeDoc> | null>>({});
  const illustrations = useRef<Record<string, number>>({});

  const subscriptionKey = circles.map((c) => `${c.id}:${c.activeChallengeId ?? ""}`).join("|");

  useEffect(() => {
    const unsubscribes = circles
      .filter((c) => !!c.activeChallengeId)
      .map((c) =>
        subscribeToChallenge(c.id, c.activeChallengeId as string, (challenge) => {
          setChallenges((prev) => ({ ...prev, [c.id]: challenge }));
        })
      );
    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriptionKey]);

  return useMemo(
    () =>
      circles.map((circle) => {
        if (illustrations.current[circle.id] === undefined) {
          illustrations.current[circle.id] = randomIllustration();
        }
        const rawChallenge = circle.activeChallengeId ? (challenges[circle.id] ?? null) : null;
        return {
          circleId: circle.id,
          circleName: circle.name,
          memberIds: circle.members,
          challenge: rawChallenge?.status === "active" ? rawChallenge : null,
          illustrationSource: illustrations.current[circle.id],
        };
      }),
    [circles, challenges]
  );
}
