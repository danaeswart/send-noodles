// Shared types + layout constants for the Gallery Wall — the canonical
// source for both the Firestore-backed data (useGalleryWall) and the
// rendering side (FramedPhoto, WallFrame).

import type { RewardFrameId } from "../constants/frames";

// The Gallery Wall's own 3 decorative frame styles, plus the profile's
// reward-badge frames (see constants/frames.ts) which share the exact
// same hole geometry and are what a user actually picks from when
// adding a snap to the wall.
export type FrameKey = "frame1" | "frame2" | "frame3" | RewardFrameId;

export interface WallPhoto {
  id: string;
  frame: FrameKey;
  imageUrl: string;
  size: number;
  // Position along the wall's scroll axis (the "logical" landscape x-axis —
  // increasing values are revealed as the user scrolls).
  offset: number;
  // Fractional position (0-1) across the wall's cross axis (the landscape
  // y-axis, bounded by screen width once rotated).
  crossFrac: number;
}

export const WALL_SCROLL_LENGTH = 2680;
