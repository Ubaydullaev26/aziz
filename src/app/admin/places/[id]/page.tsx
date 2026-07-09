import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { PlaceForm } from "@/features/admin/places/place-form";

export const metadata: Metadata = { title: "Редактировать место · Админ" };

export default async function EditPlacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [place, cities, categories] = await Promise.all([
    prisma.place.findUnique({
      where: { id },
      include: { images: { orderBy: { position: "asc" } }, openingHours: { orderBy: { dayOfWeek: "asc" } } },
    }),
    prisma.city.findMany({ select: { id: true, nameRu: true } }),
    prisma.category.findMany({ where: { isEventCategory: false }, select: { id: true, nameRu: true }, orderBy: { position: "asc" } }),
  ]);
  if (!place) notFound();

  return (
    <div>
      <AdminPageHeader title={`Редактировать: ${place.nameRu}`} />
      <PlaceForm
        cities={cities}
        categories={categories}
        placeId={place.id}
        defaultValues={{
          slug: place.slug,
          cityId: place.cityId,
          categoryId: place.categoryId,
          nameRu: place.nameRu,
          nameEn: place.nameEn,
          nameUz: place.nameUz,
          shortDescriptionRu: place.shortDescriptionRu ?? "",
          shortDescriptionEn: place.shortDescriptionEn ?? "",
          shortDescriptionUz: place.shortDescriptionUz ?? "",
          descriptionRu: place.descriptionRu,
          descriptionEn: place.descriptionEn,
          descriptionUz: place.descriptionUz,
          historyRu: place.historyRu ?? "",
          historyEn: place.historyEn ?? "",
          historyUz: place.historyUz ?? "",
          address: place.address,
          latitude: place.latitude,
          longitude: place.longitude,
          priceLevel: place.priceLevel,
          priceFrom: place.priceFrom ?? undefined,
          currency: place.currency,
          phone: place.phone ?? "",
          website: place.website ?? "",
          coverImage: place.coverImage,
          isFeatured: place.isFeatured,
          isPublished: place.isPublished,
          images: place.images.map((i) => ({ url: i.url })),
          hours:
            place.openingHours.length === 7
              ? place.openingHours.map((h) => ({
                  dayOfWeek: h.dayOfWeek,
                  opensAt: h.opensAt ?? "",
                  closesAt: h.closesAt ?? "",
                  isClosed: h.isClosed,
                }))
              : Array.from({ length: 7 }, (_, dayOfWeek) => ({
                  dayOfWeek,
                  opensAt: "09:00",
                  closesAt: "18:00",
                  isClosed: false,
                })),
        }}
      />
    </div>
  );
}
