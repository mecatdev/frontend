"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMyBusiness } from "@/hooks/use-my-business";
import { VerifiedDashboard } from "@/app/dashboard/components/verified-dashboard";
import { VerificationForm } from "@/app/dashboard/components/verification-form";

export default function DashboardPage() {
  const router = useRouter();
  const { business, error, loading, isUnauthenticated } = useMyBusiness();

  useEffect(() => {
    if (loading) return;
    if (isUnauthenticated) router.replace("/auth/login");
    else if (!error && !business) router.replace("/onboarding");
  }, [loading, error, business, isUnauthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (!business) return null;

  return business.verificationStatus === "VERIFIED"
    ? <VerifiedDashboard business={business} />
    : <VerificationForm status={business.verificationStatus} />;
}

