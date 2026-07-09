"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Share2, ShieldCheck, Languages, Briefcase, CalendarClock } from "lucide-react";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGuideDetail } from "@/features/guides/hooks/use-guide-detail";
import { ReviewSection } from "@/features/reviews/components/review-section";
import { BookingDialog, type BookingOption } from "@/features/booking/components/booking-dialog";
import { useShare } from "@/lib/use-share";
import { formatPrice, formatDateTime, initials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function GuideDetailSheet({ slug, onClose }: { slug: string; onClose: () => void }) {
  const { data: guide, isLoading } = useGuideDetail(slug);
  const share = useShare();
  const [booking, setBooking] = React.useState(false);

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full p-0 sm:max-w-lg">
        {isLoading || !guide ? (
          <div className="space-y-4 p-6">
            <Skeleton className="h-32 w-32 rounded-full" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : (
          <div className="space-y-6 p-6 pb-10">
            <div className="flex items-center gap-4 pt-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={guide.avatar} />
                <AvatarFallback>{initials(guide.name)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="flex items-center gap-1.5 font-display text-xl font-semibold">
                  {guide.name}
                  {guide.isVerified && <ShieldCheck className="h-4 w-4 text-primary" />}
                </h2>
                <p className="flex items-center gap-1 text-sm font-medium">
                  <Star className="h-3.5 w-3.5 fill-sunset text-sunset" /> {guide.rating.toFixed(1)}
                  <span className="text-muted-foreground">({guide.reviewCount} отзывов)</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Languages className="h-4 w-4" /> {guide.languages.join(", ").toUpperCase()}
              </span>
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" /> {guide.experienceYears} лет опыта
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <span className="text-sm text-muted-foreground">Стоимость</span>
              <span className="font-display text-lg font-semibold">
                {formatPrice(guide.pricePerHour, guide.currency)}
                <span className="text-sm font-normal text-muted-foreground"> / час</span>
              </span>
            </div>

            {guide.bioRu && <p className="text-sm leading-relaxed text-muted-foreground">{guide.bioRu}</p>}

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => share({ title: guide.name, path: `/guides/${guide.slug}` })}
              >
                <Share2 className="h-4 w-4" /> Поделиться
              </Button>
              <Button onClick={() => setBooking(true)} disabled={guide.availabilities.length === 0}>
                Забронировать
              </Button>
            </div>

            {guide.places.length > 0 && (
              <div>
                <h3 className="mb-2 font-display text-sm font-semibold">Проводит экскурсии в</h3>
                <div className="flex flex-wrap gap-2">
                  {guide.places.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/places/${p.slug}`}
                      className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                    >
                      {p.nameRu}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {guide.availabilities.length > 0 && (
              <div>
                <h3 className="mb-2 flex items-center gap-1.5 font-display text-sm font-semibold">
                  <CalendarClock className="h-4 w-4" /> Ближайшие слоты
                </h3>
                <div className="space-y-1.5">
                  {guide.availabilities.slice(0, 5).map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between rounded-lg bg-secondary/60 px-3 py-2 text-xs"
                    >
                      <span>{formatDateTime(a.startAt)}</span>
                      <Badge variant="outline">{a.capacity - a.bookedCount} мест</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="mb-3 font-display text-sm font-semibold">Отзывы</h3>
              <ReviewSection
                targetType="GUIDE"
                targetId={guide.id}
                reviews={guide.reviews}
                queryKeyToInvalidate={["guide", slug]}
              />
            </div>
          </div>
        )}
      </SheetContent>

      {guide && booking && (
        <BookingDialog
          open={booking}
          onOpenChange={setBooking}
          type="GUIDE"
          title={`Бронирование гида: ${guide.name}`}
          options={guide.availabilities.map<BookingOption>((a) => ({
            id: a.id,
            title: formatDateTime(a.startAt),
            subtitle: `до ${formatDateTime(a.endAt)}`,
            remaining: a.capacity - a.bookedCount,
            priceEach: guide.pricePerHour ?? 0,
            currency: guide.currency,
          }))}
        />
      )}
    </Sheet>
  );
}
