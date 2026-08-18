// The profile page's avatar-style picker — a fixed set of illustrated
// faces the user chooses from, stored as UserProfile.avatarId ("face1",
// "face2", ...). React Native's require() needs a literal path it can
// resolve at bundle time, so this list can't be generated from a count;
// add a row here (plus the matching PNG in assets/profile-faces/) to grow
// the set.
export type AvatarFaceId = "face1" | "face2" | "face3" | "face4" | "face5" | "face6" | "face7" | "face8";

export const AVATAR_FACES: { id: AvatarFaceId; source: number }[] = [
  { id: "face1", source: require("../../assets/profile-faces/face1.png") },
  { id: "face2", source: require("../../assets/profile-faces/face2.png") },
  { id: "face3", source: require("../../assets/profile-faces/face3.png") },
  { id: "face4", source: require("../../assets/profile-faces/face4.png") },
  { id: "face5", source: require("../../assets/profile-faces/face5.png") },
  { id: "face6", source: require("../../assets/profile-faces/face6.png") },
  { id: "face7", source: require("../../assets/profile-faces/face7.png") },
  { id: "face8", source: require("../../assets/profile-faces/face8.png") },
];

export function faceSourceForId(avatarId: string | null | undefined): number | undefined {
  return AVATAR_FACES.find((f) => f.id === avatarId)?.source;
}

// The fallback shown for a member who hasn't picked an avatar yet (or
// whose profile hasn't loaded in) — face1, the first entry.
export const DEFAULT_AVATAR_SOURCE: number = AVATAR_FACES[0].source;
