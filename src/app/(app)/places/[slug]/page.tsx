import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Clock, Languages, ShieldCheck } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlaceActions } from "@/features/places/components/place-actions";
import { TourBookButton } from "@/features/booking/components/tour-book-button";
import { ReviewSection } from "@/features/reviews/components/review-section";
import { cn, formatPrice } from "@/lib/utils";

const DAY_NAMES = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const place = await prisma.place.findUnique({ where: { slug }, select: { nameRu: true, shortDescriptionRu: true } });
  if (!place) return {};
  return { title: place.nameRu, description: place.shortDescriptionRu ?? undefined };
}

async function getPlace(slug: string) {
  return prisma.place.findUnique({
    where: { slug },
    include: {
      city: { select: { nameRu: true, slug: true } },
      category: { select: { key: true, nameRu: true, icon: true, color: true } },
      images: { orderBy: { position: "asc" } },
      openingHours: { orderBy: { dayOfWeek: "asc" } },
      guides: { where: { isPublished: true } },
      tours: {
        where: { isPublished: true },
        include: {
          availabilities: { where: { startAt: { gte: new Date() }, isActive: true }, orderBy: { startAt: "asc" }, take: 6 },
        },
      },
      reviews: { orderBy: { createdAt: "desc" }, take: 20, include: { user: { select: { name: true, image: true } } } },
    },
  });
}

export default async function PlacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const place = await getPlace(slug);
  if (!place) notFound();

  const todayIndex = new Date().getDay();
  const today = place.openingHours.find((h) => h.dayOfWeek === todayIndex);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="relative h-80 w-full overflow-hidden rounded-3xl">
        <Image src={place.coverImage} alt={place.nameRu} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/10" />
        <Badge
          className="absolute left-5 top-5 border-none text-white backdrop-blur"
          style={{ backgroundColor: `${place.category.color}CC` }}
        >
          {place.category.nameRu}
        </Badge>
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <h1 className="font-display text-3xl font-semibold drop-shadow sm:text-4xl">{place.nameRu}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-white/90">
            <MapPin className="h-4 w-4" /> {place.address}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1 font-medium">
              <Star className="h-4 w-4 fill-sunset text-sunset" /> {place.rating.toFixed(1)}
              <span className="text-muted-foreground">({place.reviewCount} отзывов)</span>
            </span>
            <span className="font-semibold">{formatPrice(place.priceFrom, place.currency)}</span>
            {today && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {today.isClosed ? "Сегодня закрыто" : `${today.opensAt}–${today.closesAt}`}
              </span>
            )}
          </div>

          <Tabs defaultValue="description">
            <TabsList>
              <TabsTrigger value="description">Описание</TabsTrigger>
              {place.historyRu && <TabsTrigger value="history">История</TabsTrigger>}
              <TabsTrigger value="hours">Часы работы</TabsTrigger>
              <TabsTrigger value="reviews">Отзывы ({place.reviewCount})</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>{place.descriptionRu}</p>
              {place.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {place.images.map((img) => (
                    <div key={img.id} className="relative h-24 overflow-hidden rounded-xl">
                      <Image src={img.url} alt={img.alt ?? ""} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            {place.historyRu && (
              <TabsContent value="history" className="text-sm leading-relaxed text-muted-foreground">
                {place.historyRu}
              </TabsContent>
            )}
            <TabsContent value="hours" className="space-y-1">
              {DAY_NAMES.map((label, i) => {
                const h = place.openingHours.find((oh) => oh.dayOfWeek === i);
                return (
                  <div
                    key={i}
                    className={cn("flex justify-between text-sm", i === todayIndex && "font-semibold text-foreground")}
                  >
                    <span>{label}</span>
                    <span className="text-muted-foreground">
                      {h?.isClosed || !h ? "Выходной" : `${h.opensAt}–${h.closesAt}`}
                    </span>
                  </div>
                );
              })}
            </TabsContent>
            <TabsContent value="reviews">
              <ReviewSection
                targetType="PLACE"
                targetId={place.id}
                reviews={place.reviews}
                queryKeyToInvalidate={["place-page", slug]}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <PlaceActions
            id={place.id}
            slug={place.slug}
            nameRu={place.nameRu}
            descriptionRu={place.descriptionRu}
            latitude={place.latitude}
            longitude={place.longitude}
          />

          {place.guides.length > 0 && (
            <div>
              <h3 className="mb-3 font-display text-sm font-semibold">Доступные гиды</h3>
              <div className="space-y-2">
                {place.guides.map((guide) => (
                  <Link
                    key={guide.id}
                    href={`/guides/${guide.slug}`}
                    className="flex items-center gap-3 rounded-xl border border-border p-2.5 transition-colors hover:bg-secondary"
                  >
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
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
                  </Link>
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
                    <p className="text-sm font-medium">{tour.titleRu}</p>
                    <p className="mb-2 text-xs text-muted-foreground">
                      {tour.durationMinutes} мин · до {tour.maxGroupSize} чел ·{" "}
                      {formatPrice(tour.price, tour.currency)}
                    </p>
                    <TourBookButton
                      title={tour.titleRu}
                      price={tour.price}
                      currency={tour.currency}
                      availabilities={tour.availabilities}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
