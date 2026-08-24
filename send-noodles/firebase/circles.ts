import { arrayRemove, arrayUnion, collection, doc, getDoc, runTransaction, setDoc, updateDoc } from "firebase/firestore";

import { firestore } from "./firebaseConfig";
import type { ChallengeDoc, CircleDoc, JoinCodeDoc } from "./types";

// The standard name every account's auto-created solo circle gets — see
// createPersonalCircle below.
export const PERSONAL_CIRCLE_NAME = "Me, Myself & I";

// Unambiguous alphabet — excludes 0/O/1/I/L so a code read aloud or
// typed from a screenshot doesn't get miskeyed.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomCode(length = 6): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

function joinCodeRef(code: string) {
  return doc(firestore, "joinCodes", code);
}

// Uniqueness is checked against the small, dedicated /joinCodes lookup
// collection (a single get-by-id — cheap, and readable by any signed-in
// user) rather than querying /circles directly: circles are member-only
// to read, so a query across circles the caller isn't part of would be
// rejected by firestore.rules.
async function generateUniqueJoinCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const snap = await getDoc(joinCodeRef(code));
    if (!snap.exists()) return code;
  }
  throw new Error("Couldn't generate a unique circle code. Try again.");
}

export async function createCircle(name: string, creatorId: string): Promise<{ circleId: string; joinCode: string }> {
  const trimmedName = name.trim();
  if (!trimmedName) throw new Error("Give your circle a name.");

  const joinCode = await generateUniqueJoinCode();
  const circleDocRef = doc(collection(firestore, "circles"));
  const circle: CircleDoc = {
    name: trimmedName,
    creatorId,
    members: [creatorId],
    usedPrompts: [],
    activeChallengeId: null,
    joinCode,
  };

  // Both docs are written together in a transaction so the circle and
  // its lookup entry can never go out of sync — re-checks the code is
  // still free right before claiming it, in case another client grabbed
  // it in the gap since generateUniqueJoinCode's check above.
  await runTransaction(firestore, async (transaction) => {
    const existing = await transaction.get(joinCodeRef(joinCode));
    if (existing.exists()) throw new Error("That code was just claimed by someone else — try again.");
    transaction.set(circleDocRef, circle);
    transaction.set(joinCodeRef(joinCode), { circleId: circleDocRef.id } satisfies JoinCodeDoc);
  });

  return { circleId: circleDocRef.id, joinCode };
}

// Called once, right after a new account's profile doc is created (see
// signUpWithEmail) — every user gets exactly one of these, named the
// same for everyone, with the same standard rules (see
// src/constants/personalCircleRules.ts). Deliberately skips the
// /joinCodes lookup entry createCircle writes: with no code to look up,
// joinCircleByCode can never resolve anyone into this circle, so it
// stays solo by construction (isSelfJoin in firestore.rules blocks it
// too, defensively, in case a code ever leaked some other way).
export async function createPersonalCircle(userId: string): Promise<string> {
  const circleDocRef = doc(collection(firestore, "circles"));
  const circle: CircleDoc = {
    name: PERSONAL_CIRCLE_NAME,
    creatorId: userId,
    members: [userId],
    usedPrompts: [],
    activeChallengeId: null,
    joinCode: "",
    isPersonal: true,
  };
  await setDoc(circleDocRef, circle);
  return circleDocRef.id;
}

export async function joinCircleByCode(code: string, userId: string): Promise<string> {
  const normalizedCode = code.trim().toUpperCase();
  if (!normalizedCode) throw new Error("Enter a circle code.");

  const codeSnap = await getDoc(joinCodeRef(normalizedCode));
  if (!codeSnap.exists()) throw new Error("No circle found with that code.");
  const { circleId } = codeSnap.data() as JoinCodeDoc;

  // arrayUnion is idempotent, so no need to check membership first —
  // and doing so would fail anyway, since reading a circle you're not
  // yet a member of isn't allowed until this write makes you one.
  await updateDoc(doc(firestore, "circles", circleId), { members: arrayUnion(userId) });

  // If a challenge is currently in progress, the new member gets the
  // same pending invite to it any existing member would see — added
  // once here rather than left out just because they joined the circle
  // after the challenge was already proposed. Safe to read the circle
  // now: the write above just made this user a member.
  const circleSnap = await getDoc(doc(firestore, "circles", circleId));
  const circle = circleSnap.data() as CircleDoc | undefined;
  if (circle?.activeChallengeId) {
    const challengeDocRef = doc(firestore, "circles", circleId, "challenges", circle.activeChallengeId);
    const challengeSnap = await getDoc(challengeDocRef);
    if (challengeSnap.exists()) {
      const challenge = challengeSnap.data() as ChallengeDoc;
      if (challenge.status !== "completed" && !challenge.agreementStatus[userId]) {
        await updateDoc(challengeDocRef, {
          [`agreementStatus.${userId}`]: { status: "pending", timestamp: null },
        });
      }
    }
  }

  return circleId;
}

// A member leaving of their own accord — unlike removeMember, there's
// no creator-only check here; anyone, including the creator, can leave.
// If the creator leaves and other members remain, admin passes to one
// of them at random rather than leaving the circle without anyone who
// can see the join code or remove members. Doesn't touch any
// in-progress challenge's teams/agreementStatus; a departed member's
// old team slot just stops getting submissions.
export async function leaveCircle(circleId: string, userId: string): Promise<void> {
  const circleDocRef = doc(firestore, "circles", circleId);
  const snap = await getDoc(circleDocRef);
  if (!snap.exists()) throw new Error("Circle not found.");

  const circle = snap.data() as CircleDoc;
  if (!circle.members.includes(userId)) throw new Error("You're not a member of this circle.");

  const remainingMembers = circle.members.filter((memberId) => memberId !== userId);
  const isCreatorLeaving = circle.creatorId === userId;

  if (isCreatorLeaving && remainingMembers.length > 0) {
    const newCreatorId = remainingMembers[Math.floor(Math.random() * remainingMembers.length)];
    await updateDoc(circleDocRef, { members: arrayRemove(userId), creatorId: newCreatorId });
  } else {
    await updateDoc(circleDocRef, { members: arrayRemove(userId) });
  }
}

export async function removeMember(circleId: string, requesterId: string, memberIdToRemove: string): Promise<void> {
  const circleDocRef = doc(firestore, "circles", circleId);
  const snap = await getDoc(circleDocRef);
  if (!snap.exists()) throw new Error("Circle not found.");

  const circle = snap.data() as CircleDoc;
  if (circle.creatorId !== requesterId) throw new Error("Only the circle creator can remove members.");
  if (memberIdToRemove === circle.creatorId) throw new Error("The circle creator can't be removed.");

  await updateDoc(circleDocRef, { members: arrayRemove(memberIdToRemove) });
}
