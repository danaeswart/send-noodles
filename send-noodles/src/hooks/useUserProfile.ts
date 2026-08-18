import { useEffect, useState } from "react";

import { subscribeToUserProfile } from "../../firebase/users";
import type { UserProfile, WithId } from "../../firebase/types";

export function useUserProfile(userId: string | null) {
  const [profile, setProfile] = useState<WithId<UserProfile> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    return subscribeToUserProfile(userId, (next) => {
      setProfile(next);
      setLoading(false);
    });
  }, [userId]);

  return { profile, loading };
}
