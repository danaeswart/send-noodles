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
import { fetchLockedPromptIds, fetchRandomUnusedPrompt } from "./prompts";
import type {
  AgreementState,
  ChallengeDoc,
  CircleDoc,
  FrameUnlock,
  PromptDoc,
  PromptLockDoc,
  ScoringEventDoc,
  UserProfile,
  WithId,
} from "./types";
import {
  CHALLENGE_COMPLETION_MILESTONES,
  FRAME_REWARDS,
  FRIEND_CHALLENGE_MIN_TEAM_SIZE,
  WEEKLY_CHALLENGE_MIN_HOURS,
  type RewardFrameId,
} from "../src/constants/frames";

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
  return onSnapshot(
    circleRef(circleId),
    (snap) => {
      callback(snap.exists() ? { id: snap.id, ...(snap.data() as CircleDoc) } : null);
    },
    // A member leaving this circle (including via account deletion,
    // which leaves every circle it's in) makes an already-open listener
    // on that circle doc permission-denied on its very next update —
    // expected, not exceptional, so this treats it the same as the
    // circle no longer existing rather than leaving it as an uncaught
    // error logged straight from the Firestore SDK.
    () => callback(null)
  );
}

export function subscribeToMyCircles(
  userId: string,
  callback: (circles: WithId<CircleDoc>[]) => void
): Unsubscribe {
  const q = query(collection(firestore, "circles"), where("members", "array-contains", userId));
  return onSnapshot(
    q,
    (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...(d.data() as CircleDoc) })));
    },
    // Without this, a rules-rejected query (or any other listener
    // error) fails completely silently — the callback just never fires
    // again and the Circles list quietly stays empty/stale forever,
    // with nothing in the UI hinting why.
    (error) => {
      console.warn("[Circles] couldn't load your circles:", error.message);
    }
  );
}

export function subscribeToChallenge(
  circleId: string,
  challengeId: string,
  callback: (challenge: WithId<ChallengeDoc> | null) => void
): Unsubscribe {
  return onSnapshot(
    challengeRef(circleId, challengeId),
    (snap) => {
      callback(snap.exists() ? { id: snap.id, ...(snap.data() as ChallengeDoc) } : null);
    },
    // Same reasoning as subscribeToCircle above — losing circle
    // membership mid-listen denies this too, so treat it as "no
    // challenge to show" instead of an uncaught SDK error.
    () => callback(null)
  );
}

export function subscribeToScoringEvents(
  circleId: string,
  challengeId: string,
  callback: (events: WithId<ScoringEventDoc>[]) => void
): Unsubscribe {
  const q = query(scoringEventsCol(circleId, challengeId), orderBy("timestamp", "asc"));
  return onSnapshot(
    q,
    (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...(d.data() as ScoringEventDoc) })));
    },
    () => callback([])
  );
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

// Balances teams as people join rather than coin-flipping every time —
// whichever team currently has fewer members gets the next one; a tie
// (including the very first join, 0 vs 0) is broken randomly.
function pickBalancedTeam(teams: Record<string, string[]>): string {
  const entries = Object.entries(teams);
  const minSize = Math.min(...entries.map(([, members]) => members.length));
  const smallestTeamIds = entries.filter(([, members]) => members.length === minSize).map(([teamId]) => teamId);
  return smallestTeamIds[Math.floor(Math.random() * smallestTeamIds.length)];
}

