import { addDoc, arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";

import { firestore } from "./firebaseConfig";
import type { ChallengeDoc, CircleDoc } from "./types";

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

async function generateUniqueJoinCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const snap = await getDocs(query(collection(firestore, "circles"), where("joinCode", "==", code)));
    if (snap.empty) return code;
  }
  throw new Error("Couldn't generate a unique circle code. Try again.");
}

export async function createCircle(name: string, creatorId: string): Promise<{ circleId: string; joinCode: string }> {
  const trimmedName = name.trim();
  if (!trimmedName) throw new Error("Give your circle a name.");

  const joinCode = await generateUniqueJoinCode();
  const circle: CircleDoc = {
    name: trimmedName,
    creatorId,
    members: [creatorId],
    usedPrompts: [],
    activeChallengeId: null,
    joinCode,
  };
  const ref = await addDoc(collection(firestore, "circles"), circle);
  return { circleId: ref.id, joinCode };
}

export async function joinCircleByCode(code: string, userId: string): Promise<string> {
  const normalizedCode = code.trim().toUpperCase();
  if (!normalizedCode) throw new Error("Enter a circle code.");

  const snap = await getDocs(query(collection(firestore, "circles"), where("joinCode", "==", normalizedCode)));
  if (snap.empty) throw new Error("No circle found with that code.");

  const circleDoc = snap.docs[0];
  const circle = circleDoc.data() as CircleDoc;
  if (circle.members.includes(userId)) return circleDoc.id;

  await updateDoc(doc(firestore, "circles", circleDoc.id), { members: arrayUnion(userId) });

  // If a challenge is currently in progress, the new member gets the
  // same pending invite to it any existing member would see — added
  // once here rather than left out just because they joined the circle
  // after the challenge was already proposed.
  if (circle.activeChallengeId) {
    const challengeDocRef = doc(firestore, "circles", circleDoc.id, "challenges", circle.activeChallengeId);
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

  return circleDoc.id;
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
