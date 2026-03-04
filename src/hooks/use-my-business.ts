"use client";

import { useEffect, useState } from "react";
import { getMyBusiness, type MyBusiness } from "@/api/businesses";

export function useMyBusiness() {
  const [business, setBusiness] = useState<MyBusiness | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // No userId in localStorage → not authenticated yet, treat as empty (not error)
    const userId = typeof window !== "undefined" ? localStorage.getItem("mecat_user_id") : null;
    if (!userId) {
      setLoading(false);
      return;
    }

    getMyBusiness()
      .then(setBusiness)
      .catch((e: unknown) => {
        const status = (e as Error & { status?: number }).status;
        // 404 = no business yet, 401 = not authed — both are expected states, not errors
        if (status === 404 || status === 401) {
          setBusiness(null);
        } else {
          setError(e instanceof Error ? e.message : "Failed to load business");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return { business, error, loading };
}
