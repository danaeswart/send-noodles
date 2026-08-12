import type { Timestamp } from "firebase/firestore";

// Mirrors the Firestore schema exactly (see project brief). Every doc
// interface here matches a collection path 1:1 — no ORM layer, just
// plain shapes for typed reads/writes via the firebase/*.ts services.

export type WithId<T> = T & { id: string };

// /users/{userId}
export interface UserProfile {
  displayName: string;
  email: string;
  avatarUrl: string | null;
  stats: { challengesCompleted: number; streak: number };
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
}

// /circles/{circleId}/challenges/{challengeId}/snaps/{snapId}
export interface SnapDoc {
  userId: string;
  teamId: string;
  imageUrl: string;
  frameId: string | null;
  submittedAt: Timestamp;
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
