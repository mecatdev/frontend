"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { getMyBusiness } from "@/api/v1/business/route";

export default function AuthRedirectPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.replace("/auth/login");
      return;
    }

    const role = (user.unsafeMetadata?.role ?? user.publicMetadata?.role) as string | undefined;

    if (role === "FOUNDER") {
      router.replace("/dashboard");
      return;
    }

    if (role === "INVESTOR") {
      router.replace("/home");
      return;
    }

    // fallback for legacy accounts with no role metadata
    getMyBusiness()
      .then(() => router.replace("/dashboard"))
      .catch((e: Error & { status?: number }) => {
        if (e.status === 404) {
          router.replace("/onboarding");
        } else if (e.status === 403) {
          router.replace("/home");
        } else {
          router.replace("/auth/login");
        }
      });
  }, [isLoaded, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Redirecting...</p>
    </div>
  );
}
