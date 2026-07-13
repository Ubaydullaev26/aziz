import Image from "next/image";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { getEventTiming } from "@/features/events/utils";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatPrice } from "@/lib/utils";

export async function LiveNowSection() {
  const events = await prisma.event.findMany({
    where: { isPublished: true, endAt: { gte: new Date() } },
    orderBy: { startAt: "asc" },
    take: 6,
    select: {
      id: true,
      slug: true,
      titleRu: true,
      coverImage: true,
      startAt: true,
      endAt: true,
      address: true,
      ticketTypes: { select: { price: true, currency: true }, take: 1 },
      category: { select: { nameRu: true, color: true } },
    },
  });

  if (events.length === 0) return null;

  return (
    <section id="live" className="py-20">
      <div className="container">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-wide text-primary">
              Живой город
            </p>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Сейчас в городе
            </h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            Мы отслеживаем время начала и окончания каждого события — карта показывает, что
            происходит рядом с вами прямо в эту минуту.
          </p>
        </div>

        <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          {events.map((event, i) => {
            const timing = getEventTiming(event.startAt, event.endAt);
            const price = event.ticketTypes[0]?.price;
            return (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                style={{ animationDelay: `${i * 60}ms` }}
                className="animate-fade-up group relative w-72 shrink-0 overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl sm:w-auto"
              >
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src={event.coverImage}
                    alt={event.titleRu}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(min-width: 1024px) 360px, 288px"
                  />
                  {timing.isLiveNow && (
                    <Badge variant="live" className="absolute left-3 top-3 gap-1.5 backdrop-blur">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-pulse-live rounded-full bg-sunset" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sunset" />
                      </span>
                      Сейчас идёт
                    </Badge>
                  )}
                  {!timing.isLiveNow && timing.startsSoon && (
                    <Badge variant="secondary" className="absolute left-3 top-3 backdrop-blur">
                      Скоро начнётся
                    </Badge>
                  )}
                </div>
                <div className="space-y-2 p-4">
                  <p className="text-xs font-medium" style={{ color: event.category.color }}>
                    {event.category.nameRu}
                  </p>
                  <h3 className="line-clamp-1 font-display text-base font-semibold">
                    {event.titleRu}
                  </h3>
                  <p className="line-clamp-1 text-xs text-muted-foreground">{event.address}</p>
                  <div className="flex items-center justify-between pt-1 text-sm">
                    <span className="text-muted-foreground">{formatDateTime(event.startAt)}</span>
                    <span className="font-semibold">{formatPrice(price)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
