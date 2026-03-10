"use client";

import { useBusinessContext } from "@/app/dashboard/context/business-context";
import { VerifiedDashboard } from "@/app/dashboard/components/verified-dashboard";
import { PendingDashboard } from "@/app/dashboard/components/pending-dashboard";
import { VerificationForm } from "@/app/dashboard/components/verification-form";

export default function DashboardPage() {
  const business = useBusinessContext();

  if (business.verificationStatus === "VERIFIED") {
    return <VerifiedDashboard business={business} />;
  }
  if (business.verificationStatus === "PENDING") {
    return <PendingDashboard business={business} />;
  }
  // DRAFT or REJECTED → verification form
  return <VerificationForm status={business.verificationStatus} />;
}

