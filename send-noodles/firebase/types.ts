import type { Timestamp } from "firebase/firestore";

// Mirrors the Firestore schema exactly (see project brief). Every doc
// interface here matches a collection path 1:1 — no ORM layer, just
// plain shapes for typed reads/writes via the firebase/*.ts services.

export type WithId<T> = T & { id: string };

// /users/{userId}
export interface UserProfile {
  firstName: string;
  surname: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  // Which of the bundled avatar-style faces (assets/profile-faces/faceN.png)
  // this user picked — null until they choose one on the profile page.
  avatarId: string | null;
  stats: { challengesCompleted: number; streak: number; totalSnaps: number };
  // Reward frame ids unlocked via snap-count milestones and challenge wins
  // (see SNAP_MILESTONES in firebase/users.ts and awardChallengeRewards in
  // firebase/challenges.ts) — each maps to an asset in assets/frames/.
  unlockedFrames: string[];
  createdAt: Timestamp;
}

// /circles/{circleId}
export interface CircleDoc {
  name: string;
  creatorId: string;
  members: string[];
  usedPrompts: string[];
  activeChallengeId: string | null;
  joinCode: string;
}

// /joinCodes/{code} — id is the code itself. A minimal, readable-by-any-
// signed-in-user lookup from an invite code to the circle it belongs
// to, kept separate from /circles (member-only to read) so joining
// doesn't require exposing circles' private data to non-members.
export interface JoinCodeDoc {
  circleId: string;
}

export type PromptType = "daily" | "time_sensitive";
export type ChallengeStatus = "setup" | "locked" | "active" | "completed";
export type AgreementState = "pending" | "agreed" | "declined";

export interface AgreementEntry {
  status: AgreementState;
  timestamp: Timestamp | null;
}

// /circles/{circleId}/challenges/{challengeId}
export interface ChallengeDoc {
  promptId: string;
  promptText: string;
  promptType: PromptType;
  wager: string;
  timeline: {
    durationHours: number | null;
    startedAt: Timestamp | null;
    endsAt: Timestamp | null;
  };
  status: ChallengeStatus;
  teams: Record<string, string[]>; // e.g. { team_1: [userId...], team_2: [...] }
  agreementStatus: Record<string, AgreementEntry>; // keyed by userId
  createdBy: string;
  createdAt: Timestamp;
  // One-time flag set by awardChallengeRewards once challengesCompleted /
  // frameWin have been paid out for this challenge — guards against
  // double-awarding when more than one member's client notices the
  // "completed" status at once. Absent (undefined) is equivalent to false.
  rewardsGranted?: boolean;
}

// /circles/{circleId}/snaps/{snapId}
// Snaps live at the circle level, not nested under a challenge — a
// circle member can send a photo any time. challengeId/teamId are only
// set when there was an active challenge at the moment of posting (and
// the sender was on a team for it); both are null for a plain,
// unscored snap sent just to hang out with the circle. Genuinely
// write-once: nothing about a circle snap is ever edited after
// creation (Gallery Wall placement/frame/onWall live on the sender's
// own PersonalSnapDoc mirror instead, below).
export interface SnapDoc {
  userId: string;
  teamId: string | null;
  challengeId: string | null;
  imageUrl: string;
  submittedAt: Timestamp;
}

// /users/{userId}/snaps/{snapId} — written alongside the circle-scoped
// SnapDoc above, at the same id, every time submitSnap runs (see
// firebase/snaps.ts). This is the sender's own personal copy: every
// photo they've ever sent, to any circle, in one place — what backs
// the Memories grid and the Gallery Wall, independent of which circle
// (or how many) it was actually sent to. A plain single-collection
// query against a user's own subcollection needs no special Firestore
// index, unlike the collectionGroup query this replaced.
export interface PersonalSnapDoc {
  circleId: string;
  imageUrl: string;
  submittedAt: Timestamp;
  frameId: string | null;
  // Integer order/rank of this snap on the user's Gallery Wall; null
  // until the user has placed it. wallOffset/wallCrossFrac/wallSize are
  // additive fields beyond the base schema — the existing Gallery Wall
  // drag UI (WallFrame) needs full 2D placement + size, not just a
  // single index, so positionIndex tracks placement order/rank while
  // these three carry the actual on-wall geometry.
  positionIndex: number | null;
  wallOffset?: number;
  wallCrossFrac?: number;
  wallSize?: number;
  // True once the user has deliberately added this snap to their
  // Gallery Wall (via the Memories -> choose a frame flow) — absent/false
  // snaps still show up in Memories, just not on the wall itself.
  onWall?: boolean;
}

// /circles/{circleId}/challenges/{challengeId}/scoringEvents/{eventId}
export interface ScoringEventDoc {
  userId: string;
  teamId: string;
  eventType: string;
  pointsAwarded: number;
  timestamp: Timestamp;
}

// /prompts/{promptId}
export interface PromptDoc {
  promptText: string;
  type: PromptType;
  timeLimitSeconds: number | null;
  difficulty: string;
  tags: string[];
}
