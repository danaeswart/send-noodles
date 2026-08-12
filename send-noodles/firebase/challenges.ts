import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  updateDoc,
  addDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";

import { firestore } from "./firebaseConfig";
import { fetchRandomUnusedPrompt } from "./prompts";
import type { AgreementState, ChallengeDoc, CircleDoc, PromptDoc, ScoringEventDoc, WithId } from "./types";

function circleRef(circleId: string) {
  return doc(firestore, "circles", circleId);
}

function challengesCol(circleId: string) {
  return collection(firestore, "circles", circleId, "challenges");
}

function challengeRef(circleId: string, challengeId: string) {
  return doc(firestore, "circles", circleId, "challenges", challengeId);
}

function scoringEventsCol(circleId: string, challengeId: string) {
  return collection(firestore, "circles", circleId, "challenges", challengeId, "scoringEvents");
}

export function subscribeToCircle(
  circleId: string,
  callback: (circle: WithId<CircleDoc> | null) => void
): Unsubscribe {
  return onSnapshot(circleRef(circleId), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...(snap.data() as CircleDoc) } : null);
  });
}

export function subscribeToMyCircles(
  userId: string,
  callback: (circles: WithId<CircleDoc>[]) => void
): Unsubscribe {
  const q = query(collection(firestore, "circles"), where("members", "array-contains", userId));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...(d.data() as CircleDoc) })));
  });
}

export function subscribeToChallenge(
  circleId: string,
  challengeId: string,
  callback: (challenge: WithId<ChallengeDoc> | null) => void
): Unsubscribe {
  return onSnapshot(challengeRef(circleId, challengeId), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...(snap.data() as ChallengeDoc) } : null);
  });
}

export function subscribeToScoringEvents(
  circleId: string,
  challengeId: string,
  callback: (events: WithId<ScoringEventDoc>[]) => void
): Unsubscribe {
  const q = query(scoringEventsCol(circleId, challengeId), orderBy("timestamp", "asc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...(d.data() as ScoringEventDoc) })));
  });
}

export async function addScoringEvent(
  circleId: string,
  challengeId: string,
  userId: string,
  teamId: string,
  eventType: string,
  pointsAwarded: number
) {
  const event: Omit<ScoringEventDoc, "timestamp"> & { timestamp: ReturnType<typeof serverTimestamp> } = {
    userId,
    teamId,
    eventType,
    pointsAwarded,
    timestamp: serverTimestamp(),
  };
  await addDoc(scoringEventsCol(circleId, challengeId), event);
}

// Splits circle members evenly into two teams. No team-picker UI exists
// yet, so this is a simple, deterministic default (alternating members
// into team_1/team_2) — swap for a real assignment flow later if one
// gets built; the rest of the agreement/scoring logic doesn't care how
// `teams` was populated.
function splitIntoTeams(members: string[]): Record<string, string[]> {
  const teams: Record<string, string[]> = { team_1: [], team_2: [] };
  members.forEach((memberId, index) => {
    const teamKey = index % 2 === 0 ? "team_1" : "team_2";
    teams[teamKey].push(memberId);
  });
  return teams;
}

function initialAgreementStatus(members: string[]): ChallengeDoc["agreementStatus"] {
  return Object.fromEntries(members.map((id) => [id, { status: "pending" as AgreementState, timestamp: null }]));
}

// Pulls a new random, not-yet-used daily prompt for this circle, creates
// its challenge subdocument in "setup" state, and points the circle's
// activeChallengeId at it. Only allowed when there's no active challenge
// yet, or the current one has already reached "completed" — callers
// should check that first (see useActiveChallenge) so the UI can show a
// sensible message instead of a thrown error in the common case.
export async function pullNextDailyChallenge(circleId: string, userId: string): Promise<string> {
  const circleSnap = await getDoc(circleRef(circleId));
  if (!circleSnap.exists()) throw new Error("Circle not found.");
  const circle = circleSnap.data() as CircleDoc;

  if (circle.activeChallengeId) {
    const activeSnap = await getDoc(challengeRef(circleId, circle.activeChallengeId));
    const active = activeSnap.data() as ChallengeDoc | undefined;
    if (active && active.status !== "completed") {
      throw new Error("The current challenge hasn't finished yet.");
    }
  }

  const prompt = await fetchRandomUnusedPrompt("daily", circle.usedPrompts);
  if (!prompt) throw new Error("No more daily prompts left for this circle.");

  const newChallengeRef = doc(challengesCol(circleId));

  await runTransaction(firestore, async (transaction) => {
    const freshCircleSnap = await transaction.get(circleRef(circleId));
    const freshCircle = freshCircleSnap.data() as CircleDoc;
    if (freshCircle.usedPrompts.includes(prompt.id)) {
      throw new Error("That prompt was just used by someone else — try again.");
    }

    const challenge: ChallengeDoc = {
      promptId: prompt.id,
      promptText: prompt.promptText,
      promptType: "daily",
      // Sensible defaults so the Lobby has something to agree to right
      // away — any member can still edit both via proposeWagerAndTimeline
      // while status is "setup".
      wager: "loser buys a round of drinks",
      timeline: { durationHours: 24, startedAt: null, endsAt: null },
      status: "setup",
      teams: splitIntoTeams(freshCircle.members),
      agreementStatus: initialAgreementStatus(freshCircle.members),
      createdBy: userId,
      createdAt: serverTimestamp() as unknown as Timestamp,
    };

    transaction.set(newChallengeRef, challenge);
    transaction.update(circleRef(circleId), {
      usedPrompts: [...freshCircle.usedPrompts, prompt.id],
      activeChallengeId: newChallengeRef.id,
    });
  });

  return newChallengeRef.id;
}

