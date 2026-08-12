import { useEffect, useState } from "react";
import type { User } from "@firebase/auth";

import { subscribeToAuthUser } from "../../firebase/auth";

// True while Firebase is still restoring the persisted session from
// AsyncStorage on cold start — check this before redirecting to Login,
// otherwise a returning signed-in user flashes the login screen first.
export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthUser((nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, loading };
}
