import { useEffect, useState } from "react";

import { subscribeToUsers } from "../../firebase/users";
import type { UserProfile, WithId } from "../../firebase/types";

export function useUserProfiles(userIds: string[]): WithId<UserProfile>[] {
  const [profiles, setProfiles] = useState<WithId<UserProfile>[]>([]);
  // Keyed on the ids themselves, not the array reference — callers often
  // pass a freshly-sliced/mapped array each render, which would otherwise
  // resubscribe every render even when the actual member set is unchanged.
  const key = [...userIds].sort().join(",");

  useEffect(() => {
    if (userIds.length === 0) {
      setProfiles([]);
      return;
    }
    return subscribeToUsers(userIds, setProfiles);
  }, [key]);

  return profiles;
}
