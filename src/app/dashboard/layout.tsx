import { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/app/dashboard/components/sidebar";
import { AuthGuard } from "@/app/dashboard/components/auth-guard";

type Props = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: Props) {
  return (
    <AuthGuard>
      <SidebarProvider
        defaultOpen={false}
        style={
          {
            "--sidebar-width": "3.5rem",
            "--sidebar-width-icon": "3.5rem",
          } as React.CSSProperties
        }
      >
        <DashboardSidebar />
        <SidebarInset>
          <main className="bg-muted/40 min-h-screen">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}