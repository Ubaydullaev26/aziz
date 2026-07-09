"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Clock, Languages, ShieldCheck } from "lucide-react";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlaceDetail } from "@/features/places/hooks/use-place-detail";
import { PlaceActions } from "@/features/places/components/place-actions";
import { ReviewSection } from "@/features/reviews/components/review-section";
import { BookingDialog, type BookingOption } from "@/features/booking/components/booking-dialog";
import { useMapStore } from "@/features/map/store";
import { cn, formatPrice, formatDateTime } from "@/lib/utils";

const DAY_NAMES = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

export function PlaceDetailSheet({ slug, onClose }: { slug: string; onClose: () => void }) {
  const { data: place, isLoading } = usePlaceDetail(slug);
  const select = useMapStore((s) => s.select);
  const [bookingTour, setBookingTour] = React.useState<{
    title: string;
    options: BookingOption[];
  } | null>(null);

  const todayIndex = new Date().getDay();

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full p-0 sm:max-w-lg">
        {isLoading || !place ? (
          <div className="space-y-4 p-6">
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : (
          <div className="pb-10">
            <div className="relative h-64 w-full">
              <Image src={place.coverImage} alt={place.nameRu} fill className="object-cover" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/10" />
              <Badge
                className="absolute left-4 top-4 border-none text-white backdrop-blur"
                style={{ backgroundColor: `${place.category.color}CC` }}
              >
                {place.category.nameRu}
              </Badge>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h2 className="font-display text-2xl font-semibold drop-shadow">{place.nameRu}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-white/90">
                  <MapPin className="h-3.5 w-3.5" /> {place.address}
                </p>
              </div>
            </div>

            <div className="space-y-6 p-6">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1 font-medium">
                  <Star className="h-4 w-4 fill-sunset text-sunset" /> {place.rating.toFixed(1)}
                  <span className="text-muted-foreground">({place.reviewCount})</span>
                </span>
                <span className="font-semibold">{formatPrice(place.priceFrom, place.currency)}</span>
                {place.openingHours.length > 0 && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {place.openingHours.find((h) => h.dayOfWeek === todayIndex)?.isClosed
                      ? "Сегодня закрыто"
                      : (() => {
                          const today = place.openingHours.find((h) => h.dayOfWeek === todayIndex);
                          return today?.opensAt ? `${today.opensAt}–${today.closesAt}` : "Часы уточняйте";
                        })()}
                  </span>
                )}
              </div>

              <PlaceActions
                id={place.id}
                slug={place.slug}
                nameRu={place.nameRu}
                descriptionRu={place.descriptionRu}
                latitude={place.latitude}
                longitude={place.longitude}
              />

              <Tabs defaultValue="description">
                <TabsList>
                  <TabsTrigger value="description">Описание</TabsTrigger>
                  {place.historyRu && <TabsTrigger value="history">История</TabsTrigger>}
                  <TabsTrigger value="reviews">Отзывы</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                  <p>{place.descriptionRu}</p>
                  {place.images.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {place.images.map((img) => (
                        <div key={img.id} className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg">
                          <Image src={img.url} alt={img.alt ?? ""} fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="space-y-1 pt-2">
                    {DAY_NAMES.map((label, i) => {
                      const h = place.openingHours.find((oh) => oh.dayOfWeek === i);
                      return (
                        <div
                          key={i}
                          className={cn(
                            "flex justify-between text-xs",
                            i === todayIndex && "font-semibold text-foreground",
                          )}
                        >
                          <span>{label}</span>
                          <span>{h?.isClosed || !h ? "Выходной" : `${h.opensAt}–${h.closesAt}`}</span>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
                {place.historyRu && (
                  <TabsContent value="history" className="text-sm leading-relaxed text-muted-foreground">
                    {place.historyRu}
                  </TabsContent>
                )}
                <TabsContent value="reviews">
                  <ReviewSection
                    targetType="PLACE"
                    targetId={place.id}
                    reviews={place.reviews}
                    queryKeyToInvalidate={["place", slug]}
                  />
                </TabsContent>
              </Tabs>

              {place.guides.length > 0 && (
                <div>
                  <h3 className="mb-3 font-display text-sm font-semibold">Доступные гиды</h3>
                  <div className="space-y-2">
                    {place.guides.map((guide) => (
                      <button
                        key={guide.id}
                        onClick={() => select({ type: "guide", slug: guide.slug })}
                        className="flex w-full items-center gap-3 rounded-xl border border-border p-2.5 text-left transition-colors hover:bg-secondary"
                      >
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full">
                          <Image src={guide.avatar} alt={guide.name} fill className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-1 truncate text-sm font-medium">
                            {guide.name}
                            {guide.isVerified && <ShieldCheck className="h-3.5 w-3.5 text-primary" />}
                          </p>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Languages className="h-3 w-3" /> {guide.languages.join(", ").toUpperCase()}
                          </p>
                        </div>
                        <div className="text-right text-xs">
                          <p className="flex items-center gap-0.5 font-medium">
                            <Star className="h-3 w-3 fill-sunset text-sunset" /> {guide.rating.toFixed(1)}
                          </p>
                          <p className="text-muted-foreground">{formatPrice(guide.pricePerHour, guide.currency)}/ч</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {place.tours.length > 0 && (
                <div>
                  <h3 className="mb-3 font-display text-sm font-semibold">Экскурсии</h3>
                  <div className="space-y-3">
                    {place.tours.map((tour) => (
                      <div key={tour.id} className="rounded-xl border border-border p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium">{tour.titleRu}</p>
                            <p className="text-xs text-muted-foreground">
                              {tour.durationMinutes} мин · до {tour.maxGroupSize} чел
                            </p>
                          </div>
                          <span className="whitespace-nowrap text-sm font-semibold">
                            {formatPrice(tour.price, tour.currency)}
                          </span>
                        </div>
                        {tour.availabilities.length > 0 ? (
                          <Button
                            size="sm"
                            className="mt-3 w-full"
                            onClick={() =>
                              setBookingTour({
                                title: tour.titleRu,
                                options: tour.availabilities.map((a) => ({
                                  id: a.id,
                                  title: formatDateTime(a.startAt),
                                  remaining: a.capacity - a.bookedCount,
                                  priceEach: tour.price,
                                  currency: tour.currency,
                                })),
                              })
                            }
                          >
                            Забронировать
                          </Button>
                        ) : (
                          <p className="mt-2 text-xs text-muted-foreground">Нет доступных дат</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button variant="link" asChild className="px-0">
                <Link href={`/places/${place.slug}`}>Открыть полную страницу →</Link>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>

      {bookingTour && (
        <BookingDialog
          open={!!bookingTour}
          onOpenChange={(open) => !open && setBookingTour(null)}
          type="TOUR"
          title={bookingTour.title}
          options={bookingTour.options}
        />
      )}
    </Sheet>
  );
}
