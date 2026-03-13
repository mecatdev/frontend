"use client";
import { useBusinessContext } from "@/app/dashboard/context/business-context";
import { PendingDashboard } from "./components/pending-dashboard";
import { VerifiedDashboard } from "@/app/dashboard/components/verified-dashboard";
import { VerificationForm } from "@/app/dashboard/components/verification-form";

export default function DashboardPage() {
  const business = useBusinessContext();

  if (business.verificationStatus === "VERIFIED") {
    return <VerifiedDashboard business={business} />;
  }

  if (business.verificationStatus === "PENDING") {
    return (
      <PendingDashboard
        business={business}
        isOwner
        verifiedRedirectPath="/dashboard"
        retryRedirectPath="/dashboard"
      />
    );
  }

  return <VerificationForm businessId={business.id} status={business.verificationStatus} />;
}
