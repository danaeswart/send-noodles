import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { subscribeToUserSnaps, updateSnapWallPlacement, type GallerySnap } from "../../firebase/snaps";
import type { FrameKey } from "../data/mockGallery";
import type { WallPhotoPatch } from "../components/gallery/WallFrame";

const KNOWN_FRAME_KEYS: FrameKey[] = ["frame1", "frame2", "frame3"];
const DEFAULT_FRAME: FrameKey = "frame1";

// The Gallery Wall's frame art only has 3 fixed variants (frame1-3), but
// a snap's frameId is whichever profile frame the user had unlocked at
// capture time — not necessarily one of those 3 keys. Falls back to a
// default rather than rendering nothing for a snap with an unrecognized
// frameId.
function toFrameKey(frameId: string | null): FrameKey {
  return KNOWN_FRAME_KEYS.includes(frameId as FrameKey) ? (frameId as FrameKey) : DEFAULT_FRAME;
}

// Snaps that haven't been dragged into place yet (no wallOffset saved)
// need *some* starting position to render at — laid out in a simple
// left-to-right sequence by submission order until the user moves them,
// at which point their real position is persisted.
function fallbackPlacement(index: number) {
  return { offset: 30 + index * 220, crossFrac: index % 2 === 0 ? 0.1 : 0.4, size: 170 };
}

export type WallPhoto = {
  id: string;
  frame: FrameKey;
  size: number;
  offset: number;
  crossFrac: number;
};

export function useGalleryWall(userId: string | null) {
  const [snaps, setSnaps] = useState<GallerySnap[]>([]);
  const refsById = useRef(new Map<string, GallerySnap["ref"]>());

  useEffect(() => {
    if (!userId) {
      setSnaps([]);
      return;
    }
    return subscribeToUserSnaps(userId, setSnaps);
  }, [userId]);

  const wallPhotos = useMemo<WallPhoto[]>(() => {
    refsById.current.clear();
    return snaps.map((snap, index) => {
      refsById.current.set(snap.id, snap.ref);
      const fallback = fallbackPlacement(index);
      return {
        id: snap.id,
        frame: toFrameKey(snap.frameId),
        size: snap.wallSize ?? fallback.size,
        offset: snap.wallOffset ?? fallback.offset,
        crossFrac: snap.wallCrossFrac ?? fallback.crossFrac,
      };
    });
  }, [snaps]);

  const updatePosition = useCallback(async (id: string, patch: WallPhotoPatch) => {
    const ref = refsById.current.get(id);
    if (!ref) return;

    // Firestore's updateDoc rejects explicit `undefined` values, so only
    // the fields WallFrame actually committed get included.
    const firestorePatch: Parameters<typeof updateSnapWallPlacement>[1] = {};
    if (patch.offset !== undefined) {
      firestorePatch.wallOffset = patch.offset;
      // positionIndex tracks placement rank/order per the base schema;
      // horizontal offset is a reasonable proxy for "where in the wall
      // sequence this photo now sits".
      firestorePatch.positionIndex = Math.round(patch.offset);
    }
    if (patch.crossFrac !== undefined) firestorePatch.wallCrossFrac = patch.crossFrac;
    if (patch.size !== undefined) firestorePatch.wallSize = patch.size;

    await updateSnapWallPlacement(ref, firestorePatch);
  }, []);

  return { wallPhotos, updatePosition };
}
