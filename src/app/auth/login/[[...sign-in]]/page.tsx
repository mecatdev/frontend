"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SignIn, useUser } from "@clerk/nextjs";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;
    if (user) router.replace("/auth/redirect");
  }, [isLoaded, user, router]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to continue</p>
        </div>

        <SignIn
          signUpUrl="/auth/register"
          forceRedirectUrl="/auth/redirect"
        />
      </div>
    </main>
  );
}
