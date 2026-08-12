import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentReference,
  type Unsubscribe,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { firestore, storage } from "./firebaseConfig";
import { addScoringEvent } from "./challenges";
import type { ChallengeDoc, SnapDoc, WithId } from "./types";

function snapsCol(circleId: string, challengeId: string) {
  return collection(firestore, "circles", circleId, "challenges", challengeId, "snaps");
}

function challengeRef(circleId: string, challengeId: string) {
  return doc(firestore, "circles", circleId, "challenges", challengeId);
}

type SubmitSnapArgs = {
  circleId: string;
  challengeId: string;
  userId: string;
  teamId: string;
  photoUri: string;
  frameId?: string | null;
};

// Points awarded per accepted snap. The brief only specifies *how*
// scores must be tracked (a scoringEvents doc per event, summed
// client-side) — not the actual point values, so this is a simple flat
// default; tune per-eventType if/when real scoring rules are decided.
const POINTS_PER_SNAP = 10;

// Uploads to Storage, then creates the Firestore snap doc, then logs a
// scoringEvent — in that order, so a failed upload never produces a
// dangling/incomplete snap doc. Rejects client-side if the challenge
// isn't active, or (for time_sensitive challenges) if endsAt has
// already passed — mirrors the server-side check in firestore.rules.
export async function submitSnap({ circleId, challengeId, userId, teamId, photoUri, frameId }: SubmitSnapArgs) {
  const challengeSnap = await getDoc(challengeRef(circleId, challengeId));
  if (!challengeSnap.exists()) throw new Error("Challenge not found.");
  const challenge = challengeSnap.data() as ChallengeDoc;

  if (challenge.status !== "active") {
    throw new Error("This challenge isn't active — nothing to submit to.");
  }
  if (
    challenge.promptType === "time_sensitive" &&
    challenge.timeline.endsAt &&
    challenge.timeline.endsAt.toMillis() <= Date.now()
  ) {
    throw new Error("Time's up — this challenge's window has closed.");
  }

  const snapRef = doc(snapsCol(circleId, challengeId));

  const response = await fetch(photoUri);
  const blob = await response.blob();
  const storagePath = `snaps/users/${userId}/${challengeId}_${snapRef.id}.jpg`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, blob);
  const imageUrl = await getDownloadURL(storageRef);

  const snap: Omit<SnapDoc, "submittedAt"> & { submittedAt: ReturnType<typeof serverTimestamp> } = {
    userId,
    teamId,
    imageUrl,
    frameId: frameId ?? null,
    submittedAt: serverTimestamp(),
    positionIndex: null,
  };
  await setDoc(snapRef, snap);

  await addScoringEvent(circleId, challengeId, userId, teamId, "snap_submitted", POINTS_PER_SNAP);

  return snapRef.id;
}

export function subscribeToChallengeSnaps(
  circleId: string,
  challengeId: string,
  callback: (snaps: WithId<SnapDoc>[]) => void
): Unsubscribe {
  const q = query(snapsCol(circleId, challengeId), orderBy("submittedAt", "asc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...(d.data() as SnapDoc) })));
  });
}

export type GallerySnap = WithId<SnapDoc> & { ref: DocumentReference };

// Every snap a user has ever submitted, across every circle/challenge —
// backs the personal Gallery Wall. Requires a Firestore index on the
// "snaps" collection group for the "userId" field; Firestore will
// throw with a direct console link to create it the first time this
// runs against a project that doesn't have it yet.
export function subscribeToUserSnaps(userId: string, callback: (snaps: GallerySnap[]) => void): Unsubscribe {
  const q = query(collectionGroup(firestore, "snaps"), where("userId", "==", userId));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ref: d.ref, ...(d.data() as SnapDoc) })));
  });
}

export type WallPlacementPatch = Partial<Pick<SnapDoc, "positionIndex" | "wallOffset" | "wallCrossFrac" | "wallSize">>;

// The only mutation ever allowed on a snap doc after creation — moving
// it around the Gallery Wall. firestore.rules restricts updates to
// exactly these fields so the rest of the doc stays write-once.
export async function updateSnapWallPlacement(snapRef: DocumentReference, patch: WallPlacementPatch) {
  await updateDoc(snapRef, patch);
}
