"use client";

import { use, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiFetch } from "@/lib/api";
import type { MyBusiness } from "@/api/v1/business/route";
import { VerifiedDashboard } from "@/app/dashboard/components/verified-dashboard";
import { PendingDashboard } from "@/app/dashboard/components/pending-dashboard";
import { VerificationForm } from "@/app/dashboard/components/verification-form";

type Props = { params: Promise<{ id: string }> };

export default function BusinessManagePage({ params }: Props) {
  const { id } = use(params);
  const [business, setBusiness] = useState<MyBusiness | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const data = await apiFetch<MyBusiness>(`/businesses/${id}`, {});
    setBusiness(data);
  }

  useEffect(() => {
    load().catch(() => {}).finally(() => setLoading(false));
  }, [id]); // eslint-disable-line

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex items-center justify-center p-16">
        <p className="text-sm text-red-500">Business not found.</p>
      </div>
    );
  }

  if (business.verificationStatus === "VERIFIED") return <VerifiedDashboard business={business} />;
  if (business.verificationStatus === "PENDING") {
    return (
      <PendingDashboard
        business={business}
        isOwner
        onResolved={() => load()}
        verifiedRedirectPath={`/dashboard/business/${id}`}
        retryRedirectPath={`/dashboard/business/${id}`}
      />
    );
  }

  return (
    <VerificationForm
      businessId={id}
      status={business.verificationStatus}
      redirectPath={`/dashboard/business/${id}`}
      onSuccess={() => load()}
    />
  );
}
