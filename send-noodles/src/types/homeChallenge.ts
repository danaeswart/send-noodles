import type { ChallengeDoc, WithId } from "../../firebase/types";

// View model for one card in the Home challenge feed — one per circle
// the signed-in user belongs to. `challenge` is null both while the
// circle has no activeChallengeId at all and when its active challenge
// hasn't reached "active" status yet (still mid-setup/agreement) or has
// already completed — either way, Home shows the same "no active
// challenges" state for it.
export interface HomeChallengeCard {
  circleId: string;
  circleName: string;
  memberIds: string[];
  challenge: WithId<ChallengeDoc> | null;
  illustrationSource: number;
}
