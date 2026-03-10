"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { Home, Mail, Bot, User, Settings, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
  { label: "Home", href: "/dashboard", icon: Home, exact: true },
  { label: "Mail", href: "/dashboard/mail", icon: Mail, exact: false },
  { label: "AI Configuration", href: "/dashboard/ai-configuration", icon: Bot, exact: false },
  { label: "Profile", href: "/dashboard/profile", icon: User, exact: false },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, exact: false },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { signOut } = useClerk();

  return (
    <Sidebar collapsible="none" className="!h-screen sticky top-0 border-r">
      <SidebarHeader className="items-center justify-center py-4">
        <Link href="/dashboard">
          <Image src="/logo.svg" alt="Mecat" width={28} height={28} />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className="justify-center"
                    >
                      <Link href={item.href}>
                        <item.icon />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="items-center pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              className="justify-center text-destructive hover:text-destructive"
              onClick={() => signOut({ redirectUrl: "/" })}
            >
              <LogOut />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}