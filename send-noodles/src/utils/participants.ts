import type { ChallengeParticipant } from "../data/mockChallenges";

// No display-name/avatar lookups are wired up yet, so member avatars
// fall back to the first two characters of their userId — swap for a
// real /users/{id} profile fetch once that's needed elsewhere too.
export function toParticipants(userIds: string[]): ChallengeParticipant[] {
  return userIds.map((id) => ({ id, initials: id.slice(0, 2).toUpperCase() }));
}
