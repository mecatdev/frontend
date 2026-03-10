"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Home, LayoutDashboard, Mail, User, LogOut } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
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
  { label: "Home", href: "/home", icon: Home },
  { label: "Dashboard", href: "/home/dashboard", icon: LayoutDashboard },
  { label: "Mail", href: "/home/mail", icon: Mail },
  { label: "Profile", href: "/home/profile", icon: User },
];

export function HomeSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();

  const handleLogout = async () => {
    await signOut();
    router.push("/auth/login");
  };

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

      <SidebarFooter className="pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              className="justify-center text-red-500 hover:text-red-600"
              onClick={handleLogout}
            >
              <LogOut />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
