import {
  collection,
  collectionGroup,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type DocumentReference,
  type Unsubscribe,
} from "firebase/firestore";

import { firestore } from "./firebaseConfig";
import { addScoringEvent } from "./challenges";
import { recordSnapSent } from "./users";
import { uploadImageToCloudinary } from "../cloudinary/upload";
import type { SnapDoc, WithId } from "./types";

function snapsCol(circleId: string) {
  return collection(firestore, "circles", circleId, "snaps");
}

type SubmitSnapArgs = {
  circleId: string;
  userId: string;
  photoUri: string;
  frameId?: string | null;
  // The circle's active challenge and the sender's team on it, if any —
  // both are optional because a circle member can send a snap at any
  // time. The challenge is just a fun extra: with no active challenge
  // (or the sender not yet on a team for it), the photo still saves and
  // shows up in the circle's snaps, it just doesn't score.
  challengeId?: string | null;
  teamId?: string | null;
};

// Points awarded per snap that counts toward an active challenge.
const POINTS_PER_SNAP = 1;

// Uploads to Cloudinary, then creates the Firestore snap doc, in that
// order, so a failed upload never produces a dangling/incomplete snap
// doc. The challenge/team args are trusted at face value from the
// caller for the UX (avoids blocking a send on a network round-trip
// here), but firestore.rules independently re-verifies server-side that
// the referenced challenge is genuinely active before allowing the
// write to claim it — a stale or spoofed challengeId is rejected, not
// silently scored.
export async function submitSnap({ circleId, userId, photoUri, frameId, challengeId = null, teamId = null }: SubmitSnapArgs) {
  const snapRef = doc(snapsCol(circleId));

  const imageUrl = await uploadImageToCloudinary({
    uri: photoUri,
    publicId: snapRef.id,
    folder: `send-noodles/circles/${circleId}/${userId}`,
  });

  const countsTowardChallenge = !!challengeId && !!teamId;

  const snap: Omit<SnapDoc, "submittedAt"> & { submittedAt: ReturnType<typeof serverTimestamp> } = {
    userId,
    teamId: countsTowardChallenge ? teamId : null,
    challengeId: countsTowardChallenge ? challengeId : null,
    imageUrl,
    frameId: frameId ?? null,
    submittedAt: serverTimestamp(),
    positionIndex: null,
  };
  await setDoc(snapRef, snap);

  if (countsTowardChallenge) {
    await addScoringEvent(circleId, challengeId!, userId, teamId!, "snap_submitted", POINTS_PER_SNAP);
  }

  // Every snap counts toward the sender's lifetime tally, whether or not
  // it scored a challenge point — this is what unlocks milestone frames.
  await recordSnapSent(userId);

  return snapRef.id;
}

export function subscribeToTodaysSnaps(circleId: string, callback: (snaps: WithId<SnapDoc>[]) => void): Unsubscribe {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const q = query(
    snapsCol(circleId),
    where("submittedAt", ">=", Timestamp.fromDate(startOfToday)),
    orderBy("submittedAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...(d.data() as SnapDoc) })));
  });
}

export type GallerySnap = WithId<SnapDoc> & { ref: DocumentReference };

// Every snap a user has ever submitted, across every circle — backs the
// personal Gallery Wall. Requires a Firestore index on the "snaps"
// collection group for the "userId" field; Firestore will throw with a
// direct console link to create it the first time this runs against a
// project that doesn't have it yet. An error handler is required here
// (not just the success callback) — without one, that throw is
// uncaught and trips React Native's red-screen LogBox instead of just
// leaving the Gallery Wall empty until the index finishes building.
export function subscribeToUserSnaps(userId: string, callback: (snaps: GallerySnap[]) => void): Unsubscribe {
  const q = query(collectionGroup(firestore, "snaps"), where("userId", "==", userId));
  return onSnapshot(
    q,
    (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ref: d.ref, ...(d.data() as SnapDoc) })));
    },
    (error) => {
      console.warn("[Gallery Wall] couldn't load snaps — Firestore index may still be building:", error.message);
      callback([]);
    }
  );
}

export type WallPlacementPatch = Partial<Pick<SnapDoc, "positionIndex" | "wallOffset" | "wallCrossFrac" | "wallSize">>;

// The only mutation ever allowed on a snap doc after creation — moving
// it around the Gallery Wall. firestore.rules restricts updates to
// exactly these fields so the rest of the doc stays write-once.
export async function updateSnapWallPlacement(snapRef: DocumentReference, patch: WallPlacementPatch) {
  await updateDoc(snapRef, patch);
}
