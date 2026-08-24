// View model for one card in the Home challenge feed — one per circle
// the signed-in user belongs to. `challenge` is null both while the
// circle has no activeChallengeId at all and when its active challenge
// hasn't reached "active" status yet (still mid-setup/agreement) or has
// already completed — either way, Home shows the same "no active
// challenges" state for it. Typed as just `{ promptText }` rather than
// the full ChallengeDoc since ChallengeCard only ever reads that one
// field — which lets a personal circle's fixed challenge text (see
// PERSONAL_CIRCLE_CHALLENGE_TEXT) stand in here too, without needing a
// real Firestore challenge doc backing it.
export interface HomeChallengeCard {
  circleId: string;
  circleName: string;
  memberIds: string[];
  challenge: { promptText: string } | null;
  illustrationSource: number;
}
