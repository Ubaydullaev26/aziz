"use client";

import * as React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { Menu, X, MapPinned } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { cn, initials } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#how-it-works", label: "Как это работает" },
  { href: "#live", label: "Сейчас в городе" },
  { href: "#cities", label: "Города" },
];

export function Navbar() {
  const { data: session, status } = useSession();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "sticky top-0 z-40 transition-all",
        scrolled ? "glass-panel border-b" : "border-b border-transparent",
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <MapPinned className="h-4.5 w-4.5" />
          </span>
          Aziz
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          <ThemeToggle />
          {status === "authenticated" ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-1 rounded-full ring-offset-2 ring-offset-background transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={session.user?.image ?? undefined} />
                    <AvatarFallback>{initials(session.user?.name ?? "U")}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem asChild>
                  <Link href="/map">Открыть карту</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account">Профиль</Link>
                </DropdownMenuItem>
                {(session.user?.role === "ADMIN" || session.user?.role === "SUPERADMIN") && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Админ-панель</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/sign-in">Войти</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Начать бесплатно</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Меню"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="glass-panel border-t px-4 pb-6 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-secondary"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex items-center justify-between px-3">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          <div className="mt-3 flex flex-col gap-2 px-3">
            {status === "authenticated" ? (
              <Button asChild>
                <Link href="/map">Открыть карту</Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/sign-in">Войти</Link>
                </Button>
                <Button asChild>
                  <Link href="/sign-up">Начать бесплатно</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </motion.header>
  );
}
