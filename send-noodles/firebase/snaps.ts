import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentReference,
  type Unsubscribe,
} from "firebase/firestore";

import { firestore } from "./firebaseConfig";
import { addScoringEvent } from "./challenges";
import { recordSnapSent } from "./users";
import { uploadImageToCloudinary } from "../cloudinary/upload";
import type { PersonalSnapDoc, SnapDoc, WithId } from "./types";

function snapsCol(circleId: string) {
  return collection(firestore, "circles", circleId, "snaps");
}

function personalSnapsCol(userId: string) {
  return collection(firestore, "users", userId, "snaps");
}

type SubmitSnapArgs = {
  circleId: string;
  userId: string;
  photoUri: string;
  caption?: string;
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

// Uploads to Cloudinary, then writes two Firestore docs at the same id:
// the circle-scoped SnapDoc (what the circle's feed/challenge scoring
// reads) and a PersonalSnapDoc mirror under the sender's own /users/
// {userId}/snaps (what Memories and the Gallery Wall read — every photo
// this user has ever sent, to any circle, in one place). Both writes go
// through a batch so they land atomically — a snap can't exist in the
// circle's feed without also existing in the sender's personal archive.
// The Cloudinary upload happens first, outside the batch, so a failed
// upload never produces a dangling/incomplete pair of docs.
export async function submitSnap({
  circleId,
  userId,
  photoUri,
  caption = "",
  challengeId = null,
  teamId = null,
}: SubmitSnapArgs) {
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
    caption,
    submittedAt: serverTimestamp(),
  };

  const personalSnap: Omit<PersonalSnapDoc, "submittedAt"> & { submittedAt: ReturnType<typeof serverTimestamp> } = {
    circleId,
    imageUrl,
    caption,
    frameId: null,
    positionIndex: null,
    submittedAt: serverTimestamp(),
  };

  const batch = writeBatch(firestore);
  batch.set(snapRef, snap);
  batch.set(doc(personalSnapsCol(userId), snapRef.id), personalSnap);
  await batch.commit();

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
  return onSnapshot(
    q,
    (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...(d.data() as SnapDoc) })));
    },
    // Leaving this circle (including via account deletion) denies this
    // listener on its next update — expected, so it just goes quiet
    // instead of logging as an uncaught Firestore SDK error.
    () => callback([])
  );
}

// Every snap ever sent to a circle, newest first — backs the "view all
// snaps" gallery reached from the circle's snaps preview (unlike
// subscribeToTodaysSnaps above, which is scoped to just today).
export function subscribeToCircleSnaps(circleId: string, callback: (snaps: WithId<SnapDoc>[]) => void): Unsubscribe {
  const q = query(snapsCol(circleId), orderBy("submittedAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...(d.data() as SnapDoc) })));
    },
    () => callback([])
  );
}

export type GallerySnap = WithId<PersonalSnapDoc> & { ref: DocumentReference };

// Every snap a user has ever submitted, across every circle — backs
// Memories and the personal Gallery Wall. A plain query against the
// user's own /users/{userId}/snaps subcollection, so (unlike the
// collectionGroup query this used to be) it needs no special Firestore
// index and works the first time against any project.
export function subscribeToPersonalSnaps(userId: string, callback: (snaps: GallerySnap[]) => void): Unsubscribe {
  const q = query(personalSnapsCol(userId));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ref: d.ref, ...(d.data() as PersonalSnapDoc) })));
  });
}

export type WallPlacementPatch = Partial<
  Pick<PersonalSnapDoc, "positionIndex" | "wallOffset" | "wallCrossFrac" | "wallSize" | "frameId" | "onWall">
>;

// The only mutations ever allowed on a personal snap doc after
// creation — moving it around the Gallery Wall, picking its frame, and
// adding/removing it from the wall. firestore.rules restricts updates
// to exactly these fields so the rest of the doc stays write-once.
export async function updateSnapWallPlacement(snapRef: DocumentReference, patch: WallPlacementPatch) {
  await updateDoc(snapRef, patch);
}

// Called from the Memories -> choose a frame flow. Deliberately leaves
// wallOffset/wallCrossFrac/wallSize unset — useGalleryWall falls back to
// a reasonable auto-layout position for any snap that doesn't have an
// explicit one yet, same as it already does for positionIndex.
export async function addSnapToWall(snapRef: DocumentReference, frameId: string) {
  await updateSnapWallPlacement(snapRef, { frameId, onWall: true });
}
