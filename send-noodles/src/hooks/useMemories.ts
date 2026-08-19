import { useEffect, useMemo, useState } from "react";

import { subscribeToPersonalSnaps, type GallerySnap } from "../../firebase/snaps";

// Every snap a user has ever sent, newest first — backs the Memories
// grid. subscribeToPersonalSnaps has no orderBy (a plain query against
// the user's own subcollection, kept simple), so the sort happens here
// instead.
export function useMemories(userId: string | null) {
  const [snaps, setSnaps] = useState<GallerySnap[]>([]);

  useEffect(() => {
    if (!userId) {
      setSnaps([]);
      return;
    }
    return subscribeToPersonalSnaps(userId, setSnaps);
  }, [userId]);

  const memories = useMemo(
    () =>
      [...snaps].sort(
        // submittedAt is null for an instant on a just-created doc,
        // before serverTimestamp() resolves locally — treat that as
        // "now" so a brand new snap sorts to the top, not the bottom.
        (a, b) => (b.submittedAt?.toMillis() ?? Date.now()) - (a.submittedAt?.toMillis() ?? Date.now())
      ),
    [snaps]
  );

  return memories;
}
