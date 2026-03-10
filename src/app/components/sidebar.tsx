"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Mail, Settings, User, LogOut, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useClerk } from "@clerk/nextjs";

const menuItems = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Mail", href: "/dashboard/mail", icon: Mail },
  { label: "AI Configuration", href: "/dashboard/ai-configuration", icon: Bot },
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();

  const handleLogout = async () => {
    await signOut();
    router.push("/auth/login");
  };

  return (
    <div className="flex h-full flex-col bg-background border-r rounded-2xl">
      <div className="p-6">
        <h2 className="text-xl font-bold">Your Dashboard</h2>
      </div>

      <Separator />

      <ScrollArea className="flex-1 px-4 py-4">
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Button
                key={item.href}
                asChild
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "justify-start gap-3 rounded-xl hover:bg-primary/10 hover:text-primary",
                  isActive && "shadow-sm"
                )}
              >
                <Link href={item.href}>
                  <Icon size={18} />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-4">
        <Separator className="mb-4" />
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-500 hover:text-red-600"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Logout
        </Button>
      </div>
    </div>
  );
}