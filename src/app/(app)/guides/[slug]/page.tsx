import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, ShieldCheck, Languages, Briefcase, CalendarClock } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { GuideBookButton } from "@/features/booking/components/guide-book-button";
import { ReviewSection } from "@/features/reviews/components/review-section";
import { ShareButton } from "@/features/guides/components/share-button";
import { formatPrice, formatDateTime } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = await prisma.guide.findUnique({ where: { slug }, select: { name: true } });
  if (!guide) return {};
  return { title: guide.name };
}

async function getGuide(slug: string) {
  return prisma.guide.findUnique({
    where: { slug },
    include: {
      city: { select: { nameRu: true } },
      places: { select: { slug: true, nameRu: true } },
      availabilities: { where: { startAt: { gte: new Date() }, isActive: true }, orderBy: { startAt: "asc" }, take: 10 },
      reviews: { orderBy: { createdAt: "desc" }, take: 20, include: { user: { select: { name: true, image: true } } } },
    },
  });
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full ring-4 ring-background">
          <Image src={guide.avatar} alt={guide.name} fill className="object-cover" />
        </div>
        <div>
          <h1 className="flex items-center justify-center gap-1.5 font-display text-2xl font-semibold sm:justify-start">
            {guide.name}
            {guide.isVerified && <ShieldCheck className="h-5 w-5 text-primary" />}
          </h1>
          <p className="mt-1 flex items-center justify-center gap-1 text-sm font-medium sm:justify-start">
            <Star className="h-4 w-4 fill-sunset text-sunset" /> {guide.rating.toFixed(1)}
            <span className="text-muted-foreground">({guide.reviewCount} отзывов)</span>
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground sm:justify-start">
            <span className="flex items-center gap-1.5">
              <Languages className="h-4 w-4" /> {guide.languages.join(", ").toUpperCase()}
            </span>
            <span className="flex items-center gap-1.5">
              <Briefcase className="h-4 w-4" /> {guide.experienceYears} лет опыта
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {guide.bioRu && <p className="text-sm leading-relaxed text-muted-foreground">{guide.bioRu}</p>}

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

          <div>
            <h3 className="mb-3 font-display text-sm font-semibold">Отзывы ({guide.reviewCount})</h3>
            <ReviewSection
              targetType="GUIDE"
              targetId={guide.id}
              reviews={guide.reviews}
              queryKeyToInvalidate={["guide-page", slug]}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <span className="text-sm text-muted-foreground">Стоимость</span>
            <span className="font-display text-lg font-semibold">
              {formatPrice(guide.pricePerHour, guide.currency)}
              <span className="text-sm font-normal text-muted-foreground"> / час</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <ShareButton name={guide.name} slug={guide.slug} />
            <GuideBookButton
              guideName={guide.name}
              pricePerHour={guide.pricePerHour}
              currency={guide.currency}
              availabilities={guide.availabilities}
            />
          </div>

          {guide.availabilities.length > 0 && (
            <div>
              <h3 className="mb-2 flex items-center gap-1.5 font-display text-sm font-semibold">
                <CalendarClock className="h-4 w-4" /> Ближайшие слоты
              </h3>
              <div className="space-y-1.5">
                {guide.availabilities.slice(0, 6).map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg bg-secondary/60 px-3 py-2 text-xs">
                    <span>{formatDateTime(a.startAt)}</span>
                    <Badge variant="outline">{a.capacity - a.bookedCount} мест</Badge>
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
