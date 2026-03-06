"use client";

import { useBusinessContext } from "@/app/dashboard/context/business-context";
import { VerifiedDashboard } from "@/app/dashboard/components/verified-dashboard";
import { VerificationForm } from "@/app/dashboard/components/verification-form";

export default function DashboardPage() {
  const business = useBusinessContext();

  return business.verificationStatus === "VERIFIED"
    ? <VerifiedDashboard business={business} />
    : <VerificationForm status={business.verificationStatus} />;
}

