"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { MapPinned, Map, CalendarDays, Users, LayoutDashboard } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { SearchCommand } from "@/features/search/components/search-command";
import { cn, initials } from "@/lib/utils";

const LINKS = [
  { href: "/map", label: "Карта", icon: Map },
  { href: "/search", label: "Поиск", icon: CalendarDays },
  { href: "/guides", label: "Гиды", icon: Users },
];

export function AppTopbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="glass-panel z-40 flex h-16 shrink-0 items-center gap-3 border-b px-4 sm:px-6">
      <Link href="/" className="flex items-center gap-2 font-display text-base font-semibold">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <MapPinned className="h-4.5 w-4.5" />
        </span>
        <span className="hidden sm:inline">Aziz</span>
      </Link>

      <nav className="ml-2 hidden items-center gap-1 md:flex">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
              pathname.startsWith(l.href)
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
            )}
          >
            <l.icon className="h-4 w-4" /> {l.label}
          </Link>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <SearchCommand />
        <LanguageSwitcher />
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full ring-offset-2 ring-offset-background transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="h-9 w-9">
                <AvatarImage src={session?.user?.image ?? undefined} />
                <AvatarFallback>{initials(session?.user?.name ?? "U")}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem asChild>
              <Link href="/account">Профиль</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/account/bookings">Мои бронирования</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/account/favorites">Избранное</Link>
            </DropdownMenuItem>
            {(session?.user?.role === "ADMIN" || session?.user?.role === "SUPERADMIN") && (
              <DropdownMenuItem asChild>
                <Link href="/admin">
                  <LayoutDashboard className="h-4 w-4" /> Админ-панель
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>Выйти</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
