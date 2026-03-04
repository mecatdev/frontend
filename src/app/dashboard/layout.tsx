import { ReactNode } from "react";
import { DashboardSidebar } from "@/app/components/sidebar";

type Props = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: Props) {
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