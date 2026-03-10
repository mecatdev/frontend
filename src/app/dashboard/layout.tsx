"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { DashboardSidebar } from "@/app/components/sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) router.replace("/auth/login");
  }, [isLoaded, user, router]);

  if (!isLoaded || !user) return null;

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:block w-64">
        <DashboardSidebar />
      </aside>
      <main className="flex-1 p-8 bg-muted/40">
        {children}
      </main>
    </div>
  );
}
