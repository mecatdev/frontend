"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

type Props = {
  children: ReactNode;
};

export function InvestorGuard({ children }: Props) {
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
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) return null;
  if (!user) return null;
  const role = (user.unsafeMetadata?.role ?? user.publicMetadata?.role) as string;
  if (role === "FOUNDER") return null;

  return <>{children}</>;
}
