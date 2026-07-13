"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Radio, Sparkles } from "lucide-react";

import { CitySearch } from "@/features/search/components/city-search";
import { Badge } from "@/components/ui/badge";
import { getEventTiming } from "@/features/events/utils";

export interface HeroEvent {
  id: string;
  slug: string;
  titleRu: string;
  coverImage: string;
  address: string;
  startAt: Date;
  endAt: Date;
}

// Decorative fallback for when there's no real event with a real photo yet
// (e.g. a brand-new environment before the first import run) — otherwise
// the hero would render an empty grid.
const PLACEHOLDER_COLLAGE = [
  { seed: "registan-hero", className: "col-span-2 row-span-2" },
  { seed: "shahi-zinda-hero", className: "" },
  { seed: "bazaar-hero", className: "" },
  { seed: "guide-hero", className: "" },
  { seed: "food-hero", className: "" },
];

function startsInLabel(event: HeroEvent): string {
  const timing = getEventTiming(event.startAt, event.endAt);
  if (timing.isLiveNow) return "Сейчас идёт";
  const minutes = Math.round((new Date(event.startAt).getTime() - Date.now()) / 60_000);
  if (minutes < 60) return `Начинается через ${minutes} мин`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Начинается через ${hours} ч`;
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(
    new Date(event.startAt),
  );
}

export function HeroSection({ events }: { events: HeroEvent[] }) {
  const collage =
    events.length > 0
      ? events
          .slice(0, 5)
          .map((e, i) => ({ ...e, className: i === 0 ? "col-span-2 row-span-2" : "" }))
      : null;
  const badgeEvent = events[0];
  return (
    <section className="relative overflow-hidden pb-20 pt-16 sm:pt-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,hsl(var(--primary)/0.18),transparent_40%),radial-gradient(circle_at_85%_0%,hsl(var(--sunset)/0.16),transparent_35%),radial-gradient(circle_at_50%_100%,hsl(var(--primary)/0.1),transparent_45%)]"
      />

      <div className="container grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="live" className="mb-6 gap-1.5 py-1.5 pl-2 pr-3">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-pulse-live rounded-full bg-sunset" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-sunset" />
              </span>
              Живая карта города
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-balance font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          >
            Всё, что происходит вокруг вас — <span className="text-primary">прямо сейчас</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 max-w-xl text-balance text-lg text-muted-foreground"
          >
            Достопримечательности, гиды, экскурсии, концерты и рестораны одного города — в одном
            приложении. Больше не нужно искать в десяти вкладках Google, Telegram и Instagram.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-10"
          >
            <CitySearch />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-primary" /> События в реальном времени
            </span>
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Самарканд — первый город на платформе
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative hidden sm:block"
        >
          <div className="grid h-[440px] grid-cols-2 gap-3">
            {collage
              ? collage.map((event, i) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.slug}`}
                    className={`relative overflow-hidden rounded-3xl shadow-lg ${event.className}`}
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <Image
                      src={event.coverImage}
                      alt={event.titleRu}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 320px, 50vw"
                      priority={i === 0}
                    />
                  </Link>
                ))
              : PLACEHOLDER_COLLAGE.map((item, i) => (
                  <div
                    key={item.seed}
                    className={`relative overflow-hidden rounded-3xl shadow-lg ${item.className}`}
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <Image
                      src={`/api/placeholder/${item.seed}?w=700&h=700`}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 320px, 50vw"
                      priority={i === 0}
                    />
                  </div>
                ))}
          </div>
          {badgeEvent && (
            <Link
              href={`/events/${badgeEvent.slug}`}
              className="glass-panel absolute -bottom-6 -left-6 flex items-center gap-3 rounded-2xl p-4 transition-transform hover:-translate-y-0.5"
            >
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-pulse-live rounded-full bg-sunset" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sunset" />
              </span>
              <div>
                <p className="line-clamp-1 text-sm font-semibold">{startsInLabel(badgeEvent)}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">{badgeEvent.titleRu}</p>
              </div>
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  );
}
