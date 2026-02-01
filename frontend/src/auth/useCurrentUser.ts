import { useEffect, useState } from "react";
import { me } from "../api/auth";
import type { User } from "../types/user";

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const u = await me<User>();
        if (isMounted) setUser(u);
      } catch (e: any) {
        if (isMounted) setError(e?.message || "Falha ao carregar usuário");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  return { user, loading, error };
}