// Any member can propose/edit the wager + duration while status is
// "setup". Editing resets every other member's agreement back to
// "pending" and auto-marks the editor as "agreed".
export async function proposeWagerAndTimeline(
  circleId: string,
  challengeId: string,
  editorUserId: string,
  members: string[],
  wager: string,
  durationHours: number
) {
  const snap = await getDoc(challengeRef(circleId, challengeId));
  if (!snap.exists()) throw new Error("Challenge not found.");
  const challenge = snap.data() as ChallengeDoc;
  if (challenge.status !== "setup") {
    throw new Error("This challenge's wager is already locked in.");
  }

  const agreementStatus: ChallengeDoc["agreementStatus"] = {};
  members.forEach((memberId) => {
    agreementStatus[memberId] =
      memberId === editorUserId
        ? { status: "agreed", timestamp: serverTimestamp() as unknown as Timestamp }
        : { status: "pending", timestamp: null };
  });

  await updateDoc(challengeRef(circleId, challengeId), {
    wager,
    "timeline.durationHours": durationHours,
    agreementStatus,
  });
}

export async function setMemberAgreement(
  circleId: string,
  challengeId: string,
  userId: string,
  status: Extract<AgreementState, "agreed" | "declined">
) {
  const snap = await getDoc(challengeRef(circleId, challengeId));
  if (!snap.exists()) throw new Error("Challenge not found.");
  const challenge = snap.data() as ChallengeDoc;
  if (challenge.status !== "setup") {
    throw new Error("This challenge's wager is already locked in.");
  }

  await updateDoc(challengeRef(circleId, challengeId), {
    [`agreementStatus.${userId}.status`]: status,
    [`agreementStatus.${userId}.timestamp`]: serverTimestamp(),
  });
}

// Call after every fresh challenge snapshot (see useChallengeAgreement).
// Idempotent — safe for multiple members' clients to call at once.
export async function maybeLockChallenge(circleId: string, challengeId: string, challenge: ChallengeDoc) {
  if (challenge.status !== "setup") return;

  const members = Object.keys(challenge.agreementStatus);
  const allAgreed = members.length > 0 && members.every((id) => challenge.agreementStatus[id].status === "agreed");
  if (!allAgreed) return;

  if (challenge.promptType === "daily") {
    // Daily prompts have no separate "start the timer" gesture — locking
    // in the wager immediately starts the challenge.
    await updateDoc(challengeRef(circleId, challengeId), {
      status: "active",
      "timeline.startedAt": serverTimestamp(),
    });
  } else {
    await updateDoc(challengeRef(circleId, challengeId), { status: "locked" });
  }
}

// Explicit "go" for a time-sensitive challenge, once its wager is locked.
// endsAt is computed from the prompt's timeLimitSeconds, per the brief.
export async function startTimeSensitiveChallenge(circleId: string, challengeId: string) {
  const snap = await getDoc(challengeRef(circleId, challengeId));
  if (!snap.exists()) throw new Error("Challenge not found.");
  const challenge = snap.data() as ChallengeDoc;
  if (challenge.status !== "locked") throw new Error("This challenge isn't locked in yet.");
  if (challenge.promptType !== "time_sensitive") throw new Error("Only time-sensitive challenges use a timer.");

  const promptSnap = await getDoc(doc(firestore, "prompts", challenge.promptId));
  if (!promptSnap.exists()) throw new Error("Prompt not found.");
  const prompt = promptSnap.data() as PromptDoc;
  if (!prompt.timeLimitSeconds) throw new Error("This prompt has no time limit set.");

  const now = Timestamp.now();
  const endsAt = Timestamp.fromMillis(now.toMillis() + prompt.timeLimitSeconds * 1000);

  await updateDoc(challengeRef(circleId, challengeId), {
    status: "active",
    "timeline.startedAt": now,
    "timeline.endsAt": endsAt,
  });
}

// No Cloud Functions on the Spark plan, so nothing transitions a
// challenge to "completed" the instant it should. Instead, call this
// from the same listener that drives the Lobby/scoreboard — whichever
// member's client happens to be looking flips the status once the
// condition is actually met.
export async function checkAndCompleteChallengeIfDone(
  circleId: string,
  challengeId: string,
  challenge: ChallengeDoc,
  submittedCount: number
) {
  if (challenge.status !== "active") return;

  const totalMembers = Object.values(challenge.teams).reduce((sum, team) => sum + team.length, 0);
  const timeExpired =
    challenge.promptType === "time_sensitive" &&
    !!challenge.timeline.endsAt &&
    challenge.timeline.endsAt.toMillis() <= Date.now();
  const everyoneSubmitted = totalMembers > 0 && submittedCount >= totalMembers;

  if (timeExpired || everyoneSubmitted) {
    await updateDoc(challengeRef(circleId, challengeId), { status: "completed" });
  }
}
