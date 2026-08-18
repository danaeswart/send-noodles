// Reward frames shown on the profile page's "Unlocked Frames" row —
// distinct from the Gallery Wall's frame1-3 art (components/gallery/FramedPhoto.tsx),
// which frames individual photos rather than badging an achievement.
// Each entry here is unlocked by firebase/users.ts (snap-count milestones)
// or firebase/challenges.ts (awardChallengeRewards, on a challenge win) and
// stored by id in UserProfile.unlockedFrames.
export type RewardFrameId = "frameFrst" | "frameTen" | "frameWin";

export const FRAME_REWARDS: Record<RewardFrameId, { source: number; label: string }> = {
  frameFrst: { source: require("../../assets/frames/frameFrst.png"), label: "first snap" },
  frameTen: { source: require("../../assets/frames/frameTen.png"), label: "10 snaps" },
  frameWin: { source: require("../../assets/frames/frameWin.png"), label: "challenge win" },
};

export function frameRewardForId(frameId: string) {
  return FRAME_REWARDS[frameId as RewardFrameId];
}
