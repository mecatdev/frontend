"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { Home, Mail, LogOut } from "lucide-react";
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
import { apiFetch } from "@/lib/api";

const navItems = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Mail", href: "/home/mail", icon: Mail },
];

export function HomeSidebar() {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    apiFetch<{ count: number }>("/mails/unread-count")
      .then((data) => setUnread(data.count))
      .catch(() => {});

    const interval = setInterval(() => {
      apiFetch<{ count: number }>("/mails/unread-count")
        .then((data) => setUnread(data.count))
        .catch(() => {});
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

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

                const showBadge = item.href === "/home/mail" && unread > 0;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className="justify-center relative"
                    >
                      <Link href={item.href}>
                        <item.icon />
                        {showBadge && (
                          <span className="absolute top-2 right-1 min-w-[16px] h-[16px] rounded-full bg-primary text-primary-foreground text-[6px] font-semibold flex items-center justify-center px-0.5 shadow-sm">
                            {unread > 9 ? "9+" : unread}
                          </span>
                        )}
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