// Any circle member can propose a challenge. The prompt itself is picked
// by the system at random from the "daily" prompt bank only — a circle
// challenge always runs on the proposer's own duration/prize terms, so
// it only ever draws from prompts with no built-in timer of their own.
// "time_sensitive" prompts carry a fixed timeLimitSeconds meant for a
// separate, quick timed action elsewhere in the app, not for a
// multi-day circle challenge, so they're never candidates here. The
// proposer sets the terms (duration + prize), and is
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

  // A prompt already running as someone else's challenge is off-limits
  // here too, on top of this circle's own usedPrompts — otherwise two
  // circles could end up racing through the exact same prompt at once.
  const lockedPromptIds = await fetchLockedPromptIds();
  const excludedPromptIds = [...circle.usedPrompts, ...lockedPromptIds];

  const prompt = await fetchRandomUnusedPrompt("daily", excludedPromptIds);
  if (!prompt) throw new Error("No daily prompts left for this circle.");

  const newChallengeRef = doc(challengesCol(circleId));
  const promptLockRef = doc(firestore, "promptLocks", prompt.id);
  const proposerTeam = pickBalancedTeam({ team_1: [], team_2: [] });

  await runTransaction(firestore, async (transaction) => {
    const freshCircleSnap = await transaction.get(circleRef(circleId));
    const freshCircle = freshCircleSnap.data() as CircleDoc;
    if (freshCircle.usedPrompts.includes(prompt.id)) {
      throw new Error("That prompt was just used by someone else — try again.");
    }

    // Re-checked inside the transaction, not just via the fetch above —
    // another circle's proposeChallenge could have claimed this exact
    // prompt in the gap since fetchLockedPromptIds ran.
    const lockSnap = await transaction.get(promptLockRef);
    if (lockSnap.exists()) {
      throw new Error("That prompt just got claimed by another circle — try again.");
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

    const promptLock: PromptLockDoc = { circleId, challengeId: newChallengeRef.id };

    transaction.set(newChallengeRef, challenge);
    transaction.set(promptLockRef, promptLock);
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

// Setting "agreed" also drops the member onto whichever team is
// currently smaller (see pickBalancedTeam), the first time only —
// re-agreeing after a decline keeps whichever team they already landed
// on rather than reshuffling. Runs as a transaction (read current teams,
// then write) since the pick depends on each team's current size.
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
        const teamKey = pickBalancedTeam(challenge.teams);
        update[`teams.${teamKey}`] = arrayUnion(userId);
      }
    }

    transaction.update(challengeRef(circleId, challengeId), update);
  });
}

