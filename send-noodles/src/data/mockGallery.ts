export type FrameKey = "frame1" | "frame2" | "frame3";

export interface WallPhoto {
  id: string;
  frame: FrameKey;
  size: number;
  // Position along the wall's scroll axis (the "logical" landscape x-axis —
  // increasing values are revealed as the user scrolls).
  offset: number;
  // Fractional position (0-1) across the wall's cross axis (the landscape
  // y-axis, bounded by screen width once rotated).
  crossFrac: number;
}

// TEMP mock data standing in for a circle's uploaded wall photos.
// Swap for a live Firestore/Cloudinary-backed query later — every photo
// uses the same placeholder image for now (see GalleryWallScreen).
export const mockWallPhotos: WallPhoto[] = [
  { id: "w1", frame: "frame3", size: 190, offset: 30, crossFrac: 0.08 },
  { id: "w2", frame: "frame1", size: 130, offset: 250, crossFrac: 0.04 },
  { id: "w3", frame: "frame2", size: 175, offset: 225, crossFrac: 0.42 },
  { id: "w4", frame: "frame2", size: 160, offset: 545, crossFrac: 0.06 },
  { id: "w5", frame: "frame1", size: 135, offset: 590, crossFrac: 0.5 },
  { id: "w6", frame: "frame3", size: 195, offset: 800, crossFrac: 0.1 },
  { id: "w7", frame: "frame1", size: 125, offset: 1010, crossFrac: 0.48 },
  { id: "w8", frame: "frame2", size: 175, offset: 1050, crossFrac: 0.04 },
  { id: "w9", frame: "frame3", size: 195, offset: 1270, crossFrac: 0.22 },
  { id: "w10", frame: "frame1", size: 140, offset: 1470, crossFrac: 0.06 },
  { id: "w11", frame: "frame2", size: 180, offset: 1500, crossFrac: 0.44 },
  { id: "w12", frame: "frame3", size: 200, offset: 1720, crossFrac: 0.12 },
  { id: "w13", frame: "frame1", size: 130, offset: 1950, crossFrac: 0.5 },
  { id: "w14", frame: "frame2", size: 165, offset: 1990, crossFrac: 0.08 },
  { id: "w15", frame: "frame3", size: 195, offset: 2200, crossFrac: 0.24 },
  { id: "w16", frame: "frame1", size: 135, offset: 2420, crossFrac: 0.46 },
];

export const WALL_SCROLL_LENGTH = 2680;
