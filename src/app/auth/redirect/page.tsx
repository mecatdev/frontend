"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";
import { apiFetch } from "@/lib/api";
import type { MyBusiness } from "@/api/v1/business/route";

export default function AuthRedirectPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

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
    // use getToken() from useAuth — guaranteed to be in sync with Clerk session
    getToken().then((token) =>
      apiFetch<MyBusiness>("/businesses/me", {}, token)
        .then(() => router.replace("/dashboard"))
        .catch((e: Error & { status?: number }) => {
          if (e.status === 404) {
            // authenticated FOUNDER, but no business yet
            router.replace("/onboarding");
          } else if (e.status === 403) {
            // backend explicitly says not a founder (INVESTOR role on backend)
            router.replace("/home");
          } else {
            // token issue or backend down — send to onboarding to pick a role
            router.replace("/home");
          }
        })
    );
  }, [isLoaded, user, router, getToken]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Redirecting...</p>
    </div>
  );
}
