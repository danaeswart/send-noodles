import {
  arrayUnion,
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
import type { AgreementState, ChallengeDoc, CircleDoc, PromptDoc, PromptType, ScoringEventDoc, WithId } from "./types";

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

function initialAgreementStatus(members: string[]): ChallengeDoc["agreementStatus"] {
  return Object.fromEntries(members.map((id) => [id, { status: "pending" as AgreementState, timestamp: null }]));
}

// Any circle member can propose a challenge. The prompt itself is picked
// by the system at random — coin-flipped between a "daily" (no timer)
// and "time_sensitive" (timed) prompt, falling back to whichever type
// still has unused prompts if the first pick is exhausted — while the
// proposer sets the terms (duration + prize). The proposer is
// auto-agreed and immediately placed on a random team, same as anyone
// else who accepts via setMemberAgreement; everyone else starts
// "pending" with no team yet. Only allowed when there's no active
// challenge, or the current one has already reached "completed" —
// callers should check that first (see useActiveChallenge) so the UI
// can show a sensible message instead of a thrown error in the common
// case.
export async function proposeChallenge(
  circleId: string,
  userId: string,
  wager: string,
  durationHours: number
): Promise<string> {
  const trimmedWager = wager.trim();
  if (!trimmedWager) throw new Error("Give the challenge a prize.");
  if (!Number.isFinite(durationHours) || durationHours <= 0) throw new Error("Enter a valid duration.");

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

  const firstType: PromptType = Math.random() < 0.5 ? "daily" : "time_sensitive";
  const secondType: PromptType = firstType === "daily" ? "time_sensitive" : "daily";
  const prompt =
    (await fetchRandomUnusedPrompt(firstType, circle.usedPrompts)) ??
    (await fetchRandomUnusedPrompt(secondType, circle.usedPrompts));
  if (!prompt) throw new Error("No prompts left for this circle.");

  const newChallengeRef = doc(challengesCol(circleId));
  const proposerTeam = Math.random() < 0.5 ? "team_1" : "team_2";

  await runTransaction(firestore, async (transaction) => {
    const freshCircleSnap = await transaction.get(circleRef(circleId));
    const freshCircle = freshCircleSnap.data() as CircleDoc;
    if (freshCircle.usedPrompts.includes(prompt.id)) {
      throw new Error("That prompt was just used by someone else — try again.");
    }

    const agreementStatus = initialAgreementStatus(freshCircle.members);
    agreementStatus[userId] = { status: "agreed", timestamp: serverTimestamp() as unknown as Timestamp };

    const teams: Record<string, string[]> = { team_1: [], team_2: [] };
    teams[proposerTeam] = [userId];

    const challenge: ChallengeDoc = {
      promptId: prompt.id,
      promptText: prompt.promptText,
      promptType: prompt.type,
      wager: trimmedWager,
      timeline: { durationHours, startedAt: null, endsAt: null },
      status: "setup",
      teams,
      agreementStatus,
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

// Setting "agreed" also drops the member onto a random team, the first
// time only — re-agreeing after a decline keeps whichever team they
// already landed on rather than reshuffling. Runs as a transaction (read
// current teams, then write) since the random pick depends on the
// member not already being assigned.
export async function setMemberAgreement(
  circleId: string,
  challengeId: string,
  userId: string,
  status: Extract<AgreementState, "agreed" | "declined">
) {
  await runTransaction(firestore, async (transaction) => {
    const snap = await transaction.get(challengeRef(circleId, challengeId));
    if (!snap.exists()) throw new Error("Challenge not found.");
    const challenge = snap.data() as ChallengeDoc;
    if (challenge.status !== "setup") {
      throw new Error("This challenge's wager is already locked in.");
    }

    const update: Record<string, unknown> = {
      [`agreementStatus.${userId}.status`]: status,
      [`agreementStatus.${userId}.timestamp`]: serverTimestamp(),
    };

    if (status === "agreed") {
      const alreadyOnTeam = Object.values(challenge.teams).some((members) => members.includes(userId));
      if (!alreadyOnTeam) {
        const teamKey = Math.random() < 0.5 ? "team_1" : "team_2";
        update[`teams.${teamKey}`] = arrayUnion(userId);
      }
    }

    transaction.update(challengeRef(circleId, challengeId), update);
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
