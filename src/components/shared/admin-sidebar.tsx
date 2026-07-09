"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe2,
  Tags,
  Landmark,
  CalendarDays,
  Users,
  Compass,
  UserCog,
  Ticket,
  Star,
  ArrowLeft,
} from "lucide-react";

import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Обзор", icon: LayoutDashboard, exact: true },
  { href: "/admin/cities", label: "Города", icon: Globe2 },
  { href: "/admin/categories", label: "Категории", icon: Tags },
  { href: "/admin/places", label: "Места", icon: Landmark },
  { href: "/admin/events", label: "События", icon: CalendarDays },
  { href: "/admin/guides", label: "Гиды", icon: Users },
  { href: "/admin/tours", label: "Экскурсии", icon: Compass },
  { href: "/admin/users", label: "Пользователи", icon: UserCog },
  { href: "/admin/bookings", label: "Бронирования", icon: Ticket },
  { href: "/admin/reviews", label: "Отзывы", icon: Star },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-secondary/30 p-4">
      <Link href="/map" className="mb-6 flex items-center gap-2 px-2 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Вернуться в приложение
      </Link>
      <nav className="space-y-1">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary",
              )}
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
