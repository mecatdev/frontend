import { ReactNode } from "react";
import { DashboardSidebar } from "@/app/components/sidebar";
import { AuthGuard } from "@/app/dashboard/components/auth-guard";

type Props = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: Props) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <aside className="hidden md:block w-64">
          <DashboardSidebar />
        </aside>
        <main className="flex-1 p-8 bg-muted/40">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}