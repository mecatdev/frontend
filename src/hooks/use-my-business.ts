"use client";

import { useEffect, useState } from "react";
import { getMyBusiness, type MyBusiness } from "@/api/v1/business/route";

export function useMyBusiness() {
  const [business, setBusiness] = useState<MyBusiness | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUnauthenticated, setIsUnauthenticated] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    getMyBusiness()
      .then(setBusiness)
      .catch((e: unknown) => {
        const status = (e as Error & { status?: number }).status;
        if (status === 401) {
          setIsUnauthenticated(true);
        } else if (status === 404) {
          setIsNotFound(true);
        } else {
          setError(e instanceof Error ? e.message : "Failed to load business");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return { business, error, loading, isUnauthenticated, isNotFound };
}
