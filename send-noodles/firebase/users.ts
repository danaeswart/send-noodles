import {
  collection,
  doc,
  documentId,
  onSnapshot,
  query,
  runTransaction,
  Timestamp,
  where,
  type Unsubscribe,
} from "firebase/firestore";

import { firestore } from "./firebaseConfig";
import type { FrameUnlock, UserProfile, WithId } from "./types";
import { FRAME_REWARDS, SNAP_MILESTONES } from "../src/constants/frames";

function userRef(userId: string) {
  return doc(firestore, "users", userId);
}

export function subscribeToUserProfile(
  userId: string,
  callback: (profile: WithId<UserProfile> | null) => void
): Unsubscribe {
  return onSnapshot(userRef(userId), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...(snap.data() as UserProfile) } : null);
  });
}

// Firestore's "in" operator caps at 30 values — fine for a circle's
// member list at this app's scale. An empty array is invalid for "in"
// (Firestore throws), so that case short-circuits to an empty result
// instead of querying.
export function subscribeToUsers(
  userIds: string[],
  callback: (profiles: WithId<UserProfile>[]) => void
): Unsubscribe {
  if (userIds.length === 0) {
    callback([]);
    return () => {};
  }

  const q = query(collection(firestore, "users"), where(documentId(), "in", userIds.slice(0, 30)));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...(d.data() as UserProfile) })));
  });
}

export async function setAvatarId(userId: string, avatarId: string) {
  await runTransaction(firestore, async (transaction) => {
    const snap = await transaction.get(userRef(userId));
    if (!snap.exists()) return;
    transaction.update(userRef(userId), { avatarId });
  });
}

// Called once per snap send, regardless of whether it counted toward a
// challenge — every snap bumps the sender's lifetime tally, shown on the
// profile page under "Snaps", and unlocks any milestone frame just
// crossed (see SNAP_MILESTONES in src/constants/frames.ts). Runs as a
// transaction since it's a read-then-increment on the user's own doc
// (safe to call rapidly without racing itself).
export async function recordSnapSent(userId: string): Promise<void> {
  await runTransaction(firestore, async (transaction) => {
    const snap = await transaction.get(userRef(userId));
    if (!snap.exists()) return;
    const profile = snap.data() as UserProfile;

    const totalSnaps = (profile.stats?.totalSnaps ?? 0) + 1;
    const frameUnlocks = profile.frameUnlocks ?? [];
    const unlockedIds = new Set(frameUnlocks.map((f) => f.frameId));
    const newUnlocks: FrameUnlock[] = [];
    for (const milestone of SNAP_MILESTONES) {
      if (totalSnaps >= milestone.count && !unlockedIds.has(milestone.frameId)) {
        unlockedIds.add(milestone.frameId);
        newUnlocks.push({
          frameId: milestone.frameId,
          unlockedAt: Timestamp.now(),
          reason: FRAME_REWARDS[milestone.frameId].message,
        });
      }
    }

    transaction.update(userRef(userId), {
      "stats.totalSnaps": totalSnaps,
      frameUnlocks: [...frameUnlocks, ...newUnlocks],
    });
  });
}
