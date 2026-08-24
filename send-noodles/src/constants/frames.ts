// Reward frames shown on the profile page's "Unlocked Frames" row —
// distinct from the Gallery Wall's frame1-3 art (components/gallery/FramedPhoto.tsx),
// which frames individual photos rather than badging an achievement.
// Each entry here is unlocked by firebase/users.ts (the snap-count rule) or
// firebase/challenges.ts (the challenge-completion rules), and stored on
// UserProfile.frameUnlocks. This file is the single place that defines
// *what* unlocks *which* frame and *why* — add a rule here plus a matching
// PNG in assets/frames/ to extend the reward system.
export type RewardFrameId =
  | "Frame_First"
  | "Frame_Three"
  | "Frame_Five"
  | "Frame_Seven"
  | "Frame_Ten"
  | "Frame_Daily_Challenge"
  | "Frame_Time_Sensitive_Challenge"
  | "Frame_Friend_Challenge"
  | "Frame_Weekly_Challenge";

export const FRAME_REWARDS: Record<RewardFrameId, { source: number; label: string; message: string }> = {
  Frame_First: {
    source: require("../../assets/frames/Frame_First.png"),
    label: "first snap",
    message: "You sent your first snap.",
  },
  Frame_Three: {
    source: require("../../assets/frames/Frame_Three.png"),
    label: "3 snaps",
    message: "You sent 3 snaps.",
  },
  Frame_Five: {
    // Filename is lowercase "five" on disk (Frame_five.png) — kept as-is
    // rather than renamed, since a case-sensitive bundler (Metro on a
    // Mac/Linux machine) needs this require path to match it exactly.
    source: require("../../assets/frames/Frame_five.png"),
    label: "5 snaps",
    message: "You sent 5 snaps.",
  },
  Frame_Seven: {
    source: require("../../assets/frames/Frame_Seven.png"),
    label: "7 snaps",
    message: "You sent 7 snaps.",
  },
  Frame_Ten: {
    source: require("../../assets/frames/Frame_Ten.png"),
    label: "10 challenges",
    message: "You completed 10 challenges.",
  },
  Frame_Daily_Challenge: {
    source: require("../../assets/frames/Frame_Daily_Challenge.png"),
    label: "daily challenge",
    message: "You completed a Daily Challenge.",
  },
  Frame_Time_Sensitive_Challenge: {
    source: require("../../assets/frames/Frame_Time_Sensitive_Challenge.png"),
    label: "time-sensitive challenge",
    message: "You completed a Time-Sensitive Challenge.",
  },
  Frame_Friend_Challenge: {
    source: require("../../assets/frames/Frame_Friend_Challenge.png"),
    label: "friend challenge",
    message: "You completed a challenge with a friend.",
  },
  Frame_Weekly_Challenge: {
    source: require("../../assets/frames/Frame_Weekly_Challenge.png"),
    label: "weekly challenge",
    message: "You completed a Weekly Challenge (7+ days).",
  },
};

export function frameRewardForId(frameId: string) {
  return FRAME_REWARDS[frameId as RewardFrameId];
}

// Lifetime snap-count milestones, checked by recordSnapSent every time a
// snap is sent (see firebase/users.ts).
export const SNAP_MILESTONES: { count: number; frameId: RewardFrameId }[] = [
  { count: 1, frameId: "Frame_First" },
  { count: 3, frameId: "Frame_Three" },
  { count: 5, frameId: "Frame_Five" },
  { count: 7, frameId: "Frame_Seven" },
];

// Lifetime challenges-completed-count milestones, checked by
// awardChallengeRewards every time a challenge completes (see
// firebase/challenges.ts). Completing a challenge counts toward this
// regardless of whether the participant's team won.
export const CHALLENGE_COMPLETION_MILESTONES: { count: number; frameId: RewardFrameId }[] = [
  { count: 10, frameId: "Frame_Ten" },
];

// One-off rules also checked by awardChallengeRewards on every
// completion, one-time per participant (each keeps its own place in a
// participant's frameUnlocks once unlocked, so it's never re-evaluated
// after that). A "weekly" challenge is a daily-prompt challenge whose
// proposer set the duration to 7+ days; a "friend" challenge is one
// where the participant's own team had another member alongside them.
export const WEEKLY_CHALLENGE_MIN_HOURS = 7 * 24;
export const FRIEND_CHALLENGE_MIN_TEAM_SIZE = 2;
