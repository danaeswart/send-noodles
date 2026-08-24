import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { subscribeToPersonalSnaps, updateSnapWallPlacement, type GallerySnap } from "../../firebase/snaps";
import { FrameKey, WallPhoto } from "../data/wallLayout";
import type { WallPhotoPatch } from "../components/gallery/WallFrame";

const KNOWN_FRAME_KEYS: FrameKey[] = [
  "frame1",
  "frame2",
  "frame3",
  "Frame_First",
  "Frame_Three",
  "Frame_Five",
  "Frame_Seven",
  "Frame_Ten",
  "Frame_Daily_Challenge",
  "Frame_Time_Sensitive_Challenge",
  "Frame_Friend_Challenge",
  "Frame_Weekly_Challenge",
];
const DEFAULT_FRAME: FrameKey = "frame1";

// A snap only reaches the wall through the Memories -> choose a frame
// flow, which always writes a real frameId alongside onWall — this only
// matters as a defensive fallback for stale/inconsistent data.
function toFrameKey(frameId: string | null): FrameKey {
  return KNOWN_FRAME_KEYS.includes(frameId as FrameKey) ? (frameId as FrameKey) : DEFAULT_FRAME;
}

// Snaps that haven't been dragged into place yet (no wallOffset saved)
// need *some* starting position to render at — laid out in a simple
// left-to-right sequence by wall-join order until the user moves them,
// at which point their real position is persisted.
function fallbackPlacement(index: number) {
  return { offset: 30 + index * 220, crossFrac: index % 2 === 0 ? 0.1 : 0.4, size: 170 };
}

export function useGalleryWall(userId: string | null) {
  const [snaps, setSnaps] = useState<GallerySnap[]>([]);
  const refsById = useRef(new Map<string, GallerySnap["ref"]>());

  useEffect(() => {
    if (!userId) {
      setSnaps([]);
      return;
    }
    return subscribeToPersonalSnaps(userId, setSnaps);
  }, [userId]);

  const wallPhotos = useMemo<WallPhoto[]>(() => {
    refsById.current.clear();
    return snaps
      .filter((snap) => snap.onWall)
      .map((snap, index) => {
        refsById.current.set(snap.id, snap.ref);
        const fallback = fallbackPlacement(index);
        return {
          id: snap.id,
          frame: toFrameKey(snap.frameId),
          imageUrl: snap.imageUrl,
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

  // Doesn't touch Memories — just un-curates the photo from the wall,
  // same "onWall" flag the Memories -> choose a frame flow sets to true.
  const removeFromWall = useCallback(async (id: string) => {
    const ref = refsById.current.get(id);
    if (!ref) return;
    await updateSnapWallPlacement(ref, { onWall: false });
  }, []);

  return { wallPhotos, updatePosition, removeFromWall };
}
