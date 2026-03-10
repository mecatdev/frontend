import type { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { HomeSidebar } from "./components/home-sidebar";
import { InvestorGuard } from "./components/investor-guard";

type Props = {
  children: ReactNode;
};

export default function HomeLayout({ children }: Props) {
  return (
    <InvestorGuard>
      <SidebarProvider
        defaultOpen={false}
        style={
          {
            "--sidebar-width": "3.5rem",
            "--sidebar-width-icon": "3.5rem",
          } as React.CSSProperties
        }
      >
        <HomeSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </InvestorGuard>
  );
}
