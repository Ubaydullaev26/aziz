import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { TourForm } from "@/features/admin/tours/tour-form";

export const metadata: Metadata = { title: "Редактировать экскурсию · Админ" };

export default async function EditTourPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [tour, places, guides] = await Promise.all([
    prisma.tour.findUnique({ where: { id } }),
    prisma.place.findMany({ select: { id: true, nameRu: true } }),
    prisma.guide.findMany({ select: { id: true, name: true } }),
  ]);
  if (!tour) notFound();

  return (
    <div>
      <AdminPageHeader title={`Редактировать: ${tour.titleRu}`} />
      <TourForm
        places={places}
        guides={guides}
        tourId={tour.id}
        defaultValues={{
          slug: tour.slug,
          placeId: tour.placeId ?? "",
          guideId: tour.guideId ?? "",
          titleRu: tour.titleRu,
          titleEn: tour.titleEn,
          titleUz: tour.titleUz,
          descriptionRu: tour.descriptionRu,
          descriptionEn: tour.descriptionEn,
          descriptionUz: tour.descriptionUz,
          coverImage: tour.coverImage,
          durationMinutes: tour.durationMinutes,
          price: tour.price,
          currency: tour.currency,
          maxGroupSize: tour.maxGroupSize,
          isPublished: tour.isPublished,
        }}
      />
    </div>
  );
}
