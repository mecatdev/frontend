"use client";

import { useEffect, useState } from "react";
import { getMyBusiness, type MyBusiness } from "@/api/businesses";

export function useMyBusiness() {
  const [business, setBusiness] = useState<MyBusiness | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUnauthenticated, setIsUnauthenticated] = useState(false);

  useEffect(() => {
    getMyBusiness()
      .then(setBusiness)
      .catch((e: unknown) => {
        const status = (e as Error & { status?: number }).status;
        if (status === 401) {
          setIsUnauthenticated(true);
        } else if (status === 404) {
          setBusiness(null);
        } else {
          setError(e instanceof Error ? e.message : "Failed to load business");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return { business, error, loading, isUnauthenticated };
}
