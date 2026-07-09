"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Search, Users, User } from "lucide-react";

import { cn } from "@/lib/utils";

const TABS = [
  { href: "/map", label: "Карта", icon: Map },
  { href: "/search", label: "Поиск", icon: Search },
  { href: "/guides", label: "Гиды", icon: Users },
  { href: "/account", label: "Профиль", icon: User },
];

export function MobileTabbar() {
  const pathname = usePathname();

  return (
    <nav className="glass-panel fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t px-2 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] md:hidden">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 text-xs font-medium transition-colors",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <tab.icon className="h-5 w-5" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
