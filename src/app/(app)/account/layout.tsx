import Link from "next/link";
import { redirect } from "next/navigation";
import { User, Heart, Ticket, Settings } from "lucide-react";

import { auth } from "@/lib/auth";

const NAV = [
  { href: "/account", label: "Профиль", icon: User },
  { href: "/account/favorites", label: "Избранное", icon: Heart },
  { href: "/account/bookings", label: "Мои бронирования", icon: Ticket },
  { href: "/account/settings", label: "Настройки", icon: Settings },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in?callbackUrl=/account");

  return (
    <div className="mx-auto h-full max-w-5xl overflow-y-auto px-4 py-8 sm:px-6">
      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <aside className="no-scrollbar flex gap-2 overflow-x-auto md:flex-col md:gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </Link>
          ))}
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
