export interface ChallengeParticipant {
  id: string;
  initials: string;
}

export interface Challenge {
  id: string;
  circleId: string;
  circleName: string;
  prompt: string;
  endsAt: string; // ISO timestamp
  participants: ChallengeParticipant[];
  participantOverflowCount: number;
  
  // Left undefined for now — IllustrationSlot renders a placeholder
  // until you drop a real asset in assets/illustrations and pass
  // require("../../assets/illustrations/your-file.png") here.
  illustrationSource?: number;
}

// TEMP mock data, shaped the way a Firestore "challenges" doc is
// expected to look (see pitch doc schema: prompts keyed to teams).
// Swap this array for a live Firestore query — keyed on the current
// user's circle memberships — once the backend exists. ChallengeCard's
// props contract stays identical either way.
export const mockChallenges: Challenge[] = [
  {
    id: "c1",
    circleId: "circle_uxgirls",
    circleName: "UX girls",
    illustrationSource: require("../../assets/illustrations/noodleBowl.png"),
    prompt: "find and share green things.",
    endsAt: new Date(Date.now() + 4 * 60 * 60 * 1000 + 23 * 60 * 1000).toISOString(),
    participants: [
      { id: "u1", initials: "JM" },
      { id: "u2", initials: "AS" },
      { id: "u3", initials: "KP" },
    ],
    participantOverflowCount: 3,
  },
  {
    id: "c2",
    circleId: "circle_flatmates",
    circleName: "The Flatmates",
    prompt: "capture something round.",
    endsAt: new Date(Date.now() + 1 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
    participants: [
      { id: "u4", initials: "DB" },
      { id: "u5", initials: "RT" },
    ],
    participantOverflowCount: 1,
  },
  {
    id: "c3",
    circleId: "circle_thesis",
    circleName: "Thesis Support Group",
    prompt: "snap your workspace, right now.",
    endsAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    participants: [{ id: "u6", initials: "NF" }],
    participantOverflowCount: 0,
  },
];
