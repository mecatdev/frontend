"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SignUp, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Building2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

type UserRole = "INVESTOR" | "FOUNDER";

const roles: { 
  value: UserRole; 
  label: string; 
  icon: React.ElementType; 
  redirect: string }[] 
  = [
  { 
    value: "INVESTOR", 
    label: "Investor", 
    icon: TrendingUp, 
    redirect: "/home" 
  },
  { 
    value: "FOUNDER", 
    label: "Business (MSMEs)", 
    icon: Building2, 
    redirect: "/onboarding" 
  },
];

function RegisterForm() {
  const params = useSearchParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const initial: UserRole = params.get("role") === "FOUNDER" ? "FOUNDER" : "INVESTOR";
  const [role, setRole] = useState<UserRole>(initial);

  useEffect(() => {
    if (!isLoaded) return;
    if (user) router.replace("/auth/redirect");
  }, [isLoaded, user, router]);
  const active = roles.find((r) => r.value === role)!;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Create account</h1>
        <p className="text-sm text-muted-foreground">
          Get started as an investor or business
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 w-full p-1 rounded-xl bg-secondary">
        {roles.map((r) => (
          <button
            key={r.value}
            onClick={() => setRole(r.value)}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
              role === r.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <r.icon size={16} />
            {r.label}
          </button>
        ))}
      </div>

      <SignUp
        signInUrl="/auth/login"
        forceRedirectUrl={active.redirect}
        unsafeMetadata={{ role }}
      />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <Suspense>
        <RegisterForm />
      </Suspense>
    </main>
  );
}
