"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, Mail, Bot, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Dashboard", href: "/home/dashboard", icon: LayoutDashboard },
  { label: "Mail", href: "/home/mail", icon: Mail },
];

export function HomeSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="none" className="!h-screen sticky top-0 border-r">
      <SidebarHeader className="items-center justify-center py-4">
        <Link href="/home">
          <Image src="/logo.svg" alt="Mecat" width={28} height={28} />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.href === "/home"
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
    </Sidebar>
  );
}
