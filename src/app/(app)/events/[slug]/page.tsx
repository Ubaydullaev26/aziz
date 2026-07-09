import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, CalendarClock, Ticket } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { EventActions } from "@/features/events/components/event-actions";
import { EventTicketButton } from "@/features/booking/components/event-ticket-button";
import { ReviewSection } from "@/features/reviews/components/review-section";
import { getEventTiming } from "@/features/events/utils";
import { formatPrice, formatDateTime } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug }, select: { titleRu: true } });
  if (!event) return {};
  return { title: event.titleRu };
}

async function getEvent(slug: string) {
  return prisma.event.findUnique({
    where: { slug },
    include: {
      city: { select: { nameRu: true } },
      category: { select: { key: true, nameRu: true, icon: true, color: true } },
      place: { select: { slug: true, nameRu: true } },
      images: { orderBy: { position: "asc" } },
      ticketTypes: true,
      reviews: { orderBy: { createdAt: "desc" }, take: 20, include: { user: { select: { name: true, image: true } } } },
    },
  });
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const timing = getEventTiming(event.startAt, event.endAt);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="relative h-80 w-full overflow-hidden rounded-3xl">
        <Image src={event.coverImage} alt={event.titleRu} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/10" />
        <div className="absolute left-5 top-5 flex gap-2">
          <Badge className="border-none text-white backdrop-blur" style={{ backgroundColor: `${event.category.color}CC` }}>
            {event.category.nameRu}
          </Badge>
          {timing.isLiveNow && (
            <Badge variant="live" className="gap-1.5 backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-pulse-live rounded-full bg-sunset" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sunset" />
              </span>
              Сейчас идёт
            </Badge>
          )}
        </div>
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <h1 className="font-display text-3xl font-semibold drop-shadow sm:text-4xl">{event.titleRu}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-white/90">
            <MapPin className="h-4 w-4" /> {event.address}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1 font-medium">
              <Star className="h-4 w-4 fill-sunset text-sunset" /> {event.rating.toFixed(1)}
              <span className="text-muted-foreground">({event.reviewCount} отзывов)</span>
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" />
              {formatDateTime(event.startAt)} – {formatDateTime(event.endAt)}
            </span>
          </div>

          <p className="text-sm text-muted-foreground">Организатор: {event.organizer}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{event.descriptionRu}</p>

          {event.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {event.images.map((img) => (
                <div key={img.id} className="relative h-24 overflow-hidden rounded-xl">
                  <Image src={img.url} alt={img.alt ?? ""} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}

          {event.place && (
            <Link
              href={`/places/${event.place.slug}`}
              className="block rounded-xl border border-border p-3 text-sm hover:bg-secondary"
            >
              Место проведения: <span className="font-medium">{event.place.nameRu}</span>
            </Link>
          )}

          <div>
            <h3 className="mb-3 font-display text-sm font-semibold">Отзывы ({event.reviewCount})</h3>
            <ReviewSection
              targetType="EVENT"
              targetId={event.id}
              reviews={event.reviews}
              queryKeyToInvalidate={["event-page", slug]}
            />
          </div>
        </div>

        <div className="space-y-6">
          <EventActions
            id={event.id}
            slug={event.slug}
            titleRu={event.titleRu}
            descriptionRu={event.descriptionRu}
            latitude={event.latitude}
            longitude={event.longitude}
          />

          <div>
            <h3 className="mb-3 flex items-center gap-1.5 font-display text-sm font-semibold">
              <Ticket className="h-4 w-4" /> Билеты
            </h3>
            <div className="space-y-2">
              {event.ticketTypes.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">Осталось: {t.totalQuantity - t.soldQuantity}</p>
                  </div>
                  <span className="font-semibold">{formatPrice(t.price, t.currency)}</span>
                </div>
              ))}
            </div>
            {!timing.hasEnded && (
              <div className="mt-3">
                <EventTicketButton title={event.titleRu} ticketTypes={event.ticketTypes} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
