"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Share2, Heart, Navigation2, CalendarClock, Ticket, Loader2 } from "lucide-react";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEventDetail } from "@/features/events/hooks/use-event-detail";
import { useFavoriteToggle } from "@/features/favorites/hooks/use-favorite-toggle";
import { ReviewSection } from "@/features/reviews/components/review-section";
import { BookingDialog, type BookingOption } from "@/features/booking/components/booking-dialog";
import { useShare } from "@/lib/use-share";
import { formatPrice, formatDateTime } from "@/lib/utils";

export function EventDetailSheet({ slug, onClose }: { slug: string; onClose: () => void }) {
  const { data: event, isLoading } = useEventDetail(slug);
  const favoriteToggle = useFavoriteToggle("EVENT");
  const share = useShare();
  const [booking, setBooking] = React.useState(false);

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full p-0 sm:max-w-lg">
        {isLoading || !event ? (
          <div className="space-y-4 p-6">
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : (
          <div className="pb-10">
            <div className="relative h-64 w-full">
              <Image src={event.coverImage} alt={event.titleRu} fill className="object-cover" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/10" />
              <div className="absolute left-4 top-4 flex gap-2">
                <Badge
                  className="border-none text-white backdrop-blur"
                  style={{ backgroundColor: `${event.category.color}CC` }}
                >
                  {event.category.nameRu}
                </Badge>
                {event.timing.isLiveNow && (
                  <Badge variant="live" className="gap-1.5 backdrop-blur">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-pulse-live rounded-full bg-sunset" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sunset" />
                    </span>
                    Сейчас идёт
                  </Badge>
                )}
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h2 className="font-display text-2xl font-semibold drop-shadow">{event.titleRu}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-white/90">
                  <MapPin className="h-3.5 w-3.5" /> {event.address}
                </p>
              </div>
            </div>

            <div className="space-y-6 p-6">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1 font-medium">
                  <Star className="h-4 w-4 fill-sunset text-sunset" /> {event.rating.toFixed(1)}
                  <span className="text-muted-foreground">({event.reviewCount})</span>
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {formatDateTime(event.startAt)} – {formatDateTime(event.endAt)}
                </span>
              </div>

              <p className="text-sm text-muted-foreground">Организатор: {event.organizer}</p>

              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" className="flex-col gap-1 py-3" asChild>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Navigation2 className="h-4 w-4" />
                    <span className="text-xs">Маршрут</span>
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="flex-col gap-1 py-3"
                  onClick={() =>
                    share({ title: event.titleRu, text: event.descriptionRu.slice(0, 100), path: `/events/${event.slug}` })
                  }
                >
                  <Share2 className="h-4 w-4" />
                  <span className="text-xs">Поделиться</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex-col gap-1 py-3"
                  disabled={favoriteToggle.isPending}
                  onClick={() => favoriteToggle.mutate(event.id)}
                >
                  {favoriteToggle.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Heart className="h-4 w-4" />
                  )}
                  <span className="text-xs">Сохранить</span>
                </Button>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">{event.descriptionRu}</p>

              {event.place && (
                <Link
                  href={`/places/${event.place.slug}`}
                  className="block rounded-xl border border-border p-3 text-sm hover:bg-secondary"
                >
                  Место проведения: <span className="font-medium">{event.place.nameRu}</span>
                </Link>
              )}

              <div>
                <h3 className="mb-3 flex items-center gap-1.5 font-display text-sm font-semibold">
                  <Ticket className="h-4 w-4" /> Билеты
                </h3>
                <div className="space-y-2">
                  {event.ticketTypes.map((t) => {
                    const remaining = t.totalQuantity - t.soldQuantity;
                    return (
                      <div
                        key={t.id}
                        className="flex items-center justify-between rounded-xl border border-border p-3 text-sm"
                      >
                        <div>
                          <p className="font-medium">{t.name}</p>
                          <p className="text-xs text-muted-foreground">Осталось: {remaining}</p>
                        </div>
                        <span className="font-semibold">{formatPrice(t.price, t.currency)}</span>
                      </div>
                    );
                  })}
                </div>
                {!event.timing.hasEnded && (
                  <Button className="mt-3 w-full" onClick={() => setBooking(true)}>
                    Купить билет
                  </Button>
                )}
              </div>

              <EventReviews eventId={event.id} slug={slug} reviews={event.reviews} />
            </div>
          </div>
        )}
      </SheetContent>

      {event && booking && (
        <BookingDialog
          open={booking}
          onOpenChange={setBooking}
          type="EVENT"
          title={event.titleRu}
          options={event.ticketTypes.map<BookingOption>((t) => ({
            id: t.id,
            title: t.name,
            remaining: t.totalQuantity - t.soldQuantity,
            priceEach: t.price,
            currency: t.currency,
          }))}
        />
      )}
    </Sheet>
  );
}

function EventReviews({
  eventId,
  slug,
  reviews,
}: {
  eventId: string;
  slug: string;
  reviews: React.ComponentProps<typeof ReviewSection>["reviews"];
}) {
  return (
    <div>
      <h3 className="mb-3 font-display text-sm font-semibold">Отзывы</h3>
      <ReviewSection
        targetType="EVENT"
        targetId={eventId}
        reviews={reviews}
        queryKeyToInvalidate={["event", slug]}
      />
    </div>
  );
}
