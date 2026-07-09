import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { PlaceForm } from "@/features/admin/places/place-form";

export const metadata: Metadata = { title: "Новое место · Админ" };

export default async function NewPlacePage() {
  const [cities, categories] = await Promise.all([
    prisma.city.findMany({ select: { id: true, nameRu: true } }),
    prisma.category.findMany({ where: { isEventCategory: false }, select: { id: true, nameRu: true }, orderBy: { position: "asc" } }),
  ]);

  return (
    <div>
      <AdminPageHeader title="Новое место" />
      <PlaceForm cities={cities} categories={categories} />
    </div>
  );
}
