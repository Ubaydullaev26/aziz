import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { EventForm } from "@/features/admin/events/event-form";
import { toDateTimeLocalValue } from "@/lib/utils";

export const metadata: Metadata = { title: "Редактировать событие · Админ" };

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, cities, categories, places] = await Promise.all([
    prisma.event.findUnique({
      where: { id },
      include: { images: { orderBy: { position: "asc" } }, ticketTypes: true },
    }),
    prisma.city.findMany({ select: { id: true, nameRu: true } }),
    prisma.category.findMany({ where: { isEventCategory: true }, select: { id: true, nameRu: true }, orderBy: { position: "asc" } }),
    prisma.place.findMany({ select: { id: true, nameRu: true } }),
  ]);
  if (!event) notFound();

  return (
    <div>
      <AdminPageHeader title={`Редактировать: ${event.titleRu}`} />
      <EventForm
        cities={cities}
        categories={categories}
        places={places}
        eventId={event.id}
        defaultValues={{
          slug: event.slug,
          cityId: event.cityId,
          categoryId: event.categoryId,
          placeId: event.placeId ?? "",
          titleRu: event.titleRu,
          titleEn: event.titleEn,
          titleUz: event.titleUz,
          descriptionRu: event.descriptionRu,
          descriptionEn: event.descriptionEn,
          descriptionUz: event.descriptionUz,
          coverImage: event.coverImage,
          organizer: event.organizer,
          address: event.address,
          latitude: event.latitude,
          longitude: event.longitude,
          startAt: toDateTimeLocalValue(event.startAt),
          endAt: toDateTimeLocalValue(event.endAt),
          timezone: event.timezone,
          isFeatured: event.isFeatured,
          isPublished: event.isPublished,
          images: event.images.map((i) => ({ url: i.url })),
          ticketTypes: event.ticketTypes.map((t) => ({
            ticketTypeId: t.id,
            name: t.name,
            price: t.price,
            currency: t.currency,
            totalQuantity: t.totalQuantity,
          })),
        }}
      />
    </div>
  );
}
