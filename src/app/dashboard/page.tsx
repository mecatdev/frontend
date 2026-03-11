"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { getMyBusinesses } from "@/api/v1/business/route";
import type { MyBusiness } from "@/api/v1/business/route";
import { BusinessCard } from "@/app/dashboard/components/business-card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [businesses, setBusinesses] = useState<MyBusiness[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getToken()
      .then((token) => getMyBusinesses(token))
      .then(setBusinesses)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [getToken]);

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Businesses</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your businesses and their AI knowledge.</p>
          </div>
          <Button onClick={() => router.push("/onboarding")}>+ Add Business</Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-36 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <p className="text-muted-foreground">Belum ada bisnis terdaftar.</p>
            <Button onClick={() => router.push("/onboarding")}>Buat Bisnis Pertama</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {businesses.map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
