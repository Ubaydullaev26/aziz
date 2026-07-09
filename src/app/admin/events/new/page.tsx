import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { EventForm } from "@/features/admin/events/event-form";

export const metadata: Metadata = { title: "Новое событие · Админ" };

export default async function NewEventPage() {
  const [cities, categories, places] = await Promise.all([
    prisma.city.findMany({ select: { id: true, nameRu: true } }),
    prisma.category.findMany({ where: { isEventCategory: true }, select: { id: true, nameRu: true }, orderBy: { position: "asc" } }),
    prisma.place.findMany({ select: { id: true, nameRu: true } }),
  ]);

  return (
    <div>
      <AdminPageHeader title="Новое событие" />
      <EventForm cities={cities} categories={categories} places={places} />
    </div>
  );
}
