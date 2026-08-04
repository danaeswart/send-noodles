import type { ChallengeParticipant } from "./mockChallenges";

export interface Circle {
  id: string;
  name: string;
  color: string;
  members: number;
  snaps: number;
  challengePrompt: string;
  score: { you: number; them: number };
  week: number;
  weeks: number;
  teamName: string;
  participants: ChallengeParticipant[];
  participantOverflowCount: number;
}

// TEMP mock. Swap for the current user's real circle memberships from
// Firestore once the backend exists.
export const mockCircles: Circle[] = [
  {
    id: "circle_flatwhites",
    name: "flat whites",
    color: "#3F6E66",
    members: 6,
    snaps: 23,
    challengePrompt: "find something green",
    score: { you: 62, them: 38 },
    week: 3,
    weeks: 4,
    teamName: "Team Golden Girls",
    participants: [
      { id: "u1", initials: "AV" },
      { id: "u2", initials: "KR" },
      { id: "u3", initials: "MJ" },
    ],
    participantOverflowCount: 3,
  },
  {
    id: "circle_uxgirls",
    name: "UX girls",
    color: "#B8563A",
    members: 8,
    snaps: 17,
    challengePrompt: "capture a detail from a cafe",
    score: { you: 54, them: 46 },
    week: 2,
    weeks: 4,
    teamName: "Team Sweet Latte",
    participants: [
      { id: "u4", initials: "AS" },
      { id: "u5", initials: "LC" },
      { id: "u6", initials: "NE" },
    ],
    participantOverflowCount: 2,
  },
  {
    id: "circle_flatmates",
    name: "the flatmates",
    color: "#C9B79C",
    members: 4,
    snaps: 12,
    challengePrompt: "shoot something round",
    score: { you: 40, them: 60 },
    week: 1,
    weeks: 4,
    teamName: "Team Home Base",
    participants: [
      { id: "u7", initials: "DL" },
      { id: "u8", initials: "SP" },
      { id: "u9", initials: "JR" },
    ],
    participantOverflowCount: 1,
  },
];
