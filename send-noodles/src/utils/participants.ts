import { DEFAULT_AVATAR_SOURCE, faceSourceForId } from "../constants/avatarFaces";
import type { UserProfile, WithId } from "../../firebase/types";

// Looks up a member's fetched profile (see useUserProfiles) and returns
// what a face display needs: their chosen avatar image (falling back to
// the default face while their profile hasn't loaded or they haven't
// picked one) and their initials (first+surname, falling back to the
// userId itself before the profile has loaded).
export function avatarForMember(memberId: string, profiles: WithId<UserProfile>[]): { source: number; initials: string } {
  const profile = profiles.find((p) => p.id === memberId);
  const source = faceSourceForId(profile?.avatarId) ?? DEFAULT_AVATAR_SOURCE;
  const initials =
    profile?.firstName && profile?.surname
      ? `${profile.firstName[0]}${profile.surname[0]}`.toUpperCase()
      : memberId.slice(0, 2).toUpperCase();
  return { source, initials };
}
