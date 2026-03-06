"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useMyBusiness } from "@/hooks/use-my-business";
import { BusinessContext } from "@/app/dashboard/context/business-context";

type Props = {
  children: ReactNode;
};

export function AuthGuard({ children }: Props) {
  const router = useRouter();
  const { business, error, loading, isUnauthenticated } = useMyBusiness();

  useEffect(() => {
    if (loading) return;
    if (isUnauthenticated || error || !business) {
      router.replace("/");
    }
  }, [loading, error, business, isUnauthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  if (!business) return null;

  return (
    <BusinessContext.Provider value={business}>
      {children}
    </BusinessContext.Provider>
  );
}