// Call after every fresh challenge snapshot (see useChallengeAgreement).
// Idempotent — safe for multiple members' clients to call at once.
//
// Locks once everyone has *responded* (agreed or declined), not once
// everyone has agreed — a decline is a valid, final answer that
// shouldn't block the challenge from starting for whoever did join in.
// Declining just means that member never lands on a team, so their
// snaps to the circle keep working but never score (see submitSnap).
export async function maybeLockChallenge(circleId: string, challengeId: string, challenge: ChallengeDoc) {
  if (challenge.status !== "setup") return;

  const members = Object.keys(challenge.agreementStatus);
  const allResponded = members.length > 0 && members.every((id) => challenge.agreementStatus[id].status !== "pending");
  if (!allResponded) return;

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
//
// Completion is purely time-based: a time_sensitive challenge ends when
// its (short, prompt-driven) endsAt passes, and a daily challenge ends
// when its startedAt + durationHours window closes. This deliberately
// does NOT complete a challenge just because every member has submitted
// at least once — submitSnap has no per-user cap, so members keep
// sending snaps (and scoring points for their team) throughout the
// whole window, not just a single round each.
export async function checkAndCompleteChallengeIfDone(circleId: string, challengeId: string, challenge: ChallengeDoc) {
  if (challenge.status !== "active") return;

  const timeExpired =
    challenge.promptType === "time_sensitive"
      ? !!challenge.timeline.endsAt && challenge.timeline.endsAt.toMillis() <= Date.now()
      : !!challenge.timeline.startedAt &&
        !!challenge.timeline.durationHours &&
        challenge.timeline.startedAt.toMillis() + challenge.timeline.durationHours * 60 * 60 * 1000 <= Date.now();

  if (timeExpired) {
    // Completing the challenge and releasing its prompt lock happen in
    // the same transaction — otherwise a client that crashed between two
    // separate writes could leave the lock stranded, permanently barring
    // every other circle from that prompt even though this challenge is
    // done with it.
    await runTransaction(firestore, async (transaction) => {
      transaction.update(challengeRef(circleId, challengeId), { status: "completed" });
      transaction.delete(doc(firestore, "promptLocks", challenge.promptId));
    });
  }
}

// Figures out which reward frames (if any) a participant newly unlocks by
// completing this challenge — the count milestones (3/7/10 challenges)
// plus the one-off type-based rules, per src/constants/frames.ts. Skips
// any frameId the participant already has. teamSize is the size of the
// team this particular participant was actually on, since a "friend"
// challenge means they had a teammate, not just that the challenge as a
// whole had multiple people across both sides.
function newlyUnlockedChallengeFrames(
  challenge: ChallengeDoc,
  newChallengesCompleted: number,
  teamSize: number,
  alreadyUnlockedIds: Set<string>
): FrameUnlock[] {
  const toGrant = new Set<RewardFrameId>();

  for (const milestone of CHALLENGE_COMPLETION_MILESTONES) {
    if (newChallengesCompleted >= milestone.count) toGrant.add(milestone.frameId);
  }
  if (challenge.promptType === "daily") toGrant.add("Frame_Daily_Challenge");
  if (challenge.promptType === "time_sensitive") toGrant.add("Frame_Time_Sensitive_Challenge");
  if (teamSize >= FRIEND_CHALLENGE_MIN_TEAM_SIZE) toGrant.add("Frame_Friend_Challenge");
  if (challenge.promptType === "daily" && (challenge.timeline.durationHours ?? 0) >= WEEKLY_CHALLENGE_MIN_HOURS) {
    toGrant.add("Frame_Weekly_Challenge");
  }

  const now = Timestamp.now();
  return Array.from(toGrant)
    .filter((frameId) => !alreadyUnlockedIds.has(frameId))
    .map((frameId) => ({ frameId, unlockedAt: now, reason: FRAME_REWARDS[frameId].message }));
}

// Pays out every reward a completed challenge can grant: +1
// stats.challengesCompleted for every participant (both teams, win or
// lose — completion is purely time-based, see
// checkAndCompleteChallengeIfDone), plus whichever reward frames they
// newly cross per newlyUnlockedChallengeFrames above.
//
// The transaction re-checks status/rewardsGranted before writing
// anything, so it's safe to call this from every member's client the
// moment they see status === "completed" — whichever one gets there
// first wins the transaction and the rest no-op against the now-
// committed flag.
export async function awardChallengeRewards(circleId: string, challengeId: string): Promise<void> {
  await runTransaction(firestore, async (transaction) => {
    const challengeSnap = await transaction.get(challengeRef(circleId, challengeId));
    if (!challengeSnap.exists()) return;
    const challenge = challengeSnap.data() as ChallengeDoc;
    if (challenge.status !== "completed" || challenge.rewardsGranted) return;

    const participantIds = Array.from(new Set(Object.values(challenge.teams).flat()));
    const userSnaps = await Promise.all(participantIds.map((id) => transaction.get(doc(firestore, "users", id))));

    participantIds.forEach((userId, i) => {
      const userSnap = userSnaps[i];
      if (!userSnap.exists()) return;
      const profile = userSnap.data() as UserProfile;

      const frameUnlocks = profile.frameUnlocks ?? [];
      const alreadyUnlockedIds = new Set(frameUnlocks.map((f) => f.frameId));
      const teamSize = Object.values(challenge.teams).find((members) => members.includes(userId))?.length ?? 1;
      const newChallengesCompleted = (profile.stats?.challengesCompleted ?? 0) + 1;
      const newUnlocks = newlyUnlockedChallengeFrames(challenge, newChallengesCompleted, teamSize, alreadyUnlockedIds);

      transaction.update(doc(firestore, "users", userId), {
        "stats.challengesCompleted": newChallengesCompleted,
        frameUnlocks: [...frameUnlocks, ...newUnlocks],
      });
    });

    transaction.update(challengeRef(circleId, challengeId), { rewardsGranted: true });
  });
}